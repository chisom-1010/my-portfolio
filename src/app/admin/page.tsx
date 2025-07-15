// src/app/admin/page.tsx
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }
  return (
    <div className="flex flex-col gap-4 p-8 w-full max-w-4xl">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-lg">Welcome, {user?.email}!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="admin/projects"
          className="p-6 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <h2 className="text-xl font-semibold">Manage Projects</h2>
          <p className="text-sm text-gray-500">
            Add, edit, or delete your portfolio projects.
          </p>
        </Link>
        <Link
          href="/admin/skills"
          className="p-6 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <h2 className="text-xl font-semibold">Manage Skills</h2>
          <p className="text-sm text-gray-500">
            Update your technical skill set.
          </p>
        </Link>
        {/* Add more admin links here as you expand */}
      </div>
    </div>
  );
}
