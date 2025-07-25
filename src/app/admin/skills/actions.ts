// src/app/admin/skills/actions.ts
"use server";
import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ==========================================================
// CREATE SKILL Server Action
// ==========================================================
export async function createSkill(formData: FormData): Promise<void> {
  const name = formData.get("name") as string;
  const iconFile = formData.get("icon_file") as File; // Get the file input
  const category = formData.get("category") as string;

  const supabase = await createClient();

  // Security check: Ensure user is authenticated and is the admin
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user || user.id !== process.env.ADMIN_USER_ID) {
    console.error("Unauthorized attempt to create skill.");
    return;
  }

  let iconUrl: string | null = null;
  let uploadErrorMsg: string | null = null;

  // --- 1. Upload Skill Icon (if provided) ---
  if (iconFile && iconFile.size > 0) {
    const fileExtension = iconFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    const filePath = `skill-icons/${fileName}`; // Store skill icons in a dedicated folder in the bucket

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("portfolio-images") // Assuming you want to use the same bucket
      .upload(filePath, iconFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error(
        `Error uploading skill icon ${iconFile.name}:`,
        uploadError.message,
      );
      uploadErrorMsg = `Failed to upload icon: ${uploadError.message}`;
    } else if (uploadData) {
      const { data: publicUrlData } = supabase.storage
        .from("portfolio-images")
        .getPublicUrl(filePath);

      if (publicUrlData) {
        iconUrl = publicUrlData.publicUrl;
      }
    }
  }

  // --- 2. Insert Skill Data into Supabase Table ---
  const { error: insertError } = await supabase.from("skills").insert({
    name,
    icon_url: iconUrl,
    user_id: user.id, // Associate skill with the admin user
    category,
  });

  if (insertError) {
    console.error("Error creating new skill:", insertError.message);
    return;
  }

  console.log("New skill created successfully!");
  if (uploadErrorMsg) {
    console.warn(uploadErrorMsg);
  }

  // --- 3. Revalidate Paths and Redirect ---
  revalidatePath("/admin/skills"); // Revalidate the list page
  revalidatePath("/"); // Revalidate the homepage (if it displays skills)

  redirect("/admin/skills"); // Redirect back to the skills list after submission
}

// ==========================================================
// DELETE SKILL Server Action
// ==========================================================
export async function deleteSkill(formData: FormData): Promise<void> {
  const skillId = formData.get("skillId") as string;

  const supabase = await createClient();

  // Security check: Ensure user is authenticated and is the admin
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user || user.id !== process.env.ADMIN_USER_ID) {
    console.error("Unauthorized attempt to delete skill.");
    return;
  }

  const { data: skillToDelete, error: fetchError } = await supabase
    .from("skills")
    .select("icon_url")
    .eq("id", skillId)
    .single();

  if (fetchError) {
    console.error("Error fetching skill for icon deletion:", fetchError);
  }

  // Delete skill entry from the database
  const { error: deleteError } = await supabase
    .from("skills")
    .delete()
    .eq("id", skillId);

  if (deleteError) {
    console.error("Error deleting skill:", deleteError.message);
    return;
  }

  if (skillToDelete?.icon_url) {
    // Extract the path from the full Supabase URL
    const urlParts = skillToDelete.icon_url.split("portfolio-images/");
    const filePath = urlParts.length > 1 ? urlParts[1] : "";

    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from("portfolio-images")
        .remove([filePath]); // Remove expects an array of paths

      if (storageError) {
        console.error(
          "Error deleting skill icon from storage:",
          storageError.message,
        );
      } else {
        console.log("Successfully deleted associated skill icon from storage.");
      }
    }
  }

  console.log("Skill deleted successfully:", skillId);

  // Revalidate the paths that display skills to show the updated list
  revalidatePath("/admin/skills");
  revalidatePath("/"); // Revalidate the public homepage

  redirect("/admin/skills"); // Redirect back to the skills list
}

// ==========================================================
// UPDATE SKILL Server Action
// ==========================================================
export async function updateSkill(formData: FormData): Promise<void> {
  const skillId = formData.get("skillId") as string;
  const name = formData.get("name") as string;
  const newIconFile = formData.get("new_icon_file") as File;
  const category = formData.get("category") as string;

  const supabase = await createClient();

  // Security check
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user || user.id !== process.env.ADMIN_USER_ID) {
    console.error("Unauthorized attempt to update skill.");
    return;
  }

  // Fetch current skill to get existing icon URL for potential deletion
  const { data: currentSkill, error: fetchSkillError } = await supabase
    .from("skills")
    .select("icon_url")
    .eq("id", skillId)
    .single();

  if (fetchSkillError || !currentSkill) {
    console.error(
      "Error fetching current skill for update:",
      fetchSkillError?.message || "Skill not found",
    );
    return;
  }

  let updatedIconUrl: string | null = currentSkill.icon_url; // Start with existing URL
  let uploadErrorMsg: string | null = null;

  // --- 1. Handle New Icon Upload ---
  if (newIconFile && newIconFile.size > 0) {
    // Delete old icon if a new one is being uploaded
    if (currentSkill.icon_url) {
      const oldFilePathParts = currentSkill.icon_url.split("portfolio-images/");
      const oldFilePath =
        oldFilePathParts.length > 1 ? oldFilePathParts[1] : "";
      if (oldFilePath) {
        const { error: deleteOldError } = await supabase.storage
          .from("portfolio-images")
          .remove([oldFilePath]);
        if (deleteOldError) {
          console.warn(
            "Could not delete old skill icon:",
            deleteOldError.message,
          );
        } else {
          console.log("Old skill icon deleted successfully.");
        }
      }
    }

    // Upload new icon
    const fileExtension = newIconFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    const filePath = `skill-icons/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("portfolio-images")
      .upload(filePath, newIconFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error(
        `Error uploading new skill icon ${newIconFile.name}:`,
        uploadError.message,
      );
      uploadErrorMsg = `Failed to upload new icon: ${uploadError.message}`;
      updatedIconUrl = currentSkill.icon_url; // Revert to old URL if new upload fails
    } else if (uploadData) {
      const { data: publicUrlData } = supabase.storage
        .from("portfolio-images")
        .getPublicUrl(filePath);

      if (publicUrlData) {
        updatedIconUrl = publicUrlData.publicUrl;
      }
    }
  }

  // --- 2. Update Skill Data in Supabase Table ---
  const { error: updateError } = await supabase
    .from("skills")
    .update({
      name,
      icon_url: updatedIconUrl, // Use the new or existing icon URL
      category,
    })
    .eq("id", skillId);

  if (updateError) {
    console.error("Error updating skill:", updateError.message);
    return;
  }

  console.log("Skill updated successfully!");
  if (uploadErrorMsg) {
    console.warn(uploadErrorMsg);
  }

  // --- 3. Revalidate Paths and Redirect ---
  revalidatePath(`/admin/skills/${skillId}/edit`);
  revalidatePath("/admin/skills");
  revalidatePath("/"); // Revalidate homepage if skills are displayed there

  redirect("/admin/skills");
}
