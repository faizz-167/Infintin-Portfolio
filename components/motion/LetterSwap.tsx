type LetterSwapProps = {
  label: string;
  className?: string;
};

// Gap between one letter starting and the next.
const STAGGER_MS = 20;

/**
 * A label whose letters roll up out of their own clipped boxes, an identical
 * copy rolling in from below, while the nearest `group` ancestor is hovered;
 * leaving rolls them back. Plain CSS transitions rather than Motion: a
 * transition reverses from wherever it is, so a hover that ends mid-roll
 * never jumps or locks out, and there is no script on the hover path.
 * `group-hover` only applies on devices that hover, so taps don't roll.
 */
export function LetterSwap({ label, className }: LetterSwapProps) {
  return (
    <span className={`inline-flex ${className ?? ""}`}>
      <span className="sr-only">{label}</span>
      {Array.from(label).map((letter, i) => (
        <span
          // Letters repeat, so position is the only stable key.
          // biome-ignore lint/suspicious/noArrayIndexKey: static label
          key={i}
          aria-hidden="true"
          className="relative inline-block overflow-hidden whitespace-pre"
        >
          <span
            className="block transition-transform duration-(--duration-quick) ease-settle group-hover:-translate-y-full motion-reduce:transform-none motion-reduce:transition-none"
            style={{ transitionDelay: `${i * STAGGER_MS}ms` }}
          >
            {letter}
            <span className="absolute inset-x-0 top-full">{letter}</span>
          </span>
        </span>
      ))}
    </span>
  );
}
