import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/"], // rutas públicas (ej: página de inicio)
  ignoredRoutes: ["/api/webhooks(.*)"], // rutas que Clerk no debe interceptar
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/"], // aplica middleware a todas las rutas
};