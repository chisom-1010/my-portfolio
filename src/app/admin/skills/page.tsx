// src/app/admin/skills/new/page.tsx
// This is a Server Component.
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { SkillForm } from "@/src/components/skill-form"; // Import your new client component

export default async function NewSkillPage() {
  const supabase = await createClient();

  // Security check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== process.env.ADMIN_USER_ID) {
    redirect("/auth/login?message=Unauthorized access to admin panel.");
  }

  // Dynamically import the createSkill action (Server Action)
  const { createSkill } = await import("./actions");

  return (
    <div className="flex flex-col gap-6 p-8 w-full max-w-xl mx-auto">
      <h1 className="text-3xl font-bold">Add New Skill</h1>
      <SkillForm action={createSkill} /> {/* Use the client component here */}
    </div>
  );
}
