/** @type {import('next').NextConfig} */
const nextConfig = {
  // @skeehn/react ships built ESM; transpiling keeps "use client" boundaries tidy.
  transpilePackages: ["@skeehn/react"],
};

export default nextConfig;
