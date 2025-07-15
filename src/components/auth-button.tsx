// src/components/AuthButton.tsx
"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/src/lib/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user: fetchedUser },
      } = await supabase.auth.getUser();
      setUser(fetchedUser);
      setLoading(false);
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      // Corrected line: Removed "USER_DELETED" from comparison as per Supabase types
      if (event === "SIGNED_OUT") {
        // <--- FIX IS HERE
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/auth/login");
      router.refresh();
    } else {
      console.error("Error signing out:", error.message);
    }
  };

  if (loading) {
    return <div className="text-sm">Loading user...</div>;
  }

  return user ? (
    <div className="flex items-center gap-4">
      <span className="text-sm hidden sm:block">Hey, {user.email}!</span>
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/admin">
          <span>Admin Dashboard</span>
        </Link>
      </Button>
      <Button
        onClick={handleSignOut}
        size="sm"
        variant={"secondary"}
        className="ml-2"
      >
        Logout
      </Button>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">
          <span>Sign In</span>
        </Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">
          <span>Sign Up</span>
        </Link>
      </Button>
    </div>
  );
}
