"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/context";
import {
  CarIcon,
  CreditCardIcon,
  ExternalLinkIcon,
  InboxIcon,
  LockIcon,
  PencilIcon,
  PhoneIcon,
  PinIcon,
  SlidersIcon,
  StarIcon,
  UserIcon,
} from "@/components/icons";
import InitialsAvatar from "@/components/admin/InitialsAvatar";
import MonProfilForm, { type MonProfilFormProps, type MonProfilSection } from "./MonProfilForm";
import ChangerMotDePasseForm from "./ChangerMotDePasseForm";

export type MessageRecu = {
  id: string;
  nom: string;
  email: string;
  message: string;
  date: string;
};

type NavItem = { key: MonProfilSection; label: string; icon: ReactNode; count?: number };

const iconStyle = { width: 17, height: 17 };

function NavGroup({
  label,
  items,
  section,
  onSelect,
}: {
  label: string;
  items: NavItem[];
  section: MonProfilSection;
  onSelect: (key: MonProfilSection) => void;
}) {
  return (
    <div className="flex flex-shrink-0 gap-0.5 md:flex-col">
      <h6 className="hidden pb-1.5 md:block" style={{ padding: "0 12px", color: "var(--color-neutral-700)", fontSize: 11 }}>
        {label}
      </h6>
      {items.map((item) => {
        const active = item.key === section;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect(item.key)}
            aria-current={active ? "page" : undefined}
            className="flex items-center gap-2.5 whitespace-nowrap text-left"
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
          </button>
        );
      })}
    </div>
  );
}

export default function MonProfilShell({
  userId,
  email,
  initiales,
  hasPendingChanges,
  messages,
  formProps,
}: {
  userId: string;
  email: string;
  initiales: string;
  hasPendingChanges: boolean;
  messages: MessageRecu[];
  formProps: MonProfilFormProps;
}) {
  const { dict } = useLanguage();
  const t = dict.monProfilPage;
  const [section, setSection] = useState<MonProfilSection>("identite");

  const groups: { label: string; items: NavItem[] }[] = [
    {
      label: t.nav.groupeProfil,
      items: [
        { key: "identite", label: t.nav.identite, icon: <UserIcon style={iconStyle} /> },
        { key: "coordonnees", label: t.nav.coordonnees, icon: <PhoneIcon style={iconStyle} /> },
        { key: "vehicule", label: t.nav.vehicule, icon: <CarIcon style={iconStyle} /> },
        { key: "langues", label: t.nav.langues, icon: <PencilIcon style={iconStyle} /> },
        { key: "galerie", label: t.nav.galerie, icon: <StarIcon style={iconStyle} /> },
      ],
    },
    {
      label: t.nav.groupeActivite,
      items: [
        { key: "zones", label: t.nav.zones, icon: <PinIcon style={iconStyle} /> },
        { key: "options", label: t.nav.options, icon: <SlidersIcon style={iconStyle} /> },
        { key: "paiement", label: t.nav.paiement, icon: <CreditCardIcon style={iconStyle} /> },
      ],
    },
    {
      label: t.nav.groupeCompte,
      items: [
        { key: "motDePasse", label: t.nav.motDePasse, icon: <LockIcon style={iconStyle} /> },
        { key: "messages", label: t.messagesRecus, icon: <InboxIcon style={iconStyle} />, count: messages.length },
      ],
    },
  ];
  const currentLabel = groups.flatMap((g) => g.items).find((item) => item.key === section)?.label ?? "";

  return (
    <div className="flex flex-col md:flex-row md:items-start">
      <aside
        className="flex flex-shrink-0 flex-col md:sticky md:w-[264px]"
        style={{
          top: "var(--navbar-h)",
          borderRight: "1px solid var(--color-divider)",
          borderBottom: "1px solid var(--color-divider)",
          background: "var(--color-surface)",
        }}
      >
        <div className="flex items-center gap-3" style={{ padding: 20, borderBottom: "1px solid var(--color-divider)" }}>
          {formProps.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={formProps.photoUrl} alt="" className="h-9 w-9 flex-shrink-0 rounded-full object-cover" />
          ) : (
            <InitialsAvatar initials={initiales} size={36} />
          )}
          <div className="min-w-0">
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14 }}>
              {formProps.prenom} {formProps.nom}
            </div>
            <div className="truncate text-[12px]" style={{ color: "var(--color-neutral-700)" }}>
              {email}
            </div>
          </div>
        </div>

        <nav className="flex gap-5 overflow-x-auto p-3 md:flex-col md:overflow-y-auto md:px-3 md:py-4">
          {groups.map((group) => (
            <NavGroup key={group.label} label={group.label} items={group.items} section={section} onSelect={setSection} />
          ))}
        </nav>

        <div className="hidden md:block" style={{ padding: 16, borderTop: "1px solid var(--color-divider)" }}>
          <Link href={`/profil/${userId}`} className="btn btn-secondary btn-block">
            <ExternalLinkIcon style={{ width: 14, height: 14 }} />
            {t.nav.voirFiche}
          </Link>
        </div>
      </aside>

      <div className="mx-auto flex w-full min-w-0 max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
        <div className="flex flex-col gap-2">
          <div className="kicker">{t.kicker}</div>
          <div className="flex items-center gap-2.5">
            <h1 style={{ fontSize: 34, lineHeight: 1, letterSpacing: "-0.02em" }}>{t.titre}</h1>
            <span style={{ color: "var(--color-neutral-700)" }}>›</span>
            <span className="text-[17px]" style={{ color: "var(--color-neutral-800)" }}>
              {currentLabel}
            </span>
          </div>
        </div>

        {hasPendingChanges && (
          <p
            className="border px-4 py-3 text-sm"
            style={{ borderColor: "var(--color-accent)", color: "var(--color-accent-800)", background: "var(--color-accent-100)" }}
          >
            {t.modificationsEnAttente}
          </p>
        )}

        <MonProfilForm {...formProps} section={section} />

        {section === "motDePasse" && <ChangerMotDePasseForm />}

        {section === "messages" && (
          <div className="blueprint relative flex flex-col gap-4 p-5" style={{ background: "var(--color-surface)" }}>
            <i className="corner tl" />
            <i className="corner tr" />
            <i className="corner bl" />
            <i className="corner br" />
            <h6 style={{ color: "var(--color-neutral-700)" }}>{t.messagesRecus}</h6>
            {messages.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--color-neutral-700)" }}>
                {t.aucunMessage}
              </p>
            ) : (
              <div className="flex flex-col divide-y" style={{ borderColor: "var(--color-divider)" }}>
                {messages.map((message) => (
                  <div key={message.id} className="py-4" style={{ borderColor: "var(--color-divider)" }}>
                    <p className="text-[13px]" style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}>
                      {message.nom}{" "}
                      <span style={{ fontWeight: 400, color: "var(--color-neutral-700)" }}>{message.email}</span>
                    </p>
                    <p
                      className="mt-1.5 whitespace-pre-line text-[14px] leading-[1.5]"
                      style={{ color: "var(--color-neutral-900)" }}
                    >
                      {message.message}
                    </p>
                    <p className="mt-1.5 text-[11px]" style={{ color: "var(--color-neutral-500)" }}>
                      {message.date}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
