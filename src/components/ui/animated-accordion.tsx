"use client";

import React, { useState } from "react";

export interface AccordionItem {
  id: string;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
}

export function AnimatedAccordion({ items }: { items: AccordionItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="animated-accordion-list">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className="animated-accordion-item"
            data-open={isOpen ? "true" : "false"}
          >
            <button
              className="animated-accordion-trigger"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
            >
              <div>
                <span>{item.title}</span>
                {item.subtitle && (
                  <small style={{ display: "block", fontSize: "0.82rem", color: "var(--muted)", fontWeight: 400, marginTop: "2px" }}>
                    {item.subtitle}
                  </small>
                )}
              </div>
              <svg
                className="animated-accordion-chevron"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="animated-accordion-body">
              <div className="animated-accordion-inner">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
