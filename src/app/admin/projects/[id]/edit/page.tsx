// src/app/admin/projects/[id]/edit/page.tsx
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProjectForm } from "@/src/components/project-form";

// Define the Project type (keep this as it's for your data structure)
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

// Updated interface for Next.js 15+ where params is a Promise
interface ProjectEditPageProps {
  params: Promise<{
    id: string; // The project ID from the URL segment
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Use this explicit interface in the component's props
export default async function EditProjectPage({
  params,
  searchParams,
}: ProjectEditPageProps) {
  // Await the params Promise to get the actual values
  const { id: projectId } = await params;

  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== process.env.ADMIN_USER_ID) {
    redirect("/auth/login?message=Unauthorized access to admin panel.");
  }

  // Fetch the project
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

  // Dynamically import the updateProject action for passing to client component
  const { updateProject } = await import("../../actions");

  return (
    <div className="flex flex-col gap-6 p-8 w-full max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Edit Project: {project.title}</h1>
      <ProjectForm action={updateProject} initialData={project} />
    </div>
  );
}
