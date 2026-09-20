import { Card, CardContent } from "@/components/ui/card";

export default function AnatomyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-2xl font-semibold">3D Human Anatomy</h1>
      <p className="mt-1 text-muted-foreground">
        This is where the 3D anatomy viewer will live.
      </p>

      <Card className="mt-8">
        <CardContent className="flex h-[520px] items-center justify-center text-muted-foreground">
          {/* TODO: embed 3D anatomy model/viewer here */}
          3D model placeholder — drop your viewer/embed in here.
        </CardContent>
      </Card>
    </div>
  );
}
