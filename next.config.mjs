/** @type {import('next').NextConfig} */
// This app now runs as a normal Next.js server (deployed on Vercel) so it can
// offer login + content editing. The public pages are still statically
// generated at build time; only the /admin area and /api routes are dynamic.
const nextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
  // Keep trailing-slash URLs canonical for pages without 308-redirecting the
  // /api/* fetches (which we call without a trailing slash).
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
