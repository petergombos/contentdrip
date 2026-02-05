import { SubscribeForm } from "@/components/subscribe-form";
import { Card } from "@/components/ui/card";
import { getAllPacks } from "@/content-packs/registry";
import "@/content-packs";

export default function HomePage() {
  const packs = getAllPacks();
  const pack = packs[0];

  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-2xl px-4 py-12 md:py-16">
        <header className="space-y-3">
          <p className="text-sm text-muted-foreground">ContentDrip</p>
          <h1 className="text-4xl font-bold tracking-tight">
            A simple email series template
          </h1>
          <p className="text-muted-foreground">
            Drop in a content pack, brand the landing page, and ship. This base
            project is intentionally neutral so it’s easy to clone and adapt.
          </p>
        </header>

        {pack ? (
          <section className="mt-10 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Available pack</h2>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{pack.name}</span>
                {" — "}
                {pack.description}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Includes {pack.steps.length} emails. Delivered daily.
              </p>
            </div>

            <Card className="p-6">
              <SubscribeForm />
            </Card>
          </section>
        ) : (
          <section className="mt-10">
            <Card className="p-6">
              <p className="text-muted-foreground">
                No pack registered. Add one in <code>src/content-packs</code>.
              </p>
            </Card>
          </section>
        )}

        <footer className="mt-10 text-sm text-muted-foreground">
          Every email includes manage/unsubscribe links.
        </footer>
      </div>
    </main>
  );
}
