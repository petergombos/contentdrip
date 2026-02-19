import { siteConfig } from "@/config";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-lg supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 no-underline transition-opacity hover:opacity-80"
        >
          {/* Small decorative mark */}
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary transition-colors group-hover:bg-primary/15">
            {siteConfig.name[0]}
          </span>
          <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
            {siteConfig.name}
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/manage"
            className="text-[13px] font-medium text-muted-foreground no-underline transition-colors hover:text-foreground"
          >
            Manage
          </Link>
        </nav>
      </div>
    </header>
  );
}
