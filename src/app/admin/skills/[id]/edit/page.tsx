// src/app/admin/skills/[id]/edit/page.tsx
// This is a Server Component.
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { SkillForm } from "@/src/components/skill-form"; // Import your new client component

// Define the Skill type
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Skill {
  id: string;
  name: string;
  icon_url: string | null;
  category?: string; // Ensure this matches your Supabase schema if it's new
  user_id: string;
}

export default async function EditSkillPage({
  params,
}: {
  params: { id: string };
}) {
  const skillId = params.id;
  const supabase = await createClient();

  // Security check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== process.env.ADMIN_USER_ID) {
    redirect("/auth/login?message=Unauthorized access to admin panel.");
  }

  // Fetch the existing skill data
  const { data: skill, error } = await supabase
    .from("skills")
    .select("*")
    .eq("id", skillId)
    .single();

  if (error || !skill) {
    console.error(
      "Error fetching skill for editing:",
      error?.message || "Skill not found",
    );
    redirect("/admin/skills?error=Skill not found");
  }

  // Import the updateSkill action (Server Action)
  const { updateSkill } = await import("../../actions");

  return (
    <div className="flex flex-col gap-6 p-8 w-full max-w-xl mx-auto">
      <h1 className="text-3xl font-bold">Edit Skill: {skill.name}</h1>
      <SkillForm action={updateSkill} initialData={skill} />{" "}
      {/* Use the client component here */}
    </div>
  );
}
