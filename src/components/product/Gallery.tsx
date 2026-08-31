"use client";

import Image from "next/image";
import { useState } from "react";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const src = images[active];

  return (
    <div className="flex gap-3">
      {images.length > 1 && (
        <div className="hidden w-16 shrink-0 flex-col gap-2 sm:flex">
          {images.map((im, i) => (
            <button
              key={im + i}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 bg-ink-50 transition-colors ${
                i === active ? "border-brand-600" : "border-transparent hover:border-ink-200"
              }`}
            >
              <Image src={im} alt={`${title} ${i + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div
          className="relative aspect-square overflow-hidden rounded-2xl bg-ink-50"
          onClick={() => setZoom(true)}
        >
          {src && (
            <Image
              src={src}
              alt={title}
              fill
              priority
              sizes="(max-width:1024px) 100vw, 460px"
              className="cursor-zoom-in object-cover transition-transform duration-300 hover:scale-105"
            />
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-2 flex gap-2 sm:hidden">
            {images.map((im, i) => (
              <button
                key={im + i}
                onClick={() => setActive(i)}
                className={`h-1.5 flex-1 rounded-full ${i === active ? "bg-brand-600" : "bg-ink-200"}`}
                aria-label={`تصویر ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {zoom && (
        <div
          className="fixed inset-0 z-[90] grid place-items-center bg-ink-950/85 p-6"
          onClick={() => setZoom(false)}
        >
          <div className="relative aspect-square w-full max-w-2xl">
            <Image src={src} alt={title} fill className="object-contain" sizes="640px" />
          </div>
        </div>
      )}
    </div>
  );
}
