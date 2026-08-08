"use client";

import { useEffect } from "react";

const revealSelector = [
  ".landing-hero .hero-copy",
  ".landing-hero .meta-hero-visual",
  ".showcase-section > header",
  ".showcase-frame",
  ".metric-strip article",
  ".apple-planner-section > header",
  ".apple-planner",
  ".landing-section > header",
  ".landing-section .ui-card",
].join(",");

export function PageMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = Array.from(document.querySelectorAll<HTMLElement>(revealSelector));

    root.classList.add("motion-enabled");
    items.forEach((item, index) => {
      item.classList.add("motion-item");
      item.style.setProperty("--motion-delay", `${Math.min(index % 4, 3) * 55}ms`);
    });

    const observer: IntersectionObserver | null = !reduceMotion && "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer?.unobserve(entry.target);
          });
        }, { rootMargin: "0px 0px -8%", threshold: .08 })
      : null;

    items.forEach((item) => {
      if (observer) observer.observe(item);
      else item.classList.add("is-visible");
    });

    return () => {
      observer?.disconnect();
      root.classList.remove("motion-enabled");
      items.forEach((item) => {
        item.classList.remove("motion-item", "is-visible");
        item.style.removeProperty("--motion-delay");
      });
    };
  }, []);

  return null;
}
