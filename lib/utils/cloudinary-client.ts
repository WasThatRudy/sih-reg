/**
 * Client-side Cloudinary utilities for URL manipulation
 * This file can be safely imported in client components
 */

/**
 * Get the proper delivery URL for different file types
 * For PDFs, switches from /image/upload/ to /raw/upload/
 * @param url - Original Cloudinary URL
 * @returns Proper delivery URL
 */
export function getProperDeliveryUrl(url: string): string {
  if (!url) return url;

  // Check if it's a PDF file
  const isPdf = url.toLowerCase().includes(".pdf");

  if (isPdf && url.includes("/image/upload/")) {
    // Switch from image/upload to raw/upload for PDFs
    return url.replace("/image/upload/", "/raw/upload/");
  }

  return url;
}

/**
 * Extract file name from Cloudinary URL
 * @param url - Cloudinary URL
 * @returns File name or fallback
 */
export function getFileNameFromUrl(url: string): string {
  if (!url) return "download";

  try {
    // Extract the public_id part and get the filename
    const urlParts = url.split("/");
    const lastPart = urlParts[urlParts.length - 1];

    // Remove version info if present (v1234567890_filename.ext)
    const cleanName = lastPart.replace(/^v\d+_/, "");

    return cleanName || "download";
  } catch {
    return "download";
  }
}

/**
 * Check if URL is a Cloudinary URL
 * @param url - URL to check
 * @returns boolean
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes("cloudinary.com") || url.includes("res.cloudinary.com");
}
