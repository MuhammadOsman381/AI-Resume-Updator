export const runtime = "nodejs";

import jwt from "jsonwebtoken";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import NextAuth from "next-auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, user.email));

      if (!existingUser.length) {
        await db.insert(users).values({
          id: user.id,
          name: user.name ?? null,
          email: user.email,
          image: user.image ?? null,
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: token.name,
        email: token.email,
        image: token.image as string,
      };
      const signedToken = jwt.sign(
        {
          id: token.id,
          name: token.name,
          email: token.email,
          image: token.image,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      (session as any).jwt = signedToken;
      return session;
    }
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
