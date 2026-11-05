"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { type EaseName, ease, mirror } from "@/design/tokens";
import { cubicBezier } from "./cubicBezier";

// Register once at module load; every client module imports GSAP from here so
// plugins are guaranteed to be registered before first use.
gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

// Token curves become named GSAP eases ("machine", "machine.return", ...), so
// timelines reference tokens by name and never carry raw control points.
for (const name of Object.keys(ease) as EaseName[]) {
  gsap.registerEase(name, cubicBezier(ease[name]));
  gsap.registerEase(`${name}.return`, cubicBezier(mirror(ease[name])));
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
