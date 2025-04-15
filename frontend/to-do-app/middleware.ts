// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define routes that should be publicly accessible (users don't need to be logged in)
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)', // Allow access to sign-in page and its sub-routes
  '/sign-up(.*)', // Allow access to sign-up page and its sub-routes
  '/api/public(.*)', // Example: If you have any public API endpoints
  // Add any other public pages or API routes here
]);

// export default clerkMiddleware((auth, req) => {
//   // Check if the current request URL matches any of the public routes
//   if (!isPublicRoute(req)) {
//     // If the route is NOT public, then protect it.
//     // This call ensures that if the user is not authenticated, they are redirected.
//     // This syntax IS the documented way to use it inside the callback.
//     auth().protect();
//   }
//   // If it IS a public route, the middleware does nothing here, allowing access.
// });

export const config = {
  // This matcher ensures the middleware runs on relevant routes,
  // excluding static files and internal Next.js assets.
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};