// app/api/content/bulk-actions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import clientPromise from '@/lib/mongodb'
import { ContentDocument } from '@/lib/models/content'
import { authOptions } from "@/lib/auth"
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, itemIds } = await request.json()
    
    if (!action || !itemIds || !Array.isArray(itemIds)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('spaced_repetition')
    const collection = db.collection<ContentDocument>('contents')

    const objectIds = itemIds.map(id => new ObjectId(id))
    const filter = {
      _id: { $in: objectIds },
      userId: session.user.id,
      isActive: true
    }

    let result
    switch (action) {
      case 'delete':
        result = await collection.updateMany(filter, {
          $set: { isActive: false, updatedAt: new Date() }
        })
        break
      case 'archive':
        result = await collection.updateMany(filter, {
          $set: { archived: true, updatedAt: new Date() }
        })
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({
      message: `${result.modifiedCount} items ${action}d successfully`,
      modifiedCount: result.modifiedCount
    })
  } catch (error) {
    console.error('Bulk action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}