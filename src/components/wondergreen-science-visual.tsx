import Image from "next/image";

type WondergreenScienceVisualProps = {
  family: "solid" | "liquid";
  alt: string;
  caption: string;
  className: string;
  artDirection?: "wide" | "panel";
  panelBreakpoint?: 680 | 700;
};

const assetBase = "/products/wondergreen/home-science-mktg-v02";

export function WondergreenScienceVisual({
  family,
  alt,
  caption,
  className,
  artDirection = "wide",
  panelBreakpoint = 700,
}: WondergreenScienceVisualProps) {
  const landscape = `${assetBase}/${family === "solid" ? "pellet" : "liquid"}-landscape-v02.jpg`;
  const portrait = landscape;
  const image = artDirection === "wide" ? landscape : portrait;

  return (
    <div className={className}>
      {artDirection === "panel" ? (
        <picture>
          <source media={`(max-width: ${panelBreakpoint}px)`} srcSet={landscape} />
          <Image
            src={portrait}
            alt={alt}
            fill
            sizes="(max-width: 700px) 100vw, (max-width: 1000px) 30vw, 18vw"
          />
        </picture>
      ) : (
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 680px) 100vw, (max-width: 980px) 90vw, 45vw"
        />
      )}
      <span className="wondergreen-science-visual__brand" aria-hidden="true">
        <Image src="/brand/wondergreen-nutrients-transparent.png" alt="" width={120} height={63} />
      </span>
      <span>{caption}</span>
    </div>
  );
}
