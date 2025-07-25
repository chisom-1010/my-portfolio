// src/app/admin/skills/page.tsx
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { PlusCircle } from "lucide-react";
import Image from "next/image"; // For skill icons/images

interface Skill {
  id: string;
  name: string;
  icon_url?: string | null;
  category: string;
}

// Import the Server Actions for skills
import { deleteSkill } from "./actions"; // We'll create this file next

export default async function AdminSkillsPage() {
  const supabase = await createClient();

  // Security check: Ensure user is authenticated and is the admin
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== process.env.ADMIN_USER_ID) {
    redirect("/auth/login?message=Unauthorized access to admin panel.");
  }

  // Fetch all skills
  const { data: skills, error } = await supabase
    .from("skills")
    .select("*")
    .order("name", { ascending: true }); // Order alphabetically by name

  if (error) {
    console.error("Error fetching skills for admin:", error);
    return (
      <p className="text-red-500">Error loading skills: {error.message}</p>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8 w-full max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Skills</h1>
        <Button asChild>
          <Link href="/admin/skills/new" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> Add New Skill
          </Link>
        </Button>
      </div>

      {skills.length === 0 ? (
        <p className="text-gray-500">
          No skills added yet. Click &apos;Add New Skill&apos; to get started!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill: Skill) => (
            <div
              key={skill.id}
              className="border p-4 rounded-lg shadow-sm flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                {skill.icon_url && (
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <Image
                      src={skill.icon_url}
                      alt={skill.name}
                      fill
                      sizes="40px"
                      style={{ objectFit: "contain" }}
                      className="object-contain"
                    />
                  </div>
                )}
                <h2 className="text-xl font-semibold">{skill.name}</h2>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/skills/${skill.id}/edit`}>Edit</Link>
                </Button>
                <form action={deleteSkill}>
                  <input type="hidden" name="skillId" value={skill.id} />
                  <Button type="submit" variant="destructive" size="sm">
                    Delete
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
