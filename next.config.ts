// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mqsglespwsamnhqwnlyp.supabase.co", // <--- ADD/UPDATE THIS LINE
        port: "", // Optional: if your Supabase storage uses a specific port, specify it here, otherwise leave empty
        pathname: "/storage/v1/object/public/portfolio-images/**", // Optional: restrict to a specific path if needed
      },
    ],
  },
  // ... other next.js configurations
};

module.exports = nextConfig;
