// src/components/admin/project-form.tsx
"use client";

import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";

import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { Checkbox } from "@/src/components/ui/checkbox";
import Image from "next/image";
import { ServerActionResponse } from "@/src/app/admin/projects/actions"; // Import the type

// Reusable component for both new and edit forms
interface ProjectFormProps {
  action: (
    prevState: ServerActionResponse,
    formData: FormData,
  ) => Promise<ServerActionResponse>;
  initialData?: {
    id: string;
    title: string;
    description: string;
    technologies: string[];
    github_url: string | null;
    live_demo_url: string | null;
    image_urls: string[] | null;
    is_published: boolean;
  };
}

const initialState: ServerActionResponse = {
  success: false,
  message: "",
};

export function ProjectForm({ action, initialData }: ProjectFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const { pending } = useFormStatus();
  const router = useRouter();

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        router.push("/admin/projects"); // Redirect after success
      } else {
        toast.error(state.message);
      }
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      {initialData && (
        <input type="hidden" name="projectId" value={initialData.id} />
      )}

      <div>
        <Label htmlFor="title">Project Title</Label>
        <Input
          id="title"
          name="title"
          required
          className="mt-1"
          defaultValue={initialData?.title}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          rows={5}
          className="mt-1"
          defaultValue={initialData?.description}
        />
      </div>

      <div>
        <Label htmlFor="technologies">Technologies (comma-separated)</Label>
        <Input
          id="technologies"
          name="technologies"
          placeholder="e.g., React, Next.js, Tailwind CSS"
          className="mt-1"
          defaultValue={initialData?.technologies?.join(", ") || ""}
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
          defaultValue={initialData?.github_url || ""}
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
          defaultValue={initialData?.live_demo_url || ""}
        />
      </div>

      <div className="space-y-4">
        <Label>Current Images</Label>
        {initialData?.image_urls && initialData.image_urls.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {initialData.image_urls.map((url, index) => (
              <div
                key={index}
                className="relative w-full h-24 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700"
              >
                <Image
                  src={url}
                  alt={`Project image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          initialData && (
            <p className="text-sm text-gray-500">
              No images currently uploaded.
            </p>
          )
        )}

        <Label htmlFor="new_project_images">
          Upload New Images (Select multiple)
        </Label>
        <Input
          id="new_project_images"
          name="new_project_images"
          type="file"
          multiple
          accept="image/*"
          className="mt-1"
        />
        <p className="text-sm text-gray-500 mt-1">
          Upload new images. Existing images will be retained.
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_published"
          name="is_published"
          defaultChecked={initialData?.is_published}
        />
        <Label htmlFor="is_published">Publish Project</Label>
        <p className="text-sm text-gray-500">
          (If checked, project will be visible on the homepage)
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending
          ? initialData
            ? "Updating..."
            : "Creating..."
          : initialData
            ? "Update Project"
            : "Create Project"}
      </Button>
    </form>
  );
}
