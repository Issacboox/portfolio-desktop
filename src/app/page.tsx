import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-6 py-24">
      <Badge variant="secondary" className="w-fit">
        Bangkok · open to UK roles
      </Badge>

      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Nurarat Sangreuang
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Full-stack .NET &amp; Next.js engineer who builds AI features that ship.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/api/v1/health" className={cn(buttonVariants())}>
          Check database
        </Link>
        <a
          href="https://github.com/Issacboox"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          GitHub
        </a>
      </div>

      <p className="text-sm text-muted-foreground">
        Coming soon: Get to Know Me, Projects, Blog and Ask AI.
      </p>
    </main>
  );
}
