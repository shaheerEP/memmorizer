// lib/auth.ts
import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import UserService from './services/userService'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const existingUser = await UserService.findByEmail(user.email as string)
                     
          if (!existingUser) {
            await UserService.createUser({
              email: user.email as string,
              name: user.name as string,
              image: user.image,
              googleId: account.providerAccountId,
            })
          }
                     
          return true
        } catch (error) {
          console.error('Error during sign in:', error)
          return false
        }
      }
      return true
    },
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
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
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