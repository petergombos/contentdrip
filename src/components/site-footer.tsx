import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/config";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-5xl px-6 py-14 md:py-20">
        <div className="grid gap-10 sm:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="group inline-flex items-center gap-2 font-serif text-lg font-semibold no-underline text-foreground"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                {siteConfig.name[0]}
              </span>
              {siteConfig.name}
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Thoughtful content, delivered at your pace. Subscribe to curated
              email courses and build lasting knowledge one lesson at a time.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
              Navigate
            </p>
            <ul className="mt-4 list-none space-y-2.5 p-0">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/manage"
                  className="text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
                >
                  Manage Subscription
                </Link>
              </li>
            </ul>
          </div>

          {/* Promise */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
              Our Promise
            </p>
            <ul className="mt-4 list-none space-y-2.5 p-0">
              <li className="text-sm text-muted-foreground">
                Free forever, no catch
              </li>
              <li className="text-sm text-muted-foreground">
                Pause or cancel anytime
              </li>
              <li className="text-sm text-muted-foreground">
                One-click unsubscribe
              </li>
              <li className="text-sm text-muted-foreground">
                No spam, no selling your data
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 border-t pt-8 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-muted-foreground/50">
              Powered by{" "}
              <a
                href="https://contentdrip.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-muted-foreground/80 transition-colors"
              >
                ContentDrip
              </a>
            </p>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
