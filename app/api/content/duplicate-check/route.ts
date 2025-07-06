// app/api/content/duplicate-check/route.ts
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
    const { content } = body

    if (!content || content.length < 50) {
      return NextResponse.json({ isDuplicate: false })
    }

    const client = await clientPromise
    const db = client.db('spaced_repetition')
    const collection = db.collection<ContentDocument>('contents')

    // Simple duplicate detection using text search
    const duplicate = await collection.findOne({
      userId: session.user.id,
      isActive: true,
      content: { $regex: content.substring(0, 100), $options: 'i' }
    })

    return NextResponse.json({ isDuplicate: !!duplicate })
  } catch (error) {
    console.error('Duplicate check error:', error)
    return NextResponse.json({ isDuplicate: false })
  }
}