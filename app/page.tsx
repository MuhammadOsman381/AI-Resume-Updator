"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      if (session.jwt) {
        localStorage.setItem("token", session.jwt); // store JWT
      }
      router.push("/user");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <Card className="w-[350px] shadow-none">
        <CardContent className="flex flex-col gap-4">
          {!session && (
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 w-full h-auto text-md"
              onClick={() => signIn("google")}
            >
              <img
                src="data:image/jpeg;base64,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"
                alt="Google"
                className="w-7 h-7 rounded-full"
              />
              Sign in with Google
            </Button>
          )}

          {session && (
            <div className="text-center">
              <p className="text-gray-700 mb-4">Signed in as {session.user?.email}</p>
              <Button variant="destructive" onClick={() => signOut()}>
                Sign out
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
