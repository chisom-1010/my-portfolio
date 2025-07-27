// src/app/admin/projects/new/page.tsx
// This is a Server Component.
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { Checkbox } from "@/src/components/ui/checkbox";
import { createProject } from "../actions";

// Create a wrapper action that matches the form action signature
async function createProjectWrapper(formData: FormData) {
  "use server";
  // Call your original action with a dummy prev state
  const result = await createProject({ success: false, message: "" }, formData);

  // Handle redirect based on the result
  if (result.success) {
    redirect("/admin/projects");
  } else {
    // For errors, redirect with error message in query params
    redirect(`/admin/projects/new?error=${encodeURIComponent(result.message)}`);
  }
}

export default async function NewProjectPage({
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
    <div className="flex flex-col gap-6 p-8 w-full max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Add New Project</h1>

      {/* Show error message if present */}
      {resolvedSearchParams.error && (
        <div className="p-4 rounded-md bg-red-100 text-red-700">
          {resolvedSearchParams.error}
        </div>
      )}

      <form action={createProjectWrapper} className="space-y-6">
        <div>
          <Label htmlFor="title">Project Title</Label>
          <Input id="title" name="title" required className="mt-1" />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            required
            rows={5}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="technologies">Technologies (comma-separated)</Label>
          <Input
            id="technologies"
            name="technologies"
            placeholder="e.g., React, Next.js, Tailwind CSS"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="github_url">GitHub URL (Optional)</Label>
          <Input
            id="github_url"
            name="github_url"
            type="url"
            placeholder="https://github.com/your-repo"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="live_demo_url">Live Demo URL (Optional)</Label>
          <Input
            id="live_demo_url"
            name="live_demo_url"
            type="url"
            placeholder="https://your-live-demo.com"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="project_images">
            Project Images (Select multiple)
          </Label>
          <Input
            id="project_images"
            name="project_images"
            type="file"
            multiple
            accept="image/*"
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload images for your project. Max 5MB per file.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="is_published" name="is_published" />
          <Label htmlFor="is_published">Publish Project</Label>
          <p className="text-sm text-gray-500">
            (If checked, project will be visible on the homepage)
          </p>
        </div>

        <Button type="submit" className="w-full">
          Create Project
        </Button>
      </form>
    </div>
  );
}
