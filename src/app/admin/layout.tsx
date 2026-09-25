import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/dictionary";
import { ExternalLinkIcon } from "@/components/icons";
import InitialsAvatar from "@/components/admin/InitialsAvatar";
import AdminSidebarNav from "./AdminSidebarNav";

function initialsFromEmail(email: string): string {
  const local = email.split("@")[0]?.replace(/[^a-zA-Z]/g, "") ?? "";
  return (local.slice(0, 2) || "A").toUpperCase();
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const dict = await getDictionary();
  const t = dict.adminNav.layout;

  const session = await auth();
  const email = session?.user.email ?? "";

  const [demandesCount, modificationsCount, verificationsCount] = await Promise.all([
    prisma.user.count({ where: { status: "PENDING" } }),
    prisma.profile.count({ where: { hasPendingChanges: true } }),
    prisma.user.count({ where: { role: "USER", status: "PENDING", emailVerifiedAt: null } }),
  ]);

  return (
    <div className="flex items-start">
      <aside
        className="flex flex-shrink-0 flex-col"
        style={{
          width: 264,
          position: "sticky",
          top: "var(--navbar-h)",
          height: "calc(100dvh - var(--navbar-h))",
          borderRight: "1px solid var(--color-divider)",
          background: "var(--color-surface)",
        }}
      >
        <div className="flex items-center gap-3" style={{ padding: 20, borderBottom: "1px solid var(--color-divider)" }}>
          <InitialsAvatar initials={initialsFromEmail(email)} size={36} />
          <div className="min-w-0">
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14 }}>{t.administrateur}</div>
            <div className="truncate text-[12px]" style={{ color: "var(--color-neutral-700)" }}>
              {email}
            </div>
          </div>
        </div>

        <AdminSidebarNav
          demandesCount={demandesCount} modificationsCount={modificationsCount}
          verificationsCount={verificationsCount}
        />

        <div style={{ padding: 16, borderTop: "1px solid var(--color-divider)" }}>
          <Link href="/" className="btn btn-secondary btn-block">
            <ExternalLinkIcon style={{ width: 14, height: 14 }} />
            {t.voirAnnuaire}
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
