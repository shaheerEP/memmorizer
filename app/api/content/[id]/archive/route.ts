// app/api/content/[id]/archive/route.ts
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

    // Add an 'archived' field to the content model
    const result = await collection.updateOne(
      {
        _id: new ObjectId(params.id),
        userId: session.user.id,
        isActive: true
      },
      { 
        $set: { 
          archived: true,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Content archived successfully' })
  } catch (error) {
    console.error('Archive content error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

