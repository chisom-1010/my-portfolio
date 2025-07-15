// src/components/logout-button.tsx
"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client"; // Import client-side Supabase client
import { Button } from "./ui/button";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient(); // Use the client-side Supabase client

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      router.push("/auth/login"); // Redirect to login page after logout
      router.refresh(); // Force a re-render of server components
    } else {
      console.error("Error signing out:", error.message);
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      size="sm"
      variant={"secondary"} // Or any variant you prefer for logout
      className="ml-2"
    >
      Logout
    </Button>
  );
}
