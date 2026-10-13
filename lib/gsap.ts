"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { type EaseName, ease, mirror } from "@/design/tokens";

// Register once at module load; every client module imports GSAP from here so
// plugins are guaranteed to be registered before first use.
gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, useGSAP);

// Token curves become named GSAP eases ("machine", "machine.return", ...), so
// timelines reference tokens by name and never carry raw control points.
for (const name of Object.keys(ease) as EaseName[]) {
  CustomEase.create(name, ease[name].join(","));
  CustomEase.create(`${name}.return`, mirror(ease[name]).join(","));
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
