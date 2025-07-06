// lib/models/content.ts
import { ObjectId } from 'mongodb'

export interface Subject {
  id: string
  name: string
  color: string
  createdAt: Date
}

export interface ContentDocument {
  _id?: ObjectId
  userId: string
  title?: string
  content: string
  subject: Subject
  tags: string[]
  images?: string[]
  createdAt: Date
  updatedAt: Date
  nextReviewDate?: Date // Make this optional
  reviewCount: number
  difficulty?: 'easy' | 'medium' | 'hard'
  reviewStage: 'daily' | 'weekly' | 'monthly' | 'yearly' // Add this field
  estimatedTime?: string // Add this field
  isActive: boolean
}

export interface UserSubject {
  _id?: ObjectId
  userId: string
  subjects: Subject[]
  createdAt: Date
  updatedAt: Date
}

// Content collection indexes for performance
export const contentIndexes = [
  { userId: 1, nextReviewDate: 1 }, // For review queries
  { userId: 1, createdAt: -1 }, // For content library
  { userId: 1, 'subject.id': 1 }, // For subject filtering
  { userId: 1, tags: 1 }, // For tag filtering
]

// User subjects collection indexes
export const userSubjectsIndexes = [
  { userId: 1 }, // Unique constraint
]