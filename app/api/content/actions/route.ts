// app/api/content/actions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.warn("⚠️ Unauthorized access attempt")
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch (e) {
      console.error("❌ Invalid JSON in request:", e)
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const { action, contentId } = body

    if (!action || !contentId) {
      console.warn("⚠️ Missing required fields:", body)
      return NextResponse.json({ error: "Missing action or contentId" }, { status: 400 })
    }

    console.log("✅ Action received:", action, "Content ID:", contentId)

    const client = await clientPromise
    const db = client.db('spaced_repetition')
    const collection = db.collection('contents')

    if (action === 'reviewed') {
      const item = await collection.findOne({ 
        _id: new ObjectId(contentId), 
        userId: session.user.id 
      })

      if (!item) {
        console.warn("⚠️ Content not found for ID:", contentId)
        return NextResponse.json({ error: 'Content not found' }, { status: 404 })
      }

      // Find today's date
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Find the review date that matches today and mark it as completed
      const reviewDates = item.reviewDates || []
      let updated = false

      const updatedReviewDates = reviewDates.map((review: any) => {
        const reviewDate = new Date(review.date)
        reviewDate.setHours(0, 0, 0, 0)
        
        // If this is today's review and not completed yet, mark as completed
        if (reviewDate.getTime() === today.getTime() && !review.completed) {
          updated = true
          return { ...review, completed: true }
        }
        return review
      })

      if (!updated) {
        console.warn("⚠️ No pending review found for today for content:", contentId)
        return NextResponse.json({ error: 'No pending review found for today' }, { status: 400 })
      }

      // Update the document
      await collection.updateOne(
        { _id: new ObjectId(contentId) },
        {
          $set: { 
            reviewDates: updatedReviewDates,
            updatedAt: new Date() 
          }
        }
      )

      console.log("✅ Review updated for content:", contentId)
      return NextResponse.json({ success: true })
    }

    console.warn("⚠️ Invalid action provided:", action)
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('❌ Internal server error in content/actions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}