"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "@/app/huella/huella-static.css";

export default function HuellaStaticLanding() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState("100vh");
  const [staticHtml, setStaticHtml] = useState("");

  const measure = useCallback(() => {
    const document = frameRef.current?.contentDocument;
    if (!document) return;
    const nextHeight = Math.ceil(Math.max(
      document.documentElement.scrollHeight,
      document.body?.scrollHeight ?? 0,
      document.documentElement.getBoundingClientRect().height,
    ));
    if (nextHeight > 0) setHeight(`${nextHeight}px`);
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/huella-static-v38/landing.html.txt?v=20261104-3")
      .then((response) => {
        if (!response.ok) throw new Error("No se pudo cargar la landing estática.");
        return response.text();
      })
      .then((html) => { if (active) setStaticHtml(html); })
      .catch(() => { if (active) setStaticHtml(""); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !staticHtml) return;
    let observer: ResizeObserver | undefined;
    let innerDocument: Document | undefined;
    let observed = false;
    const scrollToSection = (hash: string) => {
      const id = decodeURIComponent(hash.replace(/^#/, ""));
      if (!id) return;
      const target = frame.contentDocument?.getElementById(id);
      if (!target) return;
      const top = frame.getBoundingClientRect().top + window.scrollY + target.getBoundingClientRect().top - 92;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    };
    const onHashChange = () => scrollToSection(window.location.hash);
    const onInnerClick = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      const hash = anchor?.getAttribute("href");
      if (!hash || hash === "#") return;
      event.preventDefault();
      window.history.pushState(null, "", hash);
      scrollToSection(hash);
    };
    const onLoad = () => {
      const document = frame.contentDocument;
      if (!document || observed) return;
      observed = true;
      innerDocument = document;
      measure();
      observer = new ResizeObserver(measure);
      observer.observe(document.documentElement);
      if (document.body) observer.observe(document.body);
      document.addEventListener("click", onInnerClick);
      document.querySelectorAll("img").forEach((image) => {
        image.addEventListener("load", measure);
        image.addEventListener("error", measure);
      });
      if (window.location.hash) requestAnimationFrame(onHashChange);
    };
    frame.addEventListener("load", onLoad);
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHashChange);
    if (frame.contentDocument?.readyState === "complete") onLoad();
    return () => {
      frame.removeEventListener("load", onLoad);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHashChange);
      innerDocument?.removeEventListener("click", onInnerClick);
      observer?.disconnect();
    };
  }, [measure, staticHtml]);

  return (
    <div className="huella-static-v38">
      <h1 className="sr-only">Calcula la huella de carbono de tu empresa</h1>
      {staticHtml ? (
        <iframe
          ref={frameRef}
          className="huella-static-v38__frame"
          srcDoc={staticHtml}
          title="Landing estática Back 2 Green: inventarios de gases de efecto invernadero"
          style={{ height }}
          onLoad={measure}
        >
          <p>La presentación de Back 2 Green está disponible en el contenido de esta página.</p>
        </iframe>
      ) : <p className="huella-static-v38__loading" role="status">Cargando la presentación de Back 2 Green…</p>}
    </div>
  );
}
