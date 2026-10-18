import type { Entry } from "@keystatic/core/reader";
import type keystaticConfig from "../../keystatic.config";
import { MediaTile, VideoTile } from "./Media";
import { Reveal } from "./Reveal";

type Project = Entry<(typeof keystaticConfig)["collections"]["projects"]>;
type Block = Project["blocks"][number];

const FULL = "(max-width: 768px) 100vw, 96vw";
const HALF = "(max-width: 768px) 100vw, 48vw";

function TextBlock({ columns }: { columns: readonly string[] }) {
  const two = columns.length > 1;
  return (
    <section className="px-[var(--gutter-case)] py-[clamp(72px,13.1vw,227px)]">
      <div className={two ? "mx-auto grid max-w-[1568px] gap-y-10 md:grid-cols-2" : "mx-auto max-w-[1044px]"}>
        {columns.map((text, i) => (
          <Reveal key={i} delay={i * 0.12} className="flex justify-center md:px-8">
            <p className={`mono-copy ${two ? "max-w-[644px]" : "max-w-[812px]"}`}>{text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.discriminant) {
    case "text":
      return <TextBlock columns={block.value.columns} />;
    case "image": {
      const v = block.value;
      if (!v.image && !v.video) return null;
      return (
        <div className="px-[var(--gutter-case)]">
          {v.video ? (
            <VideoTile src={v.video} poster={v.image} background={v.background} fit={v.fit} rounded={v.rounded} label={v.alt} />
          ) : (
            <MediaTile src={v.image!} alt={v.alt} background={v.background} fit={v.fit} rounded={v.rounded} aspect="1648 / 936" sizes={FULL} />
          )}
        </div>
      );
    }
    case "pair": {
      const { left, right } = block.value;
      return (
        <div className="grid gap-[var(--gap)] px-[var(--gutter-case)] md:grid-cols-2">
          {[left, right].map((side, i) =>
            side.video ? (
              <VideoTile key={i} src={side.video} poster={side.image} background={side.background} aspect="1 / 1" label={side.alt} />
            ) : side.image ? (
              <MediaTile key={i} src={side.image} alt={side.alt} background={side.background} aspect="1 / 1" sizes={HALF} />
            ) : (
              <div key={i} className="aspect-square rounded-[var(--radius)]" style={{ background: side.background }} />
            )
          )}
        </div>
      );
    }
    case "video": {
      const v = block.value;
      if (!v.src) return null;
      return (
        <div className="px-[var(--gutter-case)]">
          <VideoTile src={v.src} poster={v.poster} background={v.background} />
        </div>
      );
    }
  }
}

export function Blocks({ blocks }: { blocks: readonly Block[] }) {
  return (
    <div className="flex flex-col gap-[var(--gap)]">
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  );
}
