import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  FlaskConical,
  Atom,
  Dna,
  Orbit,
  Zap,
  Microscope,
} from "lucide-react";

const sims = [
  {
    href: "/simulations/ph",
    title: "pH Value Simulator",
    description:
      "Explore acids, bases, concentration, and how pH changes.",
    icon: FlaskConical,
  },
  {
    href: "/simulations/density",
    title: "Density Simulator",
    description:
      "Explore mass, volume, and density of different materials.",
    icon: Atom,
  },
  {
    href: "/simulations/dna",
    title: "DNA Explorer",
    description:
      "Explore DNA structure, base pairs, and genetic information.",
    icon: Dna,
  },
  {
    href: "/simulations/physics",
    title: "Physics Lab",
    description:
      "Explore motion, forces, energy, and other physics concepts.",
    icon: Orbit,
  },
  {
    href: "/simulations/electricity",
    title: "Electricity Simulator",
    description:
      "Explore voltage, current, resistance, and simple circuits.",
    icon: Zap,
  },
  {
    href: "/simulations/microscope",
    title: "Virtual Microscope",
    description:
      "Explore cells and microscopic structures interactively.",
    icon: Microscope,
  },
];

export default function SimulationsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Science Simulations
        </h1>

        <p className="mt-2 max-w-2xl text-muted-foreground">
          Interactive simulations to explore scientific concepts and
          understand how things work.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sims.map((sim) => {
          const Icon = sim.icon;

          return (
            <Link
              key={sim.href}
              href={sim.href}
              className="group"
            >
              <Card className="h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
                <CardHeader>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-6" />
                  </div>

                  <CardTitle className="text-lg">
                    {sim.title}
                  </CardTitle>

                  <CardDescription className="leading-relaxed">
                    {sim.description}
                  </CardDescription>

                  <div className="pt-3 text-sm font-medium text-primary">
                    Open simulator →
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}