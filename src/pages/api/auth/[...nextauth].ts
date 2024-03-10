import NextAuth from "next-auth/next";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import dbConnect from "@/lib/dbConnect";
import User from "../../../../models/User";

declare module 'next-auth' {
  interface Profile {
    picture: String | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "string" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        const { username, password } = credentials as {
          username: string;
          password: string;
        };

        try {
          await dbConnect();
          console.log('Connected to MongoDB database in NextAuth route')

          // check if user already exists
          const user = await User.findOne({ username });
          if (!user) return null;

          // check if passwords match
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (!passwordsMatch) return null;
          const sessionUser = {
            id: uuid(),
            name: user.username,
            email: user.email,
            image: user.image || null,
          }
          console.log('in authorize callback', sessionUser);
          return sessionUser;
        } catch (error) {
          throw new Error('credentials invalid or database connection failed in auth route')
        }
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  // debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/signup'
  },
  callbacks: {
    async session({ session, token, user }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
        }
      };
    }
  }
}

export default NextAuth(authOptions);