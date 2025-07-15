// src/components/AuthGuard.tsx
"use client"; // This MUST be a Client Component

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client"; // ENSURE THIS IS THE CLIENT-SIDE SUPABASE CLIENT
import { User } from "@supabase/supabase-js"; // Import User type

// This component's primary role is to listen for client-side auth state changes
// and trigger a server-side refresh for Server Components to get the latest state.
export default function AuthGuard({ serverUser }: { serverUser: User | null }) {
  const supabase = createClient(); // Use the client-side Supabase client
  const router = useRouter();

  useEffect(() => {
    // Listen for auth changes from Supabase client-side
    // This is crucial for handling redirects after login/logout, etc.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Only refresh if the user status has actually changed to avoid unnecessary renders
      if ((session?.user && !serverUser) || (!session?.user && serverUser)) {
        router.refresh();
      } else if (session?.user?.id !== serverUser?.id) {
        // Check if it's the same user, but maybe profile data changed
        router.refresh();
      }
      // console.log("Auth event:", event, "Session:", session?.user?.id);
    });

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, serverUser]); // Dependencies for useEffect

  // This component does not render any visible UI
  return null;
}
