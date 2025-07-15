// src/components/AuthForm.tsx
"use client"; // This must be a Client Component

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import { createClient } from "@/src/lib/supabase/client"; // Use client-side Supabase client
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">(""); // For styling messages
  const router = useRouter(); // Initialize useRouter

  const supabase = createClient(); // Get the client-side Supabase instance

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setMessageType("error");
    } else {
      setMessage("Signed in successfully!");
      setMessageType("success");
      // On successful sign-in, redirect to the admin dashboard
      router.push("/admin"); // <--- ADD THIS REDIRECT
      router.refresh(); // Forces a re-render of server components
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/confirm`, // Ensure this path is correct for email confirmation
      },
    });

    if (error) {
      setMessage(error.message);
      setMessageType("error");
    } else {
      setMessage("Check your email for a confirmation link!");
      setMessageType("success");
      // On successful sign-up (pending email verification), you might want to redirect to a "check email" page
      // or simply leave them on this page with the message. For now, let's also redirect to admin
      // assuming email confirmation happens in the background or they can log in immediately after.
      // If you require immediate confirmation, you might want to redirect to a /auth/check-email page
      router.push("/admin"); // <--- ADD THIS REDIRECT
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
        Sign In / Sign Up
      </h2>
      <form className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {message && (
          <p
            className={`text-center text-sm ${messageType === "error" ? "text-red-500" : "text-green-500"}`}
          >
            {message}
          </p>
        )}

        <Button
          type="submit"
          onClick={handleSignIn}
          disabled={loading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? "Loading..." : "Sign In"}
        </Button>

        <Button
          type="submit"
          onClick={handleSignUp}
          disabled={loading}
          variant="outline"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          {loading ? "Loading..." : "Sign Up"}
        </Button>

        <div className="text-center text-sm">
          <Link
            href="/auth/forgot-password"
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Forgot password?
          </Link>
        </div>
      </form>
    </div>
  );
}
