// src/app/admin/projects/actions.ts
"use server";
import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// createProject Server Action
export async function createProject(formData: FormData): Promise<void> {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const technologiesString = formData.get("technologies") as string;
  const github_url = formData.get("github_url") as string | null;
  const live_demo_url = formData.get("live_demo_url") as string | null;
  const is_published = formData.get("is_published") === "on"; // Checkbox value is "on" if checked

  // Handle multiple files
  const images = formData.getAll("project_images") as File[]; // Get all files

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user || user.id !== process.env.ADMIN_USER_ID) {
    console.error("Unauthorized attempt to create project.");
    return;
  }

  //Upload Images to Supabase Storage ---
  const imageUrls: string[] = [];
  const uploadErrors: string[] = [];

  for (const imageFile of images) {
    if (imageFile.size === 0) continue; // Skip empty file inputs

    const fileExtension = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    const filePath = `${user.id}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("portfolio-images")
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error(
        `Error uploading image ${imageFile.name}:`,
        uploadError.message,
      );
      uploadErrors.push(
        `Failed to upload ${imageFile.name}: ${uploadError.message}`,
      );
    } else if (uploadData) {
      // Get the public URL for the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from("portfolio-images")
        .getPublicUrl(filePath);

      if (publicUrlData) {
        imageUrls.push(publicUrlData.publicUrl);
      }
    }
  }

  // Insert Project Data into Supabase Table ---
  const technologiesArray = technologiesString
    .split(",")
    .map((tech) => tech.trim())
    .filter((tech) => tech.length > 0); // Convert comma-separated string to array

  const { error: insertError } = await supabase.from("projects").insert({
    title,
    description,
    technologies: technologiesArray,
    github_url: github_url || null, // Ensure null if empty string
    live_demo_url: live_demo_url || null,
    image_urls: imageUrls, // Store array of public URLs
    is_published: is_published,
    user_id: user.id, // Associate project with the admin user
  });

  if (insertError) {
    console.error("Error creating new project:", insertError.message);
    return;
  }

  console.log("New project created successfully!");
  if (uploadErrors.length > 0) {
    console.warn("Some image uploads failed:", uploadErrors);
  }

  // Revalidate Paths and Redirect
  revalidatePath("/admin/projects"); // Revalidate the list page
  revalidatePath("/"); // Revalidate the homepage to show new public projects

  redirect("/admin/projects"); // Redirect back to the projects list after submission
}

// deleteProject actions

export async function deleteProject(formData: FormData): Promise<void> {
  const projectId = formData.get("projectId") as string;

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || user.id !== process.env.ADMIN_USER_ID) {
    console.error("Unauthorized attempt to delete project. User ID:", user?.id);
    return;
  }

  const { data: projectToDelete, error: fetchError } = await supabase
    .from("projects")
    .select("image_urls")
    .eq("id", projectId)
    .single();

  if (fetchError) {
    console.error("Error fetching project for image deletion:", fetchError);
    return;
  }

  const { error: deleteError } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (deleteError) {
    console.error("Error deleting project:", deleteError.message);
    return;
  }

  if (projectToDelete?.image_urls && projectToDelete.image_urls.length > 0) {
    const filePaths: string[] = projectToDelete.image_urls
      .map((url: string) => {
        const urlParts = url.split("portfolio-images/");
        return urlParts.length > 1 ? urlParts[1] : "";
      })
      .filter((path) => path);

    if (filePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("portfolio-images")
        .remove(filePaths);

      if (storageError) {
        console.error(
          "Error deleting project images from storage:",
          storageError.message,
        );
      } else {
        console.log("Successfully deleted associated images from storage.");
      }
    }
  }

  console.log("Project deleted successfully:", projectId);

  revalidatePath("/admin/projects");
  revalidatePath("/");
}
