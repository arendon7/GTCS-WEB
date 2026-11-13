"use client";

import Image from "next/image";
import { useId, useState } from "react";

export type HomePhoto = {
  src: string;
  alt: string;
  title: string;
  caption: string;
};

export function HomePhotoGallery({
  photos,
  label,
  sizes,
}: {
  photos: readonly HomePhoto[];
  label: string;
  sizes: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const galleryId = useId();
  const active = photos[activeIndex];
  const move = (direction: -1 | 1) => {
    setActiveIndex((index) => (index + direction + photos.length) % photos.length);
  };

  return (
    <div className="home-photo-gallery" role="group" aria-label={label}>
      <figure className="home-photo-gallery__figure" id={galleryId}>
        <Image
          key={active.src}
          src={active.src}
          alt={active.alt}
          fill
          sizes={sizes}
        />
        <figcaption aria-live="polite" aria-atomic="true">
          <strong>{active.title}</strong>
          <span>{active.caption}</span>
          <small>{String(activeIndex + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</small>
        </figcaption>
      </figure>
      {photos.length > 1 ? (
        <div className="home-photo-gallery__controls">
          <button type="button" onClick={() => move(-1)} aria-label={`Ver foto anterior de ${label}`} aria-controls={galleryId}>
            Foto anterior
          </button>
          <button type="button" onClick={() => move(1)} aria-label={`Ver foto siguiente de ${label}`} aria-controls={galleryId}>
            Foto siguiente
          </button>
        </div>
      ) : null}
    </div>
  );
}
