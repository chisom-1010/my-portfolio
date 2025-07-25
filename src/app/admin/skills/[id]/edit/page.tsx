// src/app/admin/skills/[id]/edit/page.tsx
// This is a Server Component.
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { updateSkill } from "../../actions";
import Image from "next/image";

// Define the Skill type
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Skill {
  id: string;
  name: string;
  icon_url: string | null;
  category: string;
  user_id: string;
}

interface EditSkillPageProps {
  params: {
    id: string; // The skill ID from the URL
  };
}

export default async function EditSkillPage({ params }: EditSkillPageProps) {
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

  return (
    <div className="flex flex-col gap-6 p-8 w-full max-w-xl mx-auto">
      <h1 className="text-3xl font-bold">Edit Skill: {skill.name}</h1>

      <form action={updateSkill} className="space-y-6">
        <input type="hidden" name="skillId" value={skill.id} />

        <div>
          <Label htmlFor="name">Skill Name</Label>
          <Input
            id="name"
            name="name"
            required
            className="mt-1"
            defaultValue={skill.name}
          />
        </div>

        <div>
          <Label htmlFor="new_icon_file">Current Icon</Label>
          {skill.icon_url ? (
            <div className="relative w-20 h-20 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 mx-auto mb-4">
              <Image
                src={skill.icon_url}
                alt={`${skill.name} icon`}
                fill
                sizes="80px"
                style={{ objectFit: "contain" }}
                className="object-contain"
              />
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-4">
              No icon currently set for this skill.
            </p>
          )}

          <Label htmlFor="new_icon_file">Upload New Icon (Optional)</Label>
          <Input
            id="new_icon_file"
            name="new_icon_file"
            type="file"
            accept="image/*"
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload a new icon to replace the existing one, or add one if none
            exists.
          </p>
        </div>

        <Button type="submit" className="w-full">
          Update Skill
        </Button>
      </form>
    </div>
  );
}
