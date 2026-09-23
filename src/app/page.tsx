import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import ProfileCard from "@/components/ProfileCard";
import FiltresBar from "@/components/FiltresBar";
import { buildProfilWhere, matchesLangue, parseFiltresFromSearchParams } from "@/lib/profilFilters";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    langue?: string;
    ville?: string;
    modele?: string;
    places?: string;
  }>;
}) {
  const sp = await searchParams;
  const { page: pageParam } = sp;
  const filtres = parseFiltresFromSearchParams(sp);
  const dict = await getDictionary();
  const t = dict.home;
  const settings = await getSettings();
  const cardsPerPage = settings.cardsPerPage;

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const where = buildProfilWhere(filtres);

  let total: number;
  let currentPage: number;
  let totalPages: number;
  let users: Awaited<ReturnType<typeof fetchUsers>>;

  if (filtres.langue) {
    const all = await fetchUsers(where);
    const filtered = all.filter((u) => matchesLangue(u.profile!.langues, filtres.langue!));
    total = filtered.length;
    totalPages = Math.max(1, Math.ceil(total / cardsPerPage));
    currentPage = Math.min(page, totalPages);
    users = filtered.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage);
  } else {
    total = await prisma.user.count({ where });
    totalPages = Math.max(1, Math.ceil(total / cardsPerPage));
    currentPage = Math.min(page, totalPages);
    users = await prisma.user.findMany({
      where,
      include: { profile: { include: { vehicule: true } } },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * cardsPerPage,
      take: cardsPerPage,
    });
  }

  const filtresParams = new URLSearchParams();
  if (filtres.langue) filtresParams.set("langue", filtres.langue);
  if (filtres.ville) filtresParams.set("ville", filtres.ville);
  if (filtres.modele) filtresParams.set("modele", filtres.modele);
  if (filtres.placesMin) filtresParams.set("places", filtres.placesMin.toString());

  function pageHref(p: number) {
    const params = new URLSearchParams(filtresParams);
    params.set("page", p.toString());
    return `/?${params.toString()}`;
  }

  return (
    <div className="grid md:grid-cols-[252px_minmax(0,1fr)] md:items-start">
      <aside>
        <FiltresBar filtres={filtres} />
      </aside>

      <div className="flex flex-col gap-5 px-6 py-6 md:px-8 md:py-6">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="kicker mb-1">{t.kicker}</div>
            <h1 style={{ fontSize: 42, letterSpacing: "-0.02em" }}>{t.titre}</h1>
          </div>
          <Link href="/inscription" className="btn btn-primary blueprint relative uppercase tracking-[0.06em]" style={{ fontSize: 13 }}>
            <i className="corner tl" />
            <i className="corner tr" />
            <i className="corner bl" />
            <i className="corner br" />
            {t.sinscrire}
          </Link>
        </div>

        {users.length === 0 ? (
          <p style={{ color: "var(--color-neutral-700)" }}>{t.aucunProfil}</p>
        ) : (
          <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(208px, 1fr))" }}>
            {users.map((user) => (
              <ProfileCard
                key={user.id}
                id={user.id}
                nom={user.profile!.nom}
                prenom={user.profile!.prenom}
                photoUrl={user.profile!.photoUrl}
                carteBackgroundUrl={user.profile!.carteBackgroundUrl}
                ville={user.profile!.ville}
                bio={user.profile!.bio}
                numeroReference={user.numeroReference}
                langues={user.profile!.langues}
                vehiculePhotoUrl={user.profile!.vehicule?.photoUrl ?? null}
                vehiculeMarque={user.profile!.vehicule?.marque ?? null}
                vehiculeModele={user.profile!.vehicule?.modele ?? null}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t pt-4" style={{ borderColor: "var(--color-divider)" }}>
            <span className="font-mono text-[10.5px] tracking-[0.08em]" style={{ color: "var(--color-neutral-700)" }}>
              {t.pagination(String(currentPage).padStart(2, "0"), String(totalPages).padStart(2, "0"), total)}
            </span>
            <div className="flex items-center gap-2">
              <Link
                href={pageHref(currentPage - 1)}
                aria-disabled={currentPage <= 1}
                className={`btn btn-secondary ${currentPage <= 1 ? "pointer-events-none opacity-40" : ""}`}
              >
                {t.precedent}
              </Link>
              <Link
                href={pageHref(currentPage + 1)}
                aria-disabled={currentPage >= totalPages}
                className={`btn btn-secondary ${currentPage >= totalPages ? "pointer-events-none opacity-40" : ""}`}
              >
                {t.suivant}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function fetchUsers(where: Prisma.UserWhereInput) {
  return prisma.user.findMany({
    where,
    include: { profile: { include: { vehicule: true } } },
    orderBy: { createdAt: "desc" },
  });
}
