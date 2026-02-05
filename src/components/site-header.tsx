import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteHeader(props: { action?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-lg tracking-tight">Content Drip</span>
          <span className="text-xs text-muted-foreground">quiet delivery</span>
        </Link>

        <div className="flex items-center gap-2">
          {props.action}
          <Button asChild variant="secondary" size="sm">
            <Link href="/manage">Manage</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
