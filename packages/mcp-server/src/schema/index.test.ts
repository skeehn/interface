import { describe, expect, test } from "bun:test";
import { componentSchema, themeRegistry, propContracts, examples, patterns } from "./index.js";

describe("MCP Server Schema", () => {
  describe("componentSchema", () => {
    test("has version", () => {
      expect(componentSchema.version).toBe("0.3.0");
    });

    test("has all 29 components", () => {
      expect(componentSchema.components.length).toBe(29);
    });

    test("all components have required fields", () => {
      for (const comp of componentSchema.components) {
        expect(comp.name).toBeTruthy();
        expect(comp.category).toBeTruthy();
        expect(comp.description).toBeTruthy();
        expect(comp.variants).toBeTruthy();
        expect(Array.isArray(comp.variants)).toBe(true);
        expect(comp.variants.length).toBeGreaterThan(0);
      }
    });

    test("all components have props object", () => {
      for (const comp of componentSchema.components) {
        expect(comp.props).toBeTruthy();
        expect(typeof comp.props).toBe("object");
      }
    });

    test("core components exist", () => {
      const coreNames = componentSchema.components
        .filter((c) => c.category === "core")
        .map((c) => c.name);
      
      expect(coreNames).toContain("Button");
      expect(coreNames).toContain("Card");
      expect(coreNames).toContain("Input");
      expect(coreNames).toContain("Badge");
      expect(coreNames).toContain("Alert");
      expect(coreNames).toContain("Dialog");
      expect(coreNames).toContain("Tabs");
      expect(coreNames).toContain("Toggle");
      expect(coreNames).toContain("Progress");
      expect(coreNames).toContain("Avatar");
      expect(coreNames).toContain("Tooltip");
      expect(coreNames).toContain("Dropdown");
      expect(coreNames).toContain("Table");
      expect(coreNames).toContain("Accordion");
    });

    test("AI components exist", () => {
      const aiNames = componentSchema.components
        .filter((c) => c.category === "ai")
        .map((c) => c.name);
      
      expect(aiNames).toContain("ChatBubble");
      expect(aiNames).toContain("ChatInput");
      expect(aiNames).toContain("ReasoningStep");
      expect(aiNames).toContain("ToolCard");
      expect(aiNames).toContain("CitationCard");
      expect(aiNames).toContain("StreamingText");
      expect(aiNames).toContain("TerminalPanel");
      expect(aiNames).toContain("AgentStatus");
    });

    test("ChatBubble has correct props", () => {
      const chatBubble = componentSchema.components.find((c) => c.name === "ChatBubble");
      expect(chatBubble).toBeTruthy();
      expect((chatBubble!.props as any).role.required).toBe(true);
      expect((chatBubble!.props as any).content.required).toBe(true);
      expect((chatBubble!.props as any).streaming.default).toBe(false);
    });

    test("Button has correct variants", () => {
      const button = componentSchema.components.find((c) => c.name === "Button");
      expect(button!.variants).toContain("solid");
      expect(button!.variants).toContain("dither");
      expect(button!.variants).toContain("outline");
      expect(button!.variants).toContain("ghost");
      expect(button!.variants).toContain("inverted");
      expect(button!.variants).toContain("ascii");
    });
  });

  describe("themeRegistry", () => {
    test("has version", () => {
      expect(themeRegistry.version).toBe("0.3.0");
    });

    test("has 5 themes", () => {
      expect(themeRegistry.themes.length).toBe(5);
    });

    test("all themes have required fields", () => {
      for (const theme of themeRegistry.themes) {
        expect(theme.name).toBeTruthy();
        expect(theme.description).toBeTruthy();
        expect(theme.colors).toBeTruthy();
        expect(theme.dither).toBeTruthy();
        expect(theme.colors.background).toBeTruthy();
        expect(theme.colors.foreground).toBeTruthy();
        expect(theme.colors.primary).toBeTruthy();
        expect(theme.dither.pattern).toBeTruthy();
        expect(typeof theme.dither.opacity).toBe("number");
      }
    });

    test("theme names are valid", () => {
      const names = themeRegistry.themes.map((t) => t.name);
      expect(names).toContain("default");
      expect(names).toContain("brutal");
      expect(names).toContain("terminal");
      expect(names).toContain("print");
      expect(names).toContain("grain");
    });
  });

  describe("propContracts", () => {
    test("has contracts for key components", () => {
      expect(propContracts.Button).toBeTruthy();
      expect(propContracts.ChatBubble).toBeTruthy();
      expect(propContracts.ChatInput).toBeTruthy();
      expect(propContracts.ToolCard).toBeTruthy();
    });

    test("ChatBubble contract has required fields", () => {
      const contract = propContracts.ChatBubble;
      expect(contract.required).toContain("role");
      expect(contract.required).toContain("content");
    });

    test("Button contract has correct variant enum", () => {
      const contract = propContracts.Button;
      expect(contract.properties.variant.enum).toContain("solid");
      expect(contract.properties.variant.enum).toContain("dither");
      expect(contract.properties.variant.enum).toContain("outline");
    });
  });

  describe("examples", () => {
    test("has examples for key components", () => {
      expect(examples.button).toBeTruthy();
      expect(examples["chat-bubble"]).toBeTruthy();
      expect(examples.card).toBeTruthy();
    });

    test("button examples have variants", () => {
      expect(examples.button.variants.length).toBeGreaterThan(0);
      for (const variant of examples.button.variants) {
        expect(variant.name).toBeTruthy();
        expect(variant.code).toBeTruthy();
      }
    });
  });

  describe("patterns", () => {
    test("has 4 UI patterns", () => {
      expect(Object.keys(patterns).length).toBe(4);
    });

    test("all patterns have required fields", () => {
      for (const [name, pattern] of Object.entries(patterns)) {
        expect((pattern as any).name).toBeTruthy();
        expect((pattern as any).description).toBeTruthy();
        expect((pattern as any).components).toBeTruthy();
        expect(Array.isArray((pattern as any).components)).toBe(true);
        expect((pattern as any).layout).toBeTruthy();
        expect((pattern as any).theme).toBeTruthy();
      }
    });

    test("ai-chat pattern includes required components", () => {
      expect(patterns["ai-chat"].components).toContain("ChatBubble");
      expect(patterns["ai-chat"].components).toContain("ChatInput");
    });
  });
});
