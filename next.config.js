/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  env: {
    GALLAGHER_API_KEY: "GGL-API-KEY 3110-1CB5-47BB-611A-EF10-C803-4A4F-35BF",
    GALLAGHER_BASE_URL: "https://127.0.0.1:8904/api",
    DATABASE_URI: "postgres://postgres:Creole@123@localhost:5432/suprema",
    SUPREMA_BASE_URL: "https://192.168.1.247/api",
  },
};

module.exports = nextConfig;
