import type { NextConfig } from "next";

// NOTE: PWA is disabled due to the single quote in the parent directory path
// (Conference '25) which breaks workbox path handling.
// To enable PWA, move the project to a path without special characters
// and set `disable: false` below.
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: true, // Disabled due to path issue
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
