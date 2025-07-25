// src/app/admin/projects/actions.ts
"use server";
import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Define a common return type for Server Actions
export interface ServerActionResponse {
  success: boolean;
  message: string;
}

// createProject Server Action
export async function createProject(
  _prevState: ServerActionResponse,
  formData: FormData,
): Promise<ServerActionResponse> {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const technologiesString = formData.get("technologies") as string;
  const github_url = formData.get("github_url") as string | null;
  const live_demo_url = formData.get("live_demo_url") as string | null;
  const is_published = formData.get("is_published") === "on";

  const images = formData.getAll("project_images") as File[];

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user || user.id !== process.env.ADMIN_USER_ID) {
    console.error("Unauthorized attempt to create project.");
    return { success: false, message: "Unauthorized action." }; // Changed return
  }

  const imageUrls: string[] = [];
  const uploadErrors: string[] = [];

  for (const imageFile of images) {
    if (imageFile.size === 0) continue;

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
      const { data: publicUrlData } = supabase.storage
        .from("portfolio-images")
        .getPublicUrl(filePath);

      if (publicUrlData) {
        imageUrls.push(publicUrlData.publicUrl);
      }
    }
  }

  const technologiesArray = technologiesString
    .split(",")
    .map((tech) => tech.trim())
    .filter((tech) => tech.length > 0);

  const { error: insertError } = await supabase.from("projects").insert({
    title,
    description,
    technologies: technologiesArray,
    github_url: github_url || null,
    live_demo_url: live_demo_url || null,
    image_urls: imageUrls,
    is_published: is_published,
    user_id: user.id,
  });

  if (insertError) {
    console.error("Error creating new project:", insertError.message);
    return {
      success: false,
      message: `Failed to create project: ${insertError.message}`,
    }; // Changed return
  }

  console.log("New project created successfully!");
  if (uploadErrors.length > 0) {
    console.warn("Some image uploads failed:", uploadErrors);
  }

  revalidatePath("/admin/projects");
  revalidatePath("/");
  // Removed: redirect("/admin/projects");

  return { success: true, message: "Project created successfully!" }; // Changed return
}

// deleteProject action
export async function deleteProject(
  formData: FormData,
): Promise<ServerActionResponse> {
  // Changed return type
  const projectId = formData.get("projectId") as string;

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || user.id !== process.env.ADMIN_USER_ID) {
    console.error("Unauthorized attempt to delete project. User ID:", user?.id);
    return { success: false, message: "Unauthorized action." }; // Changed return
  }

  const { data: projectToDelete, error: fetchError } = await supabase
    .from("projects")
    .select("image_urls")
    .eq("id", projectId)
    .single();

  if (fetchError) {
    console.error("Error fetching project for image deletion:", fetchError);
    return {
      success: false,
      message: `Error fetching project: ${fetchError.message}`,
    }; // Changed return
  }

  const { error: deleteError } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (deleteError) {
    console.error("Error deleting project:", deleteError.message);
    return {
      success: false,
      message: `Failed to delete project: ${deleteError.message}`,
    }; // Changed return
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
        // Not returning here, as core project deletion was successful.
        // The message will indicate potential partial failure if needed.
      } else {
        console.log("Successfully deleted associated images from storage.");
      }
    }
  }

  console.log("Project deleted successfully:", projectId);

  revalidatePath("/admin/projects");
  revalidatePath("/");
  // Removed: redirect("/admin/projects");

  return { success: true, message: "Project deleted successfully!" }; // Changed return
}

// updateProject Server Action
export async function updateProject(
  _prevState: ServerActionResponse,
  formData: FormData,
): Promise<ServerActionResponse> {
  // Changed return type
  const projectId = formData.get("projectId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const technologiesString = formData.get("technologies") as string;
  const github_url = formData.get("github_url") as string | null;
  const live_demo_url = formData.get("live_demo_url") as string | null;
  const is_published = formData.get("is_published") === "on";

  const newImages = formData.getAll("new_project_images") as File[];

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user || user.id !== process.env.ADMIN_USER_ID) {
    console.error("Unauthorized attempt to update project.");
    return { success: false, message: "Unauthorized action." }; // Changed return
  }

  const { data: currentProject, error: fetchProjectError } = await supabase
    .from("projects")
    .select("image_urls")
    .eq("id", projectId)
    .single();

  if (fetchProjectError || !currentProject) {
    console.error(
      "Error fetching current project for update:",
      fetchProjectError?.message || "Project not found",
    );
    return {
      success: false,
      message: `Error fetching project: ${fetchProjectError?.message || "Project not found"}`,
    }; // Changed return
  }

  const imageUrls: string[] = currentProject.image_urls || [];

  const uploadErrors: string[] = [];
  for (const imageFile of newImages) {
    if (imageFile.size === 0) continue;

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
        `Error uploading new image ${imageFile.name}:`,
        uploadError.message,
      );
      uploadErrors.push(
        `Failed to upload ${imageFile.name}: ${uploadError.message}`,
      );
    } else if (uploadData) {
      const { data: publicUrlData } = supabase.storage
        .from("portfolio-images")
        .getPublicUrl(filePath);

      if (publicUrlData) {
        imageUrls.push(publicUrlData.publicUrl);
      }
    }
  }

  const technologiesArray = technologiesString
    .split(",")
    .map((tech) => tech.trim())
    .filter((tech) => tech.length > 0);

  const { error: updateError } = await supabase
    .from("projects")
    .update({
      title,
      description,
      technologies: technologiesArray,
      github_url: github_url || null,
      live_demo_url: live_demo_url || null,
      image_urls: imageUrls,
      is_published: is_published,
    })
    .eq("id", projectId);

  if (updateError) {
    console.error("Error updating project:", updateError.message);
    return {
      success: false,
      message: `Failed to update project: ${updateError.message}`,
    }; // Changed return
  }

  console.log("Project updated successfully!");
  if (uploadErrors.length > 0) {
    console.warn("Some new image uploads failed:", uploadErrors);
  }

  revalidatePath(`/admin/projects/${projectId}/edit`);
  revalidatePath("/admin/projects");
  revalidatePath("/");
  // Removed: redirect("/admin/projects");

  return { success: true, message: "Project updated successfully!" }; // Changed return
}
