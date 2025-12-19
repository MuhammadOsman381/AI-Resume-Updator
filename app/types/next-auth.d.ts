import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // add the user id
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    // you can add role or other fields here if needed
  }
}
