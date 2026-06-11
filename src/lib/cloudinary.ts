export async function uploadToCloudinary(
  file: File
): Promise<{ url: string; type: "image" | "video" }> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // 1. Fail fast with a clear error message
  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary configuration is missing. Please check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in your environment variables."
    );
  }

  const formData = new FormData();
  formData.append("file", file);

  // 2. Use the validated variable
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(
    // 3. Use the validated variable
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error("Cloudinary upload failed");
  }

  const data = await res.json();

  return {
    url: data.secure_url,
    type: data.resource_type === "video" ? "video" : "image",
  };
}