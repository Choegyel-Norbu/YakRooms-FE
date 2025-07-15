import axios from "axios";

/**
 * Uploads a file (image or PDF) using UploadThing service.
 * @param {File} file - The file to upload (image or PDF).
 * @param {string} field - A string used to determine callbackSlug (e.g. 'photos', 'license').
 * @returns {Promise<{field: string, url: string}>} The uploaded file metadata.
 */
export const uploadFile = async (file, field) => {
  console.log("Inside UPLOADER............");
  const uploadthingApiKey = import.meta.env.VITE_UPLOADTHING_SECRET;
  try {
    // Determine the route config based on file type
    const isImage = file.type.startsWith("image/");
    const isPDF = file.type === "application/pdf";

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
        callbackUrl: `${window.location.origin}/api/uploadthing`,
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

    // Return the field type and the final URL
    return {
      field,
      url: fileData.fileUrl, // or whatever URL UploadThing provides for access
    };
  } catch (error) {
    console.error(`Upload failed for ${field}:`, error);
    throw error;
  }
};
