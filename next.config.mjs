/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
        BASE_URL: process.env.NEXT_APP_PUBLIC,
    },
};

export default nextConfig;
