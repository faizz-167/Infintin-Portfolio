import Image from "next/image";
import type { ReactNode } from "react";
import type { Photo as PhotoData } from "@/data/types";

type PhotoProps = {
  photo: PhotoData;
  /** Static aspect class (Tailwind can't see computed ones), e.g. `aspect-[4/3]`. */
  aspect: string;
  /** `next/image` sizes: how wide the frame is at each breakpoint. */
  sizes: string;
  /** Drawing-style corner label set on the frame's top-left. */
  label?: ReactNode;
  /** Draw the hairline frame; off when the photo sits inside a framed cell. */
  framed?: boolean;
  className?: string;
};

/**
 * One photograph in a hairline frame. Every photo on the site gets the same
 * treatment: cropped to its frame, monochrome so mixed sources (studio
 * portrait, phone shot, event snap) sit together on the single-accent
 * palette, colour back under a hovering pointer. Never above the fold, so
 * it always lazy-loads.
 */
export function Photo({
  photo,
  aspect,
  sizes,
  label,
  framed = true,
  className,
}: PhotoProps) {
  return (
    <div
      className={`relative overflow-hidden bg-ground-raised ${framed ? "border border-rule" : ""} ${aspect} ${className ?? ""}`}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        style={photo.position ? { objectPosition: photo.position } : undefined}
        className="object-cover grayscale transition-[filter] duration-(--duration-base) ease-settle hover:grayscale-0 motion-reduce:transition-none"
      />
      {label && (
        <span className="absolute top-0 left-0 border-rule border-r border-b bg-ground px-1 py-[0.125rem] type-caption text-ink">
          {label}
        </span>
      )}
    </div>
  );
}
