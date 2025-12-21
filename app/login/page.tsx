"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect } from "react";

export default function Login() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.jwt) {
      console.log("Signed JWT token:", session.jwt);
      localStorage.setItem("authorization", session.jwt); 
    }
  }, [session]);

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div>
      {!session && <button onClick={() => signIn("google")}>Sign in with Google</button>}
      {session && (
        <div>
          <p>Signed in as {session.user?.email}</p>
          <button onClick={() => signOut()}>Sign out</button>
        </div>
      )}
    </div>
  );
}
