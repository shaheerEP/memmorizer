// app/api/content/[id]/duplicate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import clientPromise from '@/lib/mongodb'
import { ContentDocument } from '@/lib/models/content'
import { authOptions } from "@/lib/auth"
import { ObjectId } from 'mongodb'

export async function POST(
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

    // Get original content
    const originalContent = await collection.findOne({
      _id: new ObjectId(params.id),
      userId: session.user.id,
      isActive: true
    })

    if (!originalContent) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Create duplicate
    const duplicatedContent: ContentDocument = {
      userId: session.user.id,
      title: `${originalContent.title} (Copy)`,
      content: originalContent.content,
      subject: originalContent.subject,
      tags: originalContent.tags || [],
      difficulty: originalContent.difficulty || 'medium',
      reviewStage: 'daily', // Reset to daily for new content
      estimatedTime: originalContent.estimatedTime || '5 min',
      createdAt: new Date(),
      updatedAt: new Date(),
      nextReviewDate: new Date(),
      reviewCount: 0,
      isActive: true
    }

    const result = await collection.insertOne(duplicatedContent)

    return NextResponse.json({
      id: result.insertedId.toString(),
      message: 'Content duplicated successfully'
    })
  } catch (error) {
    console.error('Duplicate content error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

