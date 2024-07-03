import { authMiddleware } from "@clerk/nextjs";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
    publicRoutes: [
        "/home",
        "/api/webhook/clerk",
        "/api/rapidapi",
        "/question/:id",
        "/skills",
        "/skills/:id",
        "/profile/:id",
        "/community",
        "/jobs",
        "/post-problem",
        "/onboarding",
    ],
    ignoredRoutes: [
        "/terms-of-service",
        "/privacy-policy",
        "/api/webhook/clerk",
        "/api/openai",
        "/api/rapidapi",
    ],
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/home", "/(api|trpc)(.*)"],
};
