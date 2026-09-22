import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const session = request.auth;

  if (pathname.startsWith("/admin")) {
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/connexion", request.url));
    }
  }

  if (pathname.startsWith("/mon-profil")) {
    if (!session) {
      return NextResponse.redirect(new URL("/connexion", request.url));
    }
    // Le statut (PENDING/APPROVED/REJECTED) n'est pas vérifié ici : le token du
    // middleware (edge, sans accès DB) ne reflète que le statut au moment de la
    // connexion. Le contrôle à jour est fait côté page (src/app/mon-profil/page.tsx),
    // qui relit le statut en base à chaque requête.
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/mon-profil/:path*"],
};
