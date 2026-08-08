"use client";

import { useEffect, useState } from "react";

const sections = [
  ["search", "人才搜索"],
  ["thinking", "证据推理"],
  ["tasks", "实时任务"],
  ["profiles", "人才档案"],
  ["domains", "重点方向"],
] as const;

export function SectionNav() {
  const [active, setActive] = useState("search");

  useEffect(() => {
    const elements = sections
      .map(([id]) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-18% 0px -62% 0px", threshold: [0.05, 0.35, 0.7] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="rail-nav" aria-label="首页内容导航">
      <span>Workspace</span>
      {sections.map(([id, label], index) => (
        <a
          key={id}
          className={active === id ? "active" : ""}
          aria-current={active === id ? "location" : undefined}
          href={`#${id}`}
        >
          <b>{String(index + 1).padStart(2, "0")}</b>
          {label}
          <i aria-hidden="true">↗</i>
        </a>
      ))}
    </nav>
  );
}
