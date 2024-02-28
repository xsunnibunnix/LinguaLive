import NextAuth from "next-auth/next";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
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
        username: { label: "Username", type: "text" },
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        console.log(credentials)
        const { username, email, password } = credentials as {
          username: string;
          email: string;
          password: string;
        };

        try {
          await dbConnect();
          console.log('Connected to MongoDB database in NextAuth route')

          // check if user already exists
          // TODO add logic to verify password
          // TODO add password hashing
          const userExists = await User.findOne({ username, email, password });
          console.log('user found', userExists);

          if (userExists) return userExists;
          else return null;
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
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/login'
  },
  callbacks: {
    async signIn(credentials) {
      console.log('in the signIn function')
      console.log(credentials)

      try {
        await dbConnect();
        console.log('Connected to MongoDB database in signIn function')
        // // check if user already exists
        // const userExists = await User.findOne({ email: profile?.email });
        // // // if not, create a new user
        // if (!userExists) {
        //   await User.create({
        //     email: profile?.email,
        //     username: profile?.name?.replace(/\s/g, '').toLowerCase(),
        //     profile_pic: profile?.image || profile?.picture
        //   })
        // }
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    }
  }
}

export default NextAuth(authOptions);

function authorize(credentials: any, req: any): any {
  throw new Error("Function not implemented.");
}
