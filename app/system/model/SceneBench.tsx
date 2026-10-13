"use client";

import { useState } from "react";
import { SceneView } from "@/components/three/SceneView";
import { TIER_ORDER } from "@/design/quality-tiers";
import type { EnvironmentId, ShotId } from "@/design/three-presets";
import { useSceneStore } from "@/lib/store";

const SHOTS: readonly ShotId[] = ["hero", "elevation", "explode", "section"];

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | null;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="flex flex-wrap items-center gap-1">
      <legend className="type-annotation text-ink-muted">{label}</legend>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === value}
          onClick={() => onChange(option)}
          className={`border border-rule px-1 py-px type-annotation ${
            option === value ? "bg-ink text-ground" : "text-ink"
          }`}
        >
          {option}
        </button>
      ))}
    </fieldset>
  );
}

/**
 * Phase 05 checks: one canvas behind several views, idle at 0 fps, damped
 * shot changes, drag-rotate, zoom limits, tier step-down and posters.
 */
export function SceneBench() {
  const [shot, setShot] = useState<ShotId>("hero");
  const [env, setEnv] = useState<EnvironmentId>("lab");
  const tier = useSceneStore((s) => s.tier);
  const setTier = useSceneStore((s) => s.setTier);
  const views = useSceneStore((s) => s.views);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <Choice
          label="Main view shot"
          value={shot}
          options={SHOTS}
          onChange={setShot}
        />
        <Choice
          label="Main view environment"
          value={env}
          options={["lab", "sheet"]}
          onChange={setEnv}
        />
        <Choice
          label="Tier"
          value={tier}
          options={TIER_ORDER}
          onChange={setTier}
        />
      </div>

      <section className="flex flex-col gap-1">
        <h2 className="type-annotation text-ink-muted">
          Main: drag to rotate. Posters are captured from this view.
        </h2>
        <SceneView
          id="bench-main"
          shot={shot}
          poster="hero"
          env={env}
          rotate
          eager
          className="aspect-video w-full"
        />
      </section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <section className="flex flex-col gap-1">
          <h2 className="type-annotation text-ink-muted">Sheet, hero</h2>
          <SceneView
            id="bench-sheet-hero"
            shot="hero"
            poster="hero"
            env="sheet"
            rotate
            sizes="(min-width: 48rem) 50vw, 100vw"
            className="aspect-video w-full"
          />
        </section>
        <section className="flex flex-col gap-1">
          <h2 className="type-annotation text-ink-muted">Lab, elevation</h2>
          <SceneView
            id="bench-lab-elevation"
            shot="elevation"
            poster="elevation"
            env="lab"
            sizes="(min-width: 48rem) 50vw, 100vw"
            className="aspect-video w-full"
          />
        </section>
      </div>

      {/* Far below the fold: must not render until scrolled to. */}
      <div className="h-[150vh]" aria-hidden="true" />

      <section className="flex flex-col gap-1">
        <h2 className="type-annotation text-ink-muted">
          Sheet, elevation, rotate + zoom (explorer behaviour)
        </h2>
        <SceneView
          id="bench-zoom"
          shot="elevation"
          poster="elevation"
          env="sheet"
          rotate
          zoom
          className="aspect-video w-full"
        />
      </section>

      <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 type-data">
        {Object.entries(views).map(([id, view]) => (
          <div key={id} className="contents">
            <dt className="text-ink-muted">{id}</dt>
            <dd>
              {view.visible ? "visible" : "hidden"},{" "}
              {view.ready ? "ready" : "loading"}, {view.shot}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
