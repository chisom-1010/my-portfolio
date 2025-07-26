// src/app/admin/projects/new/page.tsx
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { createProject } from "./actions"; // Import the Server Action
import { ProjectForm } from "@/src/components/project-form"; // Import the client component

export default async function NewProjectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== process.env.ADMIN_USER_ID) {
    redirect("/auth/login?message=Unauthorized access to admin panel.");
  }

  return (
    <div className="flex flex-col gap-6 p-8 w-full max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Add New Project</h1>
      <ProjectForm action={createProject} />
      {/* Use the client component here */}
    </div>
  );
}
