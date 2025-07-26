// src/components/admin/skill-form.tsx
"use client"; // This is a client component

import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react"; // useRef to clear file input
import toast from "react-hot-toast";
import Image from "next/image";

import { Input } from "@/src/components/ui/input"; // Adjust path if necessary
import { Button } from "@/src/components/ui/button"; // Adjust path if necessary
import { Label } from "@/src/components/ui/label"; // Adjust path if necessary

// Import the ServerActionResponse type from your skills actions file
import { ServerActionResponse } from "@/src/app/admin/skills/actions";

// Reusable component for both new and edit forms
interface SkillFormProps {
  action: (
    prevState: ServerActionResponse,
    formData: FormData,
  ) => Promise<ServerActionResponse>;
  initialData?: {
    id: string;
    name: string;
    icon_url: string | null;
    category?: string; // Optional if not always present or handled elsewhere
  };
}

const initialState: ServerActionResponse = {
  success: false,
  message: "",
};

export function SkillForm({ action, initialData }: SkillFormProps) {
  const [state, formAction] = useFormState(action, initialState);
  const { pending } = useFormStatus(); // Pending state for the form submission
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref to reset file input

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        router.push("/admin/skills"); // Redirect after success
        // Clear the form fields if it was a new creation (no initialData)
        if (!initialData) {
          if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Clear file input
          }
          // Note: Text inputs usually clear automatically on redirect
        }
      } else {
        toast.error(state.message);
      }
    }
  }, [state, router, initialData]);

  return (
    <form action={formAction} className="space-y-6">
      {initialData && (
        <input type="hidden" name="skillId" value={initialData.id} />
      )}

      <div>
        <Label htmlFor="name">Skill Name</Label>
        <Input
          id="name"
          name="name"
          required
          className="mt-1"
          defaultValue={initialData?.name || ""}
        />
      </div>

      <div>
        <Label>Current Icon</Label>
        {initialData?.icon_url ? (
          <div className="relative w-24 h-24 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 mx-auto mb-4 border border-gray-300 dark:border-gray-600">
            <Image
              src={initialData.icon_url}
              alt={`${initialData.name} icon`}
              fill
              sizes="96px"
              style={{ objectFit: "contain" }}
              className="object-contain"
            />
          </div>
        ) : (
          initialData && (
            <p className="text-sm text-gray-500 mb-4">
              No icon currently set for this skill.
            </p>
          )
        )}

        <Label htmlFor="new_icon_file">Upload New Icon (Optional)</Label>
        <Input
          id="new_icon_file"
          name="new_icon_file"
          type="file"
          accept="image/*"
          className="mt-1"
          ref={fileInputRef} // Attach ref to clear input
        />
        <p className="text-sm text-gray-500 mt-1">
          Upload a new icon to replace the existing one, or add one if none
          exists.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending
          ? initialData
            ? "Updating Skill..."
            : "Adding Skill..."
          : initialData
            ? "Update Skill"
            : "Add Skill"}
      </Button>
    </form>
  );
}
