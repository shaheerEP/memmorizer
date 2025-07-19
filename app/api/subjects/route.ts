// app/api/subjects/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import clientPromise from '@/lib/mongodb'
import { UserSubject, Subject } from '@/lib/models/content'
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db('spaced_repetition')
    const collection = db.collection<UserSubject>('user_subjects')

    const userSubjects = await collection.findOne({ userId: session.user.id })
    
    return NextResponse.json({ 
      subjects: userSubjects?.subjects || []
    })
  } catch (error) {
    console.error('Get subjects error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, color } = body

    if (!name || !color) {
      return NextResponse.json({ error: 'Name and color are required' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('spaced_repetition')
    const collection = db.collection<UserSubject>('user_subjects')

    const newSubject: Subject = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      color,
      createdAt: new Date()
    }

    const result = await collection.updateOne(
      { userId: session.user.id },
      { 
        $push: { subjects: newSubject },
        $setOnInsert: { 
          userId: session.user.id,
          createdAt: new Date()
        },
        $set: { updatedAt: new Date() }
      },
      { upsert: true }
    )

    return NextResponse.json({ 
      success: true, 
      subject: newSubject,
      message: 'Subject created successfully'
    })
  } catch (error) {
    console.error('Create subject error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}