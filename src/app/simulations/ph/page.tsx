"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function pHColor(ph: number) {
  // Rough universal-indicator style coloring, 0 (red/acid) -> 14 (purple/base)
  if (ph <= 2) return "#e11d2e";
  if (ph <= 4) return "#f97316";
  if (ph <= 6) return "#facc15";
  if (ph <= 7) return "#22c55e";
  if (ph <= 9) return "#3b82f6";
  if (ph <= 12) return "#6366f1";
  return "#8b5cf6";
}

function pHLabel(ph: number) {
  if (ph < 7) return "Acidic";
  if (ph === 7) return "Neutral";
  return "Basic";
}

export default function PhSimulationPage() {
  const [ph, setPh] = useState(7);
  const color = useMemo(() => pHColor(ph), [ph]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-2xl font-semibold">pH Value Simulator</h1>
      <p className="mt-1 text-muted-foreground">
        Drag the slider to change the pH and watch the solution respond.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Interactive demo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6">
            <div
              className="size-32 rounded-full border shadow-inner transition-colors"
              style={{ backgroundColor: color }}
            />
            <div className="text-center">
              <div className="text-4xl font-bold">{ph.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">{pHLabel(ph)}</div>
            </div>
            <input
              type="range"
              min={0}
              max={14}
              step={0.1}
              value={ph}
              onChange={(e) => setPh(parseFloat(e.target.value))}
              className="w-full max-w-md"
            />
            <div className="flex w-full max-w-md justify-between text-xs text-muted-foreground">
              <span>0 (acid)</span>
              <span>7 (neutral)</span>
              <span>14 (base)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/*
        Slot for embedding a richer external scene (e.g. a PhET simulation,
        or your own Unity/Three.js build), once you have it:

        <iframe
          src="https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_en.html"
          className="mt-8 h-[600px] w-full rounded-lg border"
          allowFullScreen
        />
      */}
    </div>
  );
}
