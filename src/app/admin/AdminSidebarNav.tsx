"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  InboxIcon,
  PencilIcon,
  CarIcon,
  PinIcon,
  SlidersIcon,
  CreditCardIcon,
  SettingsIcon,
  UserIcon,
} from "@/components/icons";
import { useLanguage } from "@/lib/i18n/context";

type NavItem = {
  href: string;
  activeMatch?: string;
  label: string;
  icon: ReactNode;
  count?: number;
  exact?: boolean;
};

function NavGroup({ label, items, pathname }: { label: string; items: NavItem[]; pathname: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <h6 className="pb-1.5" style={{ padding: "0 12px", color: "var(--color-neutral-700)", fontSize: 11 }}>
        {label}
      </h6>
      {items.map((item) => {
        const matchAgainst = item.activeMatch ?? item.href;
        const active = item.exact ? pathname === matchAgainst : pathname.startsWith(matchAgainst);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2.5"
            style={{
              padding: active ? "9px 12px 9px 10px" : "9px 12px",
              borderLeft: active ? "2px solid var(--color-accent)" : "2px solid transparent",
              background: active ? "var(--color-accent-100)" : "transparent",
              color: active ? "var(--color-accent-700, var(--color-accent))" : "var(--color-text)",
              fontFamily: "var(--font-heading)",
              fontWeight: active ? 600 : 400,
              fontSize: 14,
            }}
          >
            <span
              style={{ color: active ? "var(--color-accent-700, var(--color-accent))" : "var(--color-neutral-700)" }}
              className="flex flex-shrink-0 items-center"
            >
              {item.icon}
            </span>
            <span className="flex-1">{item.label}</span>
            {!!item.count && <span className="badge">{item.count}</span>}
          </Link>
        );
      })}
    </div>
  );
}

export default function AdminSidebarNav({
  demandesCount,
  modificationsCount,
}: {
  demandesCount: number;
  modificationsCount: number;
}) {
  const pathname = usePathname();
  const { dict } = useLanguage();
  const t = dict.adminNav.sidebar;

  const iconStyle = { width: 17, height: 17 };

  return (
    <nav className="flex flex-1 flex-col gap-5 overflow-y-auto" style={{ padding: "16px 12px" }}>
      <NavGroup
        label={t.moderation}
        pathname={pathname}
        items={[
          { href: "/admin", label: t.demandes, icon: <InboxIcon style={iconStyle} />, count: demandesCount, exact: true },
          {
            href: "/admin/modifications",
            label: t.modifications,
            icon: <PencilIcon style={iconStyle} />,
            count: modificationsCount,
          },
        ]}
      />
      <NavGroup
        label={t.utilisateurs}
        pathname={pathname}
        items={[
          {
            href: "/admin/chauffeurs/liste",
            activeMatch: "/admin/chauffeurs",
            label: t.chauffeurs,
            icon: <UserIcon style={iconStyle} />,
          },
        ]}
      />
      <NavGroup
        label={t.catalogue}
        pathname={pathname}
        items={[
          {
            href: "/admin/vehicules/liste",
            activeMatch: "/admin/vehicules",
            label: t.vehicules,
            icon: <CarIcon style={iconStyle} />,
          },
          {
            href: "/admin/zones/liste",
            activeMatch: "/admin/zones",
            label: t.zones,
            icon: <PinIcon style={iconStyle} />,
          },
          {
            href: "/admin/options/liste",
            activeMatch: "/admin/options",
            label: t.options,
            icon: <SlidersIcon style={iconStyle} />,
          },
          {
            href: "/admin/modes-paiement/liste",
            activeMatch: "/admin/modes-paiement",
            label: t.modesPaiement,
            icon: <CreditCardIcon style={iconStyle} />,
          },
        ]}
      />
      <NavGroup
        label={t.systeme}
        pathname={pathname}
        items={[{ href: "/admin/reglages", label: t.reglages, icon: <SettingsIcon style={iconStyle} /> }]}
      />
    </nav>
  );
}
