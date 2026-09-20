import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FlaskConical } from "lucide-react";

const sims = [
  {
    href: "/simulations/ph",
    title: "pH Value Simulator",
    description: "Adjust concentration and see how the pH value responds.",
  },
  // Add more simulations here as new folders, e.g. /simulations/circuits
];

export default function SimulationsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-2xl font-semibold">Science Simulations</h1>
      <p className="mt-1 text-muted-foreground">
        Interactive scenes to explore scientific concepts.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {sims.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <FlaskConical className="mb-2 size-6" />
                <CardTitle>{s.title}</CardTitle>
                <CardDescription>{s.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
