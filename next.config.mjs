/** @type {import('next').NextConfig} */
// `output: export` is applied only for production builds (`next build`), so the
// dev server (`next dev`) runs normally without static-export restrictions.
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: isProd ? "export" : undefined,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
