import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PhoneIcon, MailIcon, ArrowLeftIcon, PinIcon, CarIcon } from "@/components/icons";
import { parseLangues, formatLangue } from "@/lib/langues";
import ContactForm from "./ContactForm";

export default async function ProfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findFirst({
    where: { id, status: "APPROVED" },
    include: { profile: { include: { vehicule: true } } },
  });

  if (!user || !user.profile) {
    notFound();
  }

  const { nom, prenom, photoUrl, bio, galerie, telephone, emailContact, langues, ville, vehicule } =
    user.profile;
  const photosGalerie = galerie.filter(Boolean);
  const languesParlees = parseLangues(langues);
  const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`;

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-8 px-6 py-6 md:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] no-underline"
        style={{ fontFamily: "var(--font-heading)", color: "var(--color-accent-700)" }}
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Retour à l&apos;annuaire
      </Link>

      <div className="grid gap-8 md:grid-cols-[340px_minmax(0,1fr)] md:items-start">
        <div className="flex flex-col gap-5">
          <div className="blueprint relative aspect-[4/5]">
            <i className="corner tl" />
            <i className="corner tr" />
            <i className="corner bl" />
            <i className="corner br" />
            {photoUrl ? (
              <Image src={photoUrl} alt={`${prenom} ${nom}`} fill className="object-cover" />
            ) : (
              <div className="hatch flex h-full w-full items-center justify-center">
                <span
                  className="text-[88px] font-semibold tracking-[0.06em]"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--color-accent-700)" }}
                >
                  {initiales}
                </span>
              </div>
            )}
            {ville && (
              <span
                className="absolute left-0 top-0 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ fontFamily: "var(--font-heading)", background: "var(--color-accent-900)", color: "var(--color-bg)" }}
              >
                {ville}
              </span>
            )}
          </div>

          <div className="blueprint relative flex flex-col gap-3 p-4" style={{ background: "var(--color-surface)" }}>
            <i className="corner tl" />
            <i className="corner tr" />
            <i className="corner bl" />
            <i className="corner br" />
            <h6 style={{ color: "var(--color-neutral-700)" }}>Contact direct</h6>
            <a
              href={`tel:${telephone}`}
              className="flex items-center gap-2.5 text-[14.5px] no-underline"
              style={{ color: "var(--color-text)" }}
            >
              <PhoneIcon className="h-4 w-4 shrink-0" style={{ color: "var(--color-accent-700)" } as React.CSSProperties} />
              {telephone}
            </a>
            {emailContact && (
              <a
                href={`mailto:${emailContact}`}
                className="flex items-center gap-2.5 break-all text-[13px] no-underline"
                style={{ color: "var(--color-text)" }}
              >
                <MailIcon className="h-4 w-4 shrink-0" style={{ color: "var(--color-accent-700)" } as React.CSSProperties} />
                {emailContact}
              </a>
            )}
            <a
              href="#contact"
              className="btn btn-primary btn-block blueprint relative uppercase tracking-[0.08em]"
              style={{ height: 38 }}
            >
              <i className="corner tl" />
              <i className="corner tr" />
              <i className="corner bl" />
              <i className="corner br" />
              Contacter {prenom}
            </a>
            <span className="text-center text-[11.5px]" style={{ color: "var(--color-neutral-700)" }}>
              Réponse habituelle en moins d&apos;une heure
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="kicker">Chauffeur VTC</div>
            <h1 style={{ fontSize: 44, lineHeight: 1, letterSpacing: "-0.02em" }}>
              {prenom} {nom}
            </h1>
            {ville && (
              <div className="flex flex-wrap items-center gap-4 text-[13px]" style={{ color: "var(--color-neutral-800)" }}>
                <span className="inline-flex items-center gap-1.5">
                  <PinIcon className="h-[15px] w-[15px]" style={{ color: "var(--color-accent-700)" } as React.CSSProperties} />
                  {ville}
                </span>
              </div>
            )}
            {languesParlees.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {languesParlees.map((entry, index) => {
                  const { drapeau, libelle } = formatLangue(entry);
                  return (
                    <span key={index} className="tag tag-outline">
                      {drapeau} {libelle} {"★".repeat(entry.niveau)}
                      {"☆".repeat(3 - entry.niveau)}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {bio ? (
            <p className="m-0 max-w-[58ch] text-[15.5px] leading-[1.6]" style={{ color: "var(--color-neutral-900)" }}>
              {bio}
            </p>
          ) : (
            <p className="m-0" style={{ color: "var(--color-neutral-700)" }}>
              Aucune présentation renseignée.
            </p>
          )}

          {vehicule && (
            <div className="flex items-center gap-3 text-[13px]" style={{ color: "var(--color-neutral-800)" }}>
              {vehicule.photoUrl ? (
                <div className="blueprint relative h-12 w-16 shrink-0 overflow-hidden">
                  <i className="corner tl" />
                  <i className="corner tr" />
                  <i className="corner bl" />
                  <i className="corner br" />
                  <Image src={vehicule.photoUrl} alt="" fill className="object-cover" />
                </div>
              ) : (
                <CarIcon className="h-[15px] w-[15px]" style={{ color: "var(--color-accent-700)" } as React.CSSProperties} />
              )}
              {vehicule.marque} {vehicule.modele}
            </div>
          )}
        </div>
      </div>

      {photosGalerie.length > 0 && (
        <div className="flex flex-col gap-4 border-t pt-5" style={{ borderColor: "var(--color-divider)" }}>
          <div className="flex items-baseline gap-3.5">
            <h2 style={{ fontSize: 28 }}>Galerie</h2>
            <span className="font-mono text-[10.5px] tracking-[0.1em]" style={{ color: "var(--color-neutral-700)" }}>
              {String(photosGalerie.length).padStart(2, "0")} PLANCHES
            </span>
          </div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            {photosGalerie.map((url) => (
              <div key={url} className="blueprint relative aspect-[4/3]">
                <i className="corner tl" />
                <i className="corner tr" />
                <i className="corner bl" />
                <i className="corner br" />
                <Image src={url} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        id="contact"
        className="blueprint relative flex flex-col gap-4 p-6"
        style={{ background: "var(--color-surface)", scrollMarginTop: 80 }}
      >
        <i className="corner tl" />
        <i className="corner tr" />
        <i className="corner bl" />
        <i className="corner br" />
        <div>
          <div className="kicker mb-1">Demande de mise en relation</div>
          <h2 style={{ fontSize: 28 }}>Contacter {prenom}</h2>
        </div>
        <ContactForm userId={user.id} />
      </div>
    </div>
  );
}
