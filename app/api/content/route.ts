// app/api/content/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import clientPromise from '@/lib/mongodb'
import { ContentDocument } from '@/lib/models/content'
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, subject, tags, images } = body

    if (!content || !subject) {
      return NextResponse.json({ error: 'Content and subject are required' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('spaced_repetition')
    const collection = db.collection<ContentDocument>('contents')

    const now = new Date()
    const nextReviewDate = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Tomorrow

    const newContent: ContentDocument = {
      userId: session.user.id,
      title,
      content,
      subject,
      tags: tags || [],
      images: images || [],
      createdAt: now,
      updatedAt: now,
      nextReviewDate,
      reviewCount: 0,
      isActive: true
    }

    const result = await collection.insertOne(newContent)
    
    return NextResponse.json({ 
      success: true, 
      id: result.insertedId,
      message: 'Content created successfully'
    })
  } catch (error) {
    console.error('Create content error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const subject = searchParams.get('subject')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const search = searchParams.get('search')

    const client = await clientPromise
    const db = client.db('spaced_repetition')
    const collection = db.collection<ContentDocument>('contents')

    let filter: any = { userId: session.user.id, isActive: true }
    
    if (subject) {
      filter['subject.id'] = subject
    }
    
    if (tags && tags.length > 0) {
      filter.tags = { $in: tags }
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (page - 1) * limit
    const contents = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await collection.countDocuments(filter)

    return NextResponse.json({
      contents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get contents error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}