import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)", 
  "/sign-up(.*)",
  "/forgot-password(.*)",
  "/sso-callback(.*)", 
  "/api/webhooks(.*)",
  "/api/inngest(.*)",
  "/api/task/fast-create(.*)"
])

export default clerkMiddleware(async (auth, req) => {
  // Se a rota for pública, não faz nada e deixa o Next.js seguir
  if (isPublicRoute(req)) return

  // Se NÃO for pública, exige autenticação
  await auth.protect()
})

export const config = {
  matcher: [
    // Padrão recomendado pelo Clerk para Next.js
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}