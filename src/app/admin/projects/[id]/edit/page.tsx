// src/app/admin/projects/[id]/edit/page.tsx
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProjectForm } from "@/src/components/project-form"; // Import the client component

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Project {
  id: string;
  created_at: string;
  title: string;
  description: string;
  technologies: string[];
  github_url: string | null;
  live_demo_url: string | null;
  image_urls: string[] | null;
  is_published: boolean;
  user_id: string;
}

export default async function EditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const projectId = params.id;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== process.env.ADMIN_USER_ID) {
    redirect("/auth/login?message=Unauthorized access to admin panel.");
  }

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error || !project) {
    console.error(
      "Error fetching project for editing:",
      error?.message || "Project not found",
    );
    redirect("/admin/projects?error=Project not found");
  }

  const { updateProject } = await import("../../actions"); // Dynamic import for server action passed to client component

  return (
    <div className="flex flex-col gap-6 p-8 w-full max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Edit Project: {project.title}</h1>
      <ProjectForm action={updateProject} initialData={project} />
    </div>
  );
}
