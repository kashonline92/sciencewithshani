import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FlaskConical } from "lucide-react";

const sims = [
  {
    title: "pH Value Simulator",
    description: "Adjust concentration and explore how pH changes.",
    embedUrl:
      "https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_en.html",
  },
];

export default function SimulationsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-2xl font-semibold">Science Simulations</h1>

      <p className="mt-1 text-muted-foreground">
        Interactive simulations to explore scientific concepts.
      </p>

      <div className="mt-8 space-y-8">
        {sims.map((sim) => (
          <Card key={sim.embedUrl} className="overflow-hidden">
            <CardHeader>
              <FlaskConical className="mb-2 size-6" />

              <CardTitle>{sim.title}</CardTitle>

              <CardDescription>
                {sim.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="w-full overflow-hidden rounded-lg border bg-white">
                <iframe
                  src={sim.embedUrl}
                  title={sim.title}
                  className="h-[600px] w-full"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}