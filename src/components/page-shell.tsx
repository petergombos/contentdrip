import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export function PageShell(props: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {props.header ?? <SiteHeader />}

      <main className="flex-1">
        {/* Optional header band */}
        {(props.title || props.subtitle) && (
          <div className="border-b pb-10 pt-12 md:pb-14 md:pt-16">
            <div className="mx-auto max-w-3xl px-6">
              {props.title && (
                <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl animate-fade-in-up">
                  {props.title}
                </h1>
              )}
              {props.subtitle && (
                <p className="mt-3 max-w-prose text-muted-foreground animate-fade-in-up delay-1">
                  {props.subtitle}
                </p>
              )}
            </div>
          </div>
        )}

        <div
          className={cn(
            "mx-auto w-full max-w-3xl px-6 py-10 md:py-14",
            props.className
          )}
        >
          {props.children}
        </div>
      </main>

      {props.footer ?? <SiteFooter />}
    </div>
  );
}
