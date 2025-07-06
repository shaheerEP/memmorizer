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

    // Get content due for review today
    const todaysContent = await collection
      .find({
        userId: session.user.id,
        isActive: true,
        nextReviewDate: {
          $gte: today,
          $lt: tomorrow
        }
      })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      content: todaysContent,
      total: todaysContent.length
    })
  } catch (error) {
    console.error('Get today content error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}