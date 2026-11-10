import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { loveConfig } from "@/config/love-config";
import { HEART_GAME_GOAL } from "@/lib/love-rules";
import { Route } from "@/routes/index";

const Page = Route.options.component!;
const roots: Root[] = [];

function mountPage() {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);

  act(() => root.render(createElement(Page)));

  return container;
}

function click(element: Element) {
  act(() => element.dispatchEvent(new MouseEvent("click", { bubbles: true })));
}

function openPage() {
  const container = mountPage();
  const button = container.querySelector<HTMLButtonElement>(".envelope-button");
  if (!button) throw new Error("The opening envelope button was not rendered");
  click(button);
  return container;
}

function requiredElement<T extends Element>(container: ParentNode, selector: string) {
  const element = container.querySelector<T>(selector);
  if (!element) throw new Error(`Expected element was not found: ${selector}`);
  return element;
}

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount());
  document.body.replaceChildren();
});

describe("apology page interactions", () => {
  it("opens the letter and includes all six photo files in the served build", () => {
    const container = openPage();

    expect(requiredElement(container, "#home h1").textContent).toContain("I’m really sorry.");
    const renderedImages = Array.from(container.querySelectorAll("img"));
    const renderedPaths = renderedImages.map((image) => image.getAttribute("src"));

    expect(renderedImages.length).toBeGreaterThanOrEqual(8);
    for (const memory of loveConfig.memories) {
      expect(renderedPaths).toContain(memory.image);
      const relativeAsset = memory.image.replace(/^\//, "");
      expect(existsSync(resolve(process.cwd(), "public", relativeAsset))).toBe(true);
      expect(existsSync(resolve(process.cwd(), ".output/public", relativeAsset))).toBe(true);
    }
  });

  it("opens the memory lightbox and supports next, previous, keyboard navigation, and Escape", () => {
    const container = openPage();
    const firstMemory = container.querySelector<HTMLButtonElement>(
      `[aria-label="Open memory: ${loveConfig.memories[0].title}"]`,
    );
    if (!firstMemory) throw new Error("The first memory card was not rendered");
    click(firstMemory);

    let dialog = requiredElement<HTMLElement>(container, '[role="dialog"]');
    expect(dialog.getAttribute("aria-label")).toBe(loveConfig.memories[0].title);
    expect(dialog.querySelector("img")?.getAttribute("src")).toBe(loveConfig.memories[0].image);

    click(requiredElement(dialog, '[aria-label="Next memory"]'));
    dialog = requiredElement<HTMLElement>(container, '[role="dialog"]');
    expect(dialog.getAttribute("aria-label")).toBe(loveConfig.memories[1].title);
    expect(dialog.querySelector("img")?.getAttribute("src")).toBe(loveConfig.memories[1].image);

    act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" })));
    expect(requiredElement(container, '[role="dialog"]').getAttribute("aria-label")).toBe(
      loveConfig.memories[0].title,
    );

    act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it("reveals a reason and seals every promise", () => {
    const container = openPage();
    const firstReason = requiredElement<HTMLButtonElement>(container, ".reason-card");

    click(firstReason);
    expect(firstReason.getAttribute("aria-pressed")).toBe("true");
    expect(firstReason.textContent).toContain(loveConfig.reasons[0]);

    for (const button of Array.from(
      container.querySelectorAll<HTMLButtonElement>(".promise-row"),
    )) {
      click(button);
    }
    expect(requiredElement(container, ".promise-complete").textContent).toContain(
      "Promises sealed",
    );
  });

  it("counts caught hearts until the full-heart state", () => {
    const container = openPage();
    const hearts = Array.from(container.querySelectorAll<HTMLButtonElement>(".falling-heart"));

    for (let score = 0; score < HEART_GAME_GOAL; score += 1) {
      const heart = hearts[score];
      if (heart) click(heart);
    }

    expect(requiredElement(container, ".game-success").textContent).toContain(
      "collected my whole heart",
    );
    expect(hearts.every((button) => button.disabled)).toBe(true);
  });

  it("keeps the no response gentle and shows the thank-you after Yes", () => {
    const container = openPage();
    click(requiredElement(container, ".no-button"));
    expect(requiredElement(container, ".no-tease").textContent).toContain("Are you sure?");

    click(requiredElement(container, ".yes-button"));
    expect(requiredElement(container, ".thank-you-section h2").textContent).toContain("Thank you");
    expect(requiredElement(container, ".no-pressure-note").textContent).toContain(
      "No pressure to decide anything right now",
    );
  });

  it("opens the favourite song only through the explicit link", () => {
    const container = openPage();
    const songLink = requiredElement<HTMLAnchorElement>(container, ".song-link a");

    expect(songLink.href).toBe(loveConfig.favouriteSongUrl);
    expect(songLink.target).toBe("_blank");
    expect(songLink.rel).toContain("noopener");
  });
});
