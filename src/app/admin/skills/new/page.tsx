// src/app/admin/skills/new/page.tsx
// This is a Server Component.
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { createSkill } from "../actions"; // Import the Server Action

export default async function NewSkillPage() {
  const supabase = await createClient();

  // Security check: Ensure user is authenticated and is the admin
  const { data: { user } = {} } = await supabase.auth.getUser(); // Destructure with default empty object
  if (!user || user.id !== process.env.ADMIN_USER_ID) {
    redirect("/auth/login?message=Unauthorized access to admin panel.");
  }

  return (
    <div className="flex flex-col gap-6 p-8 w-full max-w-xl mx-auto">
      <h1 className="text-3xl font-bold">Add New Skill</h1>

      <form action={createSkill} className="space-y-6">
        <div>
          <Label htmlFor="name">Skill Name</Label>
          <Input id="name" name="name" required className="mt-1" />
        </div>

        <div>
          <Label htmlFor="name">Category</Label>
          <Input id="category" name="category" required className="mt-1" />
        </div>

        <div>
          <Label htmlFor="icon_file">Skill Icon (Optional)</Label>
          <Input
            id="icon_file"
            name="icon_file"
            type="file"
            accept="image/*"
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload an icon for this skill (e.g., SVG, PNG).
          </p>
        </div>

        <Button type="submit" className="w-full">
          Create Skill
        </Button>
      </form>
    </div>
  );
}
