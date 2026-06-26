import { describe, test, expect, beforeAll } from "bun:test";
import { defineSkeehnElements, SKEEHN_ELEMENTS } from "../src/index";

beforeAll(() => {
  defineSkeehnElements();
});

describe("@skeehn/wc", () => {
  test("registers all elements (idempotent)", () => {
    expect(SKEEHN_ELEMENTS.length).toBeGreaterThanOrEqual(6);
    defineSkeehnElements(); // second call must not throw
    for (const tag of SKEEHN_ELEMENTS) {
      expect(customElements.get(tag)).toBeDefined();
    }
  });

  test("skeehn-button renders the .sk-btn markup with data attrs + slotted content", () => {
    const el = document.createElement("skeehn-button");
    el.setAttribute("variant", "outline");
    el.setAttribute("size", "lg");
    el.textContent = "Send";
    document.body.appendChild(el);
    const btn = el.querySelector("button.sk-btn");
    expect(btn).not.toBeNull();
    expect(btn?.getAttribute("data-variant")).toBe("outline");
    expect(btn?.getAttribute("data-size")).toBe("lg");
    expect(btn?.textContent).toBe("Send");
    el.remove();
  });

  test("skeehn-chat-bubble wraps content in __content with data-role", () => {
    const el = document.createElement("skeehn-chat-bubble");
    el.setAttribute("role", "user");
    el.innerHTML = "Hello";
    document.body.appendChild(el);
    const bubble = el.querySelector(".sk-chat-bubble");
    expect(bubble?.getAttribute("data-role")).toBe("user");
    expect(el.querySelector(".sk-chat-bubble__content")?.textContent).toBe("Hello");
    el.remove();
  });

  test("attribute changes re-render", () => {
    const el = document.createElement("skeehn-agent-status");
    el.setAttribute("status", "thinking");
    document.body.appendChild(el);
    expect(el.querySelector(".sk-agent-status")?.getAttribute("data-status")).toBe("thinking");
    el.setAttribute("status", "done");
    expect(el.querySelector(".sk-agent-status")?.getAttribute("data-status")).toBe("done");
    el.remove();
  });
});
