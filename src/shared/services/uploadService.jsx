import axios from "axios";
import api from "./Api.jsx";

/**
 * Extracts the file key from an UploadThing URL.
 * @param {string} url - The UploadThing file URL (e.g., "https://utfs.io/f/abc123_image.jpg")
 * @returns {string} The file key (e.g., "abc123_image.jpg")
 */
export const extractFileKeyFromUrl = (url) => {
  if (!url) return null;
  
  console.log("Extracting file key from URL:", url);
  
  // Handle different UploadThing URL formats
  const patterns = [
    /\/f\/([^\/\?#]+)/, // Standard format: /f/filename (excluding query params and fragments)
    /utfs\.io\/f\/([^\/\?#]+)/, // Full URL format
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      console.log("Extracted file key:", match[1]);
      return match[1];
    }
  }
  
  console.warn("Could not extract file key from URL:", url);
  return null;
};

/**
 * Deletes a file by calling the backend API.
 * @param {string} fileUrl - The file URL to delete
 * @returns {Promise<{success: boolean, message: string, deletedFiles: string[], failedFiles: string[]}>} Deletion result
 */
export const deleteFileByUrl = async (fileUrl) => {
  if (!fileUrl) {
    throw new Error("File URL is required for deletion");
  }
  
  // Extract file key from URL
  const fileKey = extractFileKeyFromUrl(fileUrl);
  
  if (!fileKey) {
    return {
      success: false,
      message: "Could not extract file key from URL. Please check if it's a valid UploadThing URL.",
      deletedFiles: [],
      failedFiles: [fileUrl]
    };
  }
  
  try {
    console.log("Deleting file with URL:", fileUrl);
    console.log("Extracted file key:", fileKey);
    
    // Call the backend API using the configured api instance with file key
    const response = await api.delete(`/v1/uploadthing/files/${fileKey}`);
    
    const result = response.data;
    
    if (response.status === 200 && result.success) {
      console.log("File deleted successfully:", result);
      return {
        success: true,
        message: result.message || "File deleted successfully",
        deletedFiles: result.deletedFiles || [fileKey],
        failedFiles: result.failedFiles || [],
        data: result,
      };
    } else {
      console.error("Backend API error:", result);
      return {
        success: false,
        message: result.message || "Failed to delete file",
        deletedFiles: result.deletedFiles || [],
        failedFiles: result.failedFiles || [fileKey],
        error: result.error,
      };
    }
  } catch (error) {
    console.error("Failed to delete file:", error);
    
    return {
      success: false,
      message: "Failed to delete file. Please try again.",
      deletedFiles: [],
      failedFiles: [fileKey],
      error: error.message,
    };
  }
};

/**
 * Uploads a file (image or PDF) using UploadThing service.
 * @param {File} file - The file to upload (image or PDF).
 * @param {string} field - A string used to determine callbackSlug (e.g. 'photos', 'license').
 * @returns {Promise<{field: string, url: string, fileKey: string}>} The uploaded file metadata.
 */
export const uploadFile = async (file, field) => {
  console.log("Inside UPLOADER............");
  const uploadthingApiKey = import.meta.env.VITE_UPLOADTHING_SECRET;
  try {
    // Determine the route config based on file type
    const isImage = file.type.startsWith("image/");
    const isPDF = file.type === "application/pdf";

     // ✅ Use your actual Vercel URL
     const callbackUrl = process.env.NODE_ENV === 'production' 
     ? "https://yak-rooms-fe.vercel.app/api/uploadthing"  // Your actual domain
     : `${window.location.origin}/api/uploadthing`;

     console.log("Using callback URL:", callbackUrl); // Debug log


    // Step 1: Prepare the upload
    const configResponse = await axios.post(
      "https://uploadthing.com/api/prepareUpload",
      {
        files: [
          {
            name: file.name,
            size: file.size,
            type: file.type || "application/octet-stream",
          },
        ],
        callbackUrl,
        callbackSlug: field === "photos" ? "listingPhotos" : "verificationDocs",
        routeConfig: {
          [isImage ? "image" : "pdf"]: {
            maxFileSize: "4MB", // Larger size for PDFs
            maxFileCount: 1,
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Uploadthing-Api-Key": uploadthingApiKey,
        },
      }
    );

    const fileData = configResponse.data?.[0];
    if (!fileData || !fileData.fields || !fileData.url) {
      throw new Error("Invalid response from UploadThing API");
    }

    // Step 2: Upload to S3
    const formData = new FormData();
    Object.entries(fileData.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("file", file);

    await axios.post(fileData.url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Return the field type and URL
    return {
      field,
      url: fileData.fileUrl,
      fileKey: fileData.key || null, // Keep for backward compatibility
    };
  } catch (error) {
    console.error(`Upload failed for ${field}:`, error);
    throw error;
  }
};
