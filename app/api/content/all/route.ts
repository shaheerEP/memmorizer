// app/api/content/all/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import clientPromise from '@/lib/mongodb'
import { ContentDocument } from '@/lib/models/content'
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const subject = searchParams.get('subject')
    const reviewStage = searchParams.get('reviewStage')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const client = await clientPromise
    const db = client.db('spaced_repetition')
    const collection = db.collection<ContentDocument>('contents')

    // Build filter object
    let filter: any = { 
      userId: session.user.id, 
      isActive: true 
    }

    // Subject filter
    if (subject && subject !== 'All') {
      filter['subject.name'] = subject
    }

    // Review stage filter
    if (reviewStage && reviewStage !== 'All') {
      filter.reviewStage = reviewStage
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'All') {
      filter.difficulty = difficulty
    }

    // Search filter
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { 'subject.name': { $regex: search, $options: 'i' } }
      ]
    }

    // Build sort object
    const sortObj: any = {}
    const sortDirection = sortOrder === 'desc' ? -1 : 1
    
    switch (sortBy) {
      case 'title':
        sortObj.title = sortDirection
        break
      case 'subject':
        sortObj['subject.name'] = sortDirection
        break
      case 'nextReview':
        sortObj.nextReviewDate = sortDirection
        break
      case 'difficulty':
        sortObj.difficulty = sortDirection
        break
      case 'reviewStage':
        sortObj.reviewStage = sortDirection
        break
      default:
        sortObj.createdAt = sortDirection
    }

    const skip = (page - 1) * limit

    // Execute query with aggregation to calculate review statistics
    const [contents, total, stats] = await Promise.all([
      collection
        .find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
      collection.aggregate([
        { $match: { userId: session.user.id, isActive: true } },
        {
          $group: {
            _id: null,
            totalItems: { $sum: 1 },
            dailyReviews: {
              $sum: {
                $cond: [{ $eq: ['$reviewStage', 'daily'] }, 1, 0]
              }
            },
            weeklyReviews: {
              $sum: {
                $cond: [{ $eq: ['$reviewStage', 'weekly'] }, 1, 0]
              }
            },
            monthlyReviews: {
              $sum: {
                $cond: [{ $eq: ['$reviewStage', 'monthly'] }, 1, 0]
              }
            },
            yearlyReviews: {
              $sum: {
                $cond: [{ $eq: ['$reviewStage', 'yearly'] }, 1, 0]
              }
            },
            easyItems: {
              $sum: {
                $cond: [{ $eq: ['$difficulty', 'easy'] }, 1, 0]
              }
            },
            mediumItems: {
              $sum: {
                $cond: [{ $eq: ['$difficulty', 'medium'] }, 1, 0]
              }
            },
            hardItems: {
              $sum: {
                $cond: [{ $eq: ['$difficulty', 'hard'] }, 1, 0]
              }
            },
            subjectCounts: {
              $push: '$subject.name'
            },
            dueTodayCount: {
              $sum: {
                $cond: [
                  {
                    $lte: ['$nextReviewDate', new Date()]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]).toArray()
    ])

    // Process subject counts
    const subjectStats = stats[0]?.subjectCounts.reduce((acc: any, subject: string) => {
      acc[subject] = (acc[subject] || 0) + 1
      return acc
    }, {}) || {}

    // Transform the data to match the frontend format
    const transformedContents = contents.map(item => ({
      id: item._id?.toString(),
      title: item.title || 'Untitled',
      content: item.content,
      subject: {
        name: item.subject.name,
        color: item.subject.color || 'bg-gray-500'
      },
      reviewStage: item.reviewStage || 'daily',
      nextReview: item.nextReviewDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      dateAdded: item.createdAt.toISOString().split('T')[0],
      difficulty: item.difficulty || 'medium',
      tags: item.tags || [],
      reviewCount: item.reviewCount || 0,
      estimatedTime: item.estimatedTime || '5 min'
    }))

    return NextResponse.json({
      contents: transformedContents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        totalItems: stats[0]?.totalItems || 0,
        dueTodayCount: stats[0]?.dueTodayCount || 0,
        reviewStages: {
          daily: stats[0]?.dailyReviews || 0,
          weekly: stats[0]?.weeklyReviews || 0,
          monthly: stats[0]?.monthlyReviews || 0,
          yearly: stats[0]?.yearlyReviews || 0
        },
        difficulties: {
          easy: stats[0]?.easyItems || 0,
          medium: stats[0]?.mediumItems || 0,
          hard: stats[0]?.hardItems || 0
        },
        subjects: subjectStats
      }
    })
  } catch (error) {
    console.error('Get all contents error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}