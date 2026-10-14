"use client";

import { useEffect, useMemo } from "react";
import {
  Color,
  type Material,
  type MeshPhysicalMaterial,
  type Plane,
} from "three";
import type { ExplorerState } from "@/components/explorer/explorer-machine";
import type { MaterialPresetId, PartId, PartSpec } from "@/data/types";
import {
  createDrawingSurface,
  createMaterial,
  createSectionStencil,
  createXrayGhost,
  drawingEdges,
  drawingEdgesMuted,
  type EnvironmentId,
  xrayHighlight,
} from "@/design/three-presets";

export interface PartLook {
  surface: Material;
  /** Ink edge colour in drawing mode, or null for no edges. */
  edges: string | null;
}

// How strongly the copper state colour tints a highlighted shaded part.
const HIGHLIGHT_EMISSIVE = 0.2;

/**
 * Every material the explorer can show, created once per environment and
 * swapped by reference. Highlighted presets differ only in emissive, a
 * uniform, so they share the base preset's shader program: a mode or
 * selection change never compiles anything after its first use.
 */
export function useTechnicalMaterials(
  env: EnvironmentId,
  sectionPlane: Plane,
  sectionOn: boolean,
) {
  const cache = useMemo(() => {
    const presets = new Map<MaterialPresetId, MeshPhysicalMaterial>();
    const highlighted = new Map<MaterialPresetId, MeshPhysicalMaterial>();
    const shared = {
      ghost: createXrayGhost(env),
      ghostHighlight: createXrayGhost(env, xrayHighlight[env]),
      drawing: createDrawingSurface(env),
      stencilBack: createSectionStencil("back"),
      stencilFront: createSectionStencil("front"),
    };
    let clipping: Plane[] | null = null;

    const all = (): Material[] => [
      ...presets.values(),
      ...highlighted.values(),
      ...Object.values(shared),
    ];

    const preset = (id: MaterialPresetId, highlight: boolean) => {
      const map = highlight ? highlighted : presets;
      let material = map.get(id);
      if (!material) {
        material = createMaterial(id);
        if (highlight) {
          material.emissive = new Color(xrayHighlight[env]);
          material.emissiveIntensity = HIGHLIGHT_EMISSIVE;
        }
        material.clippingPlanes = clipping;
        map.set(id, material);
      }
      return material;
    };

    return {
      shared,
      preset,
      all,
      setClipping(planes: Plane[] | null) {
        clipping = planes;
        for (const material of all()) material.clippingPlanes = planes;
      },
    };
  }, [env]);

  useEffect(
    () => () => {
      for (const material of cache.all()) material.dispose();
    },
    [cache],
  );

  // Stencil passes always clip; part surfaces only while the section is on.
  // Idempotent, so safe to run during render, before the frame that uses it.
  cache.setClipping(sectionOn ? [sectionPlane] : null);
  cache.shared.stencilBack.clippingPlanes = [sectionPlane];
  cache.shared.stencilFront.clippingPlanes = [sectionPlane];

  return useMemo(
    () => ({
      stencil: {
        back: cache.shared.stencilBack,
        front: cache.shared.stencilFront,
      },
      lookFor(
        part: PartSpec,
        { mode, isolated }: ExplorerState,
        hovered: PartId | null,
      ): PartLook {
        const highlight = part.id === isolated || part.id === hovered;
        const ghosted = isolated !== null && part.id !== isolated;

        if (mode === "xray") {
          return {
            surface: highlight
              ? cache.shared.ghostHighlight
              : cache.shared.ghost,
            edges: null,
          };
        }
        if (mode === "drawing") {
          return {
            surface:
              ghosted && !highlight ? cache.shared.ghost : cache.shared.drawing,
            edges: highlight
              ? xrayHighlight[env]
              : ghosted
                ? drawingEdgesMuted[env]
                : drawingEdges[env].color,
          };
        }
        if (ghosted && !highlight)
          return { surface: cache.shared.ghost, edges: null };
        return { surface: cache.preset(part.material, highlight), edges: null };
      },
    }),
    [cache, env],
  );
}
