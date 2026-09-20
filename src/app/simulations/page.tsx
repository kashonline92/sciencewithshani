import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FlaskConical } from "lucide-react";

const sims = [
  {
    href: "/simulations/ph",
    title: "pH Value Simulator",
    description: "Adjust concentration and explore how pH changes.",
    icon: FlaskConical,
  },
];

export default function SimulationsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-2xl font-semibold">Science Simulations</h1>

      <p className="mt-1 text-muted-foreground">
        Interactive simulations to explore scientific concepts.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sims.map((sim) => {
          const Icon = sim.icon;

          return (
            <Link key={sim.href} href={sim.href}>
              <Card className="h-full cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md">
                <CardHeader>
                  <div className="mb-3 flex size-11 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-5" />
                  </div>

                  <CardTitle>{sim.title}</CardTitle>

                  <CardDescription>
                    {sim.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}