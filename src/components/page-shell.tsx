import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageShell(props: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-semibold">
            ContentDrip
          </Link>

          <div className="flex items-center gap-3">
            {props.headerAction}
            <Link
              href="/manage"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Manage
            </Link>
          </div>
        </div>
      </header>

      <main className={cn("container mx-auto w-full max-w-3xl px-4 py-10", props.className)}>
        {(props.title || props.subtitle) && (
          <header className="mb-8">
            {props.title && (
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {props.title}
              </h1>
            )}
            {props.subtitle && (
              <p className="mt-2 max-w-prose text-muted-foreground">
                {props.subtitle}
              </p>
            )}
          </header>
        )}

        {props.children}
      </main>

      <footer className="border-t">
        <div className="container mx-auto flex max-w-3xl items-center justify-between px-4 py-6 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} ContentDrip</span>
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
