export default function EnergyFormsSimulationPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          Energy Forms and Changes Simulator
        </h1>

        <p className="mt-1 text-muted-foreground">
          Explore different forms of energy and how they change using the
          interactive simulation.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <iframe
          src="https://phet.colorado.edu/sims/html/energy-forms-and-changes/latest/energy-forms-and-changes_en.html"
          title="Energy Forms and Changes Simulator"
          className="h-[700px] w-full"
          allowFullScreen
        />
      </div>
    </div>
  );
}