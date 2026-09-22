import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "USER" | "ADMIN";
    status: "PENDING" | "APPROVED" | "REJECTED";
  }

  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
      status: "PENDING" | "APPROVED" | "REJECTED";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "USER" | "ADMIN";
    status: "PENDING" | "APPROVED" | "REJECTED";
  }
}
