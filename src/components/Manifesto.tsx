import { ManifestoArrowA, ManifestoArrowB, ManifestoCircle, ManifestoUnderline } from "./Drawings";
import { Reveal } from "./Reveal";

/** Figma px on the 1728 frame → width-relative units, so wrapping and drawings scale together. */
const u = (px: number) => `calc(${px} * 100cqw / 1728)`;

/**
 * Red Monorama manifesto with hand-drawn marks. Positions come from the Figma
 * "content" frame (1728 × 1888); the text wraps the same at every width
 * because the type scales with the container.
 */
export function Manifesto({ text }: { text: string }) {
  if (!text) return null;
  return (
    <section className="relative w-full overflow-hidden [container-type:inline-size]" aria-label="Manifesto">
      <div className="relative" style={{ paddingTop: u(80), paddingBottom: u(80) }}>
        <Reveal y={24}>
          <p
            className="mx-auto whitespace-pre-line text-center font-mono uppercase text-signal"
            style={{ width: u(1568), fontSize: u(180), lineHeight: 0.8 }}
          >
            {text}
          </p>
        </Reveal>
        <ManifestoArrowA className="absolute text-ink" style={{ left: u(1380.5), top: u(244), width: u(166), height: u(126) }} />
        <ManifestoArrowB className="absolute text-ink" style={{ left: u(559.8), top: u(349.7), width: u(145), height: u(80) }} />
        <ManifestoUnderline
          className="absolute text-ink"
          style={{ left: u(818.7), top: u(508.5), width: u(762), height: u(64), rotate: "2.23deg" }}
        />
        <ManifestoCircle className="absolute text-ink" style={{ left: u(1104), top: u(633), width: u(584), height: u(208) }} />
      </div>
    </section>
  );
}
