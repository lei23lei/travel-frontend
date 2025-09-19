// Cloudinary upload utility
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "travel_avatars";

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export interface CloudinaryUploadError {
  error: {
    message: string;
  };
}

// Simple rate limiting for uploads (optional)
let lastUploadTime = 0;
const UPLOAD_COOLDOWN = 2000; // 2 seconds between uploads

export const uploadToCloudinary = async (
  file: File
): Promise<CloudinaryUploadResponse> => {
  // Basic rate limiting
  const now = Date.now();
  if (now - lastUploadTime < UPLOAD_COOLDOWN) {
    throw new Error("Please wait a moment before uploading another image");
  }
  lastUploadTime = now;
  if (!CLOUD_NAME) {
    throw new Error(
      "Cloudinary cloud name is not configured. Please check your environment variables."
    );
  }

  if (!UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary upload preset is not configured. Please check your environment variables."
    );
  }

  // Validate file type (more specific)
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only JPEG, PNG, WebP, and GIF images are allowed");
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size must be less than 5MB");
  }

  console.log("Uploading to Cloudinary with:", {
    cloudName: CLOUD_NAME,
    uploadPreset: UPLOAD_PRESET,
    fileName: file.name,
    fileSize: file.size,
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("cloud_name", CLOUD_NAME);
  formData.append("folder", "travel-avatars");

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    console.log("Cloudinary response status:", response.status);

    if (!response.ok) {
      let errorMessage = "Upload failed";
      try {
        const errorData: CloudinaryUploadError = await response.json();
        console.error("Cloudinary upload error:", errorData);
        errorMessage = errorData.error?.message || errorMessage;

        // Provide more specific error messages
        if (errorMessage.includes("upload preset")) {
          errorMessage = `Upload preset "${UPLOAD_PRESET}" not found. Please create an unsigned upload preset in your Cloudinary dashboard.`;
        }
      } catch (parseError) {
        console.error("Failed to parse error response:", parseError);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    const data: CloudinaryUploadResponse = await response.json();
    console.log("Upload successful:", data.secure_url);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Upload failed");
  }
};

// Generate a random avatar URL from a service like DiceBear
export const generateRandomAvatar = (seed?: string): string => {
  const avatarSeed = seed || Math.random().toString(36).substring(7);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
};

// Common avatar services for quick selection
export const avatarServices = {
  dicebear: (seed: string) =>
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
  gravatar: (email: string) =>
    `https://www.gravatar.com/avatar/${email}?d=identicon&s=200`,
  placeholder: (text: string) =>
    `https://via.placeholder.com/200x200/6366f1/ffffff?text=${encodeURIComponent(
      text.charAt(0).toUpperCase()
    )}`,
};
