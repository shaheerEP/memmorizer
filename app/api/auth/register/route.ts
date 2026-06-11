import { NextResponse } from 'next/server'
// import UserService from '@/lib/services/userService'
// import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  // Registration is disabled because only the admin can use this app
  return NextResponse.json(
    { message: 'Registration is disabled. Only the admin can use this app.' },
    { status: 403 }
  )
}
