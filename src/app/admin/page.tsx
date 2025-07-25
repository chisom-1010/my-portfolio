// src/app/admin/page.tsx
// This is a Server Component.
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Briefcase, Palette } from "lucide-react"; // Assuming lucide-react for icons

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Security check: Ensure user is authenticated and is the admin
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== process.env.ADMIN_USER_ID) {
    redirect("/auth/login?message=Unauthorized access to admin panel.");
  }

  return (
    <div className="flex flex-col gap-8 p-8 w-full max-w-4xl mx-auto items-center">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Card for Project Management */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col items-center text-center">
          <Briefcase className="h-12 w-12 text-indigo-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Projects</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Manage your portfolio projects, add new ones, edit details, and
            handle images.
          </p>
          <Button asChild className="w-full">
            <Link href="/admin/projects">Go to Projects</Link>
          </Button>
        </div>

        {/* Card for Skill Management */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col items-center text-center">
          <Palette className="h-12 w-12 text-teal-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Skills</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Add, edit, and remove your technical skills and their associated
            icons.
          </p>
          <Button asChild className="w-full">
            <Link href="/admin/skills">Go to Skills</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
