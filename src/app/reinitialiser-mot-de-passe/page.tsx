import type { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";

// Le jeton est dans l'URL : on empêche qu'il fuite via l'en-tête Referer ou l'indexation.
export const metadata: Metadata = {
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default async function ReinitialiserMotDePassePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={typeof token === "string" ? token : ""} />;
}
