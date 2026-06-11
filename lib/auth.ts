// lib/auth.ts
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import UserService from './services/userService'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }
        
        try {
          const user = await UserService.findByEmail(credentials.email)
          
          if (!user || !user.password) {
            throw new Error('Invalid credentials')
          }
          
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isPasswordValid) {
            throw new Error('Invalid credentials')
          }
          
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image
          }
        } catch (error: any) {
          throw new Error(error.message || 'Error during sign in')
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      try {
        if (session.user?.email) {
          const user = await UserService.findByEmail(session.user.email)
          if (user) {
            session.user.id = user._id.toString()
          }
        }
        return session
      } catch (error) {
        console.error('Session callback error:', error)
        return session
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}