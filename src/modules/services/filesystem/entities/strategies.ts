// Central registry of injection tokens for each supported storage strategy.
export const FILESYSTEM_STRATEGY = {
  // Local disk storage (e.g. Node.js fs, multer, etc.)
  local: "LOCAL_STORAGE_SERVICE",

  // Amazon Web Services S3 storage
  aws: "AWS_STORAGE_SERVICE",

  // Google Cloud Storage
  google: "GOOGLE_STORAGE_SERVICE",

  // DigitalOcean Spaces (S3-compatible)
  digitalOcean: "DIGITALOCEAN_STORAGE_SERVICE",

  // Cloudinary (cloud-based media storage and CDN)
  cloudinary: "CLOUDINARY_STORAGE_SERVICE"
}
