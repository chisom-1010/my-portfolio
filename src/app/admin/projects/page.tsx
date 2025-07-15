// src/app/admin/projects/page.tsx
// This is a Server Component, no 'use client'
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { PlusCircle } from "lucide-react";
import { deleteProject } from "./actions";

interface Project {
  id: string;
  created_at: string;
  title: string;
  description: string;
  technologies: string[];
  github_url?: string;
  live_demo_url?: string;
  image_urls?: string[];
  is_published?: boolean;
}

export default async function AdminProjectsPage() {
  const supabase = await createClient();

  // Ensure user is authenticated and is the admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== process.env.ADMIN_USER_ID) {
    redirect("/auth/login?message=Unauthorized access to admin panel.");
  }

  // Fetch all projects for the admin view (even unpublished ones if you have that column)
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects for admin:", error);
    return (
      <p className="text-red-500">Error loading projects: {error.message}</p>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8 w-full max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Projects</h1>
        <Button asChild>
          <Link href="/admin/projects/new" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> Add New Project
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <p className="text-gray-500">No projects added yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {projects.map((project: Project) => (
            <div
              key={project.id}
              className="border p-4 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{project.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                  {project.description}
                </p>
                {project.is_published === false && (
                  <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded-full mt-2 inline-block">
                    Unpublished
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/projects/${project.id}/edit`}>Edit</Link>
                </Button>
                <form action={deleteProject}>
                  <input type="hidden" name="projectId" value={project.id} />
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
