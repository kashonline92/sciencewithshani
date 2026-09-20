export default function PhSimulationPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          pH Value Simulator
        </h1>

        <p className="mt-1 text-muted-foreground">
          Explore acids, bases, concentration, and pH using the
          interactive simulation.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <iframe
          src="https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_en.html"
          title="pH Value Simulator"
          className="h-[700px] w-full"
          allowFullScreen
        />
      </div>
    </div>
  );
}