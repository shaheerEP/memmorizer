// app/api/content/today/route.ts
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

    const client = await clientPromise
    const db = client.db('spaced_repetition')
    const collection = db.collection<ContentDocument>('contents')

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get content that has review dates scheduled for today
    const todaysContent = await collection
      .find({
        userId: session.user.id,
        isActive: true,
        reviewDates: {
          $elemMatch: {
            date: {
              $gte: today,
              $lt: tomorrow
            },
            completed: false // Only get uncompleted reviews
          }
        }
      })
      .sort({ createdAt: -1 })
      .toArray()

    // Add additional fields for compatibility with existing frontend code
    const processedContent = todaysContent.map(item => {
      // Find today's review date
      const todayReview = item.reviewDates?.find(review => {
        const reviewDate = new Date(review.date)
        reviewDate.setHours(0, 0, 0, 0)
        return reviewDate.getTime() === today.getTime() && !review.completed
      })

      // Calculate review stage based on completed reviews count
      const completedReviews = item.reviewDates?.filter(r => r.completed).length || 0
      const reviewStage = determineReviewStage(completedReviews)

      return {
        ...item,
        reviewStage,
        scheduledDate: todayReview?.date || new Date(),
        // For backward compatibility, you can calculate these if needed
        reviewCount: completedReviews,
        nextReviewDate: todayReview?.date
      }
    })

    return NextResponse.json({
      content: processedContent,
      total: processedContent.length
    })
  } catch (error) {
    console.error('Get today content error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to determine review stage based on completed reviews
function determineReviewStage(completedCount: number): 'daily' | 'weekly' | 'monthly' | 'yearly' {
  if (completedCount < 2) return 'daily'
  if (completedCount < 5) return 'weekly'
  if (completedCount < 8) return 'monthly'
  return 'yearly'
}