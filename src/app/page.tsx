import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bone, FlaskConical, ClipboardCheck } from "lucide-react";

const features = [
  {
    href: "/anatomy",
    icon: Bone,
    title: "3D Human Anatomy",
    description: "Explore an interactive 3D model of human anatomy, organized by system.",
  },
  {
    href: "/simulations",
    icon: FlaskConical,
    title: "Science Simulations",
    description: "Hands-on interactive simulations — starting with a pH value simulator.",
  },
  {
    href: "/quiz",
    icon: ClipboardCheck,
    title: "Weekly Quiz",
    description: "Take this week's MCQ paper the moment your teacher publishes it.",
  },
];

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Learn with LearnLab
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          3D anatomy, interactive science simulations, and weekly quizzes —
          all in one place for tuition class.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/signup">Get started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/quiz">I have a quiz link</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <Link key={f.href} href={f.href}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <f.icon className="mb-2 size-6" />
                  <CardTitle>{f.title}</CardTitle>
                  <CardDescription>{f.description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
