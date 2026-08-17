"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type User = { id: string; name?: string | null } | null;

const navLinks = [
  { href: "/", label: "Browse" },
  { href: "/recipes/new", label: "New Recipe" },
  { href: "/my-recipes", label: "My Recipes" },
];

export default function AppShell({ user }: { user: User }) {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl leading-none">🍲</span>
            <span className="text-lg font-bold tracking-tight">Recipebook</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-brand text-white"
                    : "text-foreground/70 hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-muted">
                  Hi, {user.name?.split(" ")[0]}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-full border border-border px-3 py-1.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-foreground/70 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <nav
        className="fixed bottom-0 inset-x-0 z-40 flex sm:hidden items-stretch border-t border-border bg-card"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <BottomLink
          href="/"
          label="Browse"
          active={pathname === "/"}
          icon="🏠"
        />
        <BottomLink
          href="/recipes/new"
          label="New"
          active={pathname === "/recipes/new"}
          icon="➕"
        />
        <BottomLink
          href={user ? "/my-recipes" : "/login"}
          label={user ? "My Recipes" : "Log in"}
          active={pathname === "/my-recipes" || pathname === "/login"}
          icon={user ? "📖" : "👤"}
        />
      </nav>
    </>
  );
}

function BottomLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium ${
        active ? "text-brand" : "text-muted"
      }`}
    >
      <span className="text-xl leading-none">{icon}</span>
      {label}
    </Link>
  );
}
