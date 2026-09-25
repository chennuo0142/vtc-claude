import type { Metadata } from "next";
import VerifyEmailClient from "./VerifyEmailClient";

// Le jeton est dans l'URL : on empêche qu'il fuite via l'en-tête Referer ou l'indexation.
export const metadata: Metadata = {
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default async function VerifierEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  return <VerifyEmailClient token={typeof token === "string" ? token : ""} />;
}
