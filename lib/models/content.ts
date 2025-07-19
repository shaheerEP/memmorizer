// lib/models/content.ts
import { ObjectId } from 'mongodb'

export interface Subject {
  id: string
  name: string
  color: string
  createdAt: Date
}

export interface ReviewDate {
  date: Date
  completed: boolean
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
  reviewDates: ReviewDate[] // New field to replace nextReviewDate and reviewCount
  difficulty?: 'easy' | 'medium' | 'hard'
  reviewStage: 'daily' | 'weekly' | 'monthly' | 'yearly'
  estimatedTime?: string
  isActive: boolean
  archived?: boolean
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
  { userId: 1, 'reviewDates.date': 1 }, // For review queries (updated)
  { userId: 1, createdAt: -1 }, // For content library
  { userId: 1, 'subject.id': 1 }, // For subject filtering
  { userId: 1, tags: 1 }, // For tag filtering
]

// User subjects collection indexes
export const userSubjectsIndexes = [
  { userId: 1 }, // Unique constraint
]