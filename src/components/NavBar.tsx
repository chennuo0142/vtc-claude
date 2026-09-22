import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default async function NavBar() {
  const session = await auth();

  return (
    <header
      className="sticky top-0 z-10 flex items-center gap-6 border-b px-6 py-3.5"
      style={{ borderColor: "var(--color-divider)", background: "var(--color-bg)" }}
    >
      <Link href="/" className="mr-auto flex items-center gap-2.5">
        <span className="block h-3.5 w-3.5 border" style={{ borderColor: "var(--color-accent)" }} />
        <span
          className="text-[19px] font-semibold uppercase tracking-[0.1em]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Mise en relation
        </span>
      </Link>

      {!session && (
        <>
          <Link href="/inscription" className="text-[13.5px] hover:text-[var(--color-accent)]">
            Devenir chauffeur
          </Link>
          <Link href="/connexion" className="text-[13.5px] hover:text-[var(--color-accent)]">
            Connexion
          </Link>
        </>
      )}
      {session?.user.status === "APPROVED" && (
        <Link href="/mon-profil" className="text-[13.5px] hover:text-[var(--color-accent)]">
          Mon profil
        </Link>
      )}
      {session?.user.role === "ADMIN" && (
        <Link href="/admin" className="text-[13.5px] hover:text-[var(--color-accent)]">
          Admin
        </Link>
      )}
      {session && (
        <span className="text-[13.5px]" style={{ color: "var(--color-neutral-700)" }}>
          {session.user.email}
        </span>
      )}
      {session && (
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit" className="text-[13.5px] hover:text-[var(--color-accent)]">
            Déconnexion
          </button>
        </form>
      )}

      {!session && (
        <Link
          href="/inscription"
          className="btn btn-primary blueprint uppercase tracking-[0.06em]"
          style={{ fontSize: 13, padding: "7px 16px" }}
        >
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          S&apos;inscrire
        </Link>
      )}

      <span className="mx-1 h-[18px] w-px" style={{ background: "var(--color-divider)" }} />
      <ThemeSwitcher />
    </header>
  );
}
