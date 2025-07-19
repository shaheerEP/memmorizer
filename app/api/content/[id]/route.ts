// app/api/content/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import clientPromise from '@/lib/mongodb'
import { ContentDocument } from '@/lib/models/content'
import { authOptions } from "@/lib/auth"
import { ObjectId } from 'mongodb'

// GET - Get single content item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db('spaced_repetition')
    const collection = db.collection<ContentDocument>('contents')

    const content = await collection.findOne({
      _id: new ObjectId(params.id),
      userId: session.user.id,
      isActive: true
    })

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: content._id?.toString(),
      title: content.title || 'Untitled',
      content: content.content,
      subject: content.subject,
      tags: content.tags || [],
      difficulty: content.difficulty || 'medium',
      reviewStage: content.reviewStage || 'daily',
      estimatedTime: content.estimatedTime || '5 min',
      createdAt: content.createdAt,
      updatedAt: content.updatedAt
    })
  } catch (error) {
    console.error('Get content error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update content item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const client = await clientPromise
    const db = client.db('spaced_repetition')
    const collection = db.collection<ContentDocument>('contents')

    const updateData = {
      title: data.title,
      content: data.content,
      subject: data.subject,
      tags: data.tags || [],
      difficulty: data.difficulty,
      reviewStage: data.reviewStage,
      estimatedTime: data.estimatedTime,
      updatedAt: new Date()
    }

    const result = await collection.updateOne(
      {
        _id: new ObjectId(params.id),
        userId: session.user.id,
        isActive: true
      },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Content updated successfully' })
  } catch (error) {
    console.error('Update content error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete content item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db('spaced_repetition')
    const collection = db.collection<ContentDocument>('contents')

    const result = await collection.updateOne(
      {
        _id: new ObjectId(params.id),
        userId: session.user.id,
        isActive: true
      },
      { 
        $set: { 
          isActive: false,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Content deleted successfully' })
  } catch (error) {
    console.error('Delete content error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

