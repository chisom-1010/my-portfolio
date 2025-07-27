// src/app/admin/skills/new/page.tsx
// This is a Server Component.
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { createSkill } from "../actions"; // Import the Server Action

// Create a wrapper action that matches the form action signature
async function createSkillWrapper(formData: FormData) {
  "use server";
  // Call your original action with a dummy prev state
  const result = await createSkill({ success: false, message: "" }, formData);

  // Handle redirect based on the result
  if (result.success) {
    redirect("/admin/skills");
  } else {
    // For errors, redirect with error message in query params
    redirect(`/admin/skills/new?error=${encodeURIComponent(result.message)}`);
  }
}

export default async function NewSkillPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const resolvedSearchParams = searchParams ? await searchParams : {};

  // Security check: Ensure user is authenticated and is the admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== process.env.ADMIN_USER_ID) {
    redirect("/auth/login?message=Unauthorized access to admin panel.");
  }

  return (
    <div className="flex flex-col gap-6 p-8 w-full max-w-xl mx-auto">
      <h1 className="text-3xl font-bold">Add New Skill</h1>

      {/* Show error message if present */}
      {resolvedSearchParams.error && (
        <div className="p-4 rounded-md bg-red-100 text-red-700">
          {resolvedSearchParams.error}
        </div>
      )}

      <form action={createSkillWrapper} className="space-y-6">
        <div>
          <Label htmlFor="name">Skill Name</Label>
          <Input id="name" name="name" required className="mt-1" />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
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
