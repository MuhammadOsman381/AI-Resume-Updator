import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    jwt?: string;
  }

  interface JWT {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}
