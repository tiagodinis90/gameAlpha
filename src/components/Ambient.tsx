import { useMemo } from "react";

interface Props {
  embers?: number;
  mist?: boolean;
  dim?: boolean;
}

/** Layered ambient atmosphere: drifting mist bands + rising spirit embers. */
export default function Ambient({ embers = 18, mist = true, dim = false }: Props) {
  const specs = useMemo(
    () =>
      Array.from({ length: embers }, (_, i) => ({
        id: i,
        left: `${(i * 137.5) % 100}%`,
        size: 2 + ((i * 7) % 4),
        dur: 14 + ((i * 11) % 22),
        delay: -((i * 3.7) % 30),
        o: 0.25 + ((i * 13) % 50) / 100,
        x: ((i * 29) % 80) - 40,
      })),
    [embers],
  );

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${dim ? "opacity-60" : ""}`} aria-hidden>
      {mist && (
        <>
          <div className="anim-mist mist-band top-[18%] h-28" />
          <div className="anim-mist2 mist-band top-[46%] h-40 opacity-70" />
          <div className="anim-mist mist-band top-[72%] h-32" style={{ animationDelay: "-12s" }} />
        </>
      )}
      {specs.map((s) => (
        <span
          key={s.id}
          className="ember"
          style={{
            left: s.left,
            width: s.size,
            height: s.size,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
            ["--ember-o" as never]: s.o,
            ["--ember-x" as never]: `${s.x}px`,
          }}
        />
      ))}
    </div>
  );
}
