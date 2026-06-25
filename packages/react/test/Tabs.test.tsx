import { describe, test, expect, mock } from "bun:test";
import { Tabs, type TabItem } from "../src/components/Tabs";
import { renderC } from "./harness";

const TABS: TabItem[] = [
  { value: "a", label: "Alpha", content: <p>panel-a</p> },
  { value: "b", label: "Beta", content: <p>panel-b</p> },
  { value: "c", label: "Gamma", content: <p>panel-c</p> },
];

describe("Tabs", () => {
  test("mounts with base class and a tablist of triggers", () => {
    const { root, getByRole, getAllByRole } = renderC(<Tabs tabs={TABS} />);
    expect(root).toHaveClass("sk-tabs");
    expect(getByRole("tablist")).toHaveClass("sk-tabs__list");
    const triggers = getAllByRole("tab");
    expect(triggers).toHaveLength(3);
    expect(triggers.map((t) => t.textContent)).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  test("first tab is selected by default and its panel is visible", () => {
    const { getAllByRole } = renderC(<Tabs tabs={TABS} />);
    const triggers = getAllByRole("tab");
    expect(triggers[0]).toHaveAttribute("aria-selected", "true");
    expect(triggers[1]).toHaveAttribute("aria-selected", "false");

    const panels = getAllByRole("tabpanel", { hidden: true });
    expect(panels[0]).not.toHaveAttribute("hidden");
    expect(panels[1]).toHaveAttribute("hidden");
  });

  test("defaultValue selects the matching tab (uncontrolled)", () => {
    const { getAllByRole } = renderC(<Tabs tabs={TABS} defaultValue="b" />);
    const triggers = getAllByRole("tab");
    expect(triggers[0]).toHaveAttribute("aria-selected", "false");
    expect(triggers[1]).toHaveAttribute("aria-selected", "true");
  });

  test("clicking a tab selects it and fires onValueChange (uncontrolled)", async () => {
    const onValueChange = mock();
    const { user, getAllByRole } = renderC(
      <Tabs tabs={TABS} onValueChange={onValueChange} />,
    );
    const triggers = getAllByRole("tab");

    await user.click(triggers[2]!);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenLastCalledWith("c");

    // ARIA + panel visibility flip to the third tab.
    expect(triggers[2]).toHaveAttribute("aria-selected", "true");
    expect(triggers[0]).toHaveAttribute("aria-selected", "false");
    const panels = getAllByRole("tabpanel", { hidden: true });
    expect(panels[2]).not.toHaveAttribute("hidden");
    expect(panels[0]).toHaveAttribute("hidden");
  });

  test("controlled value pins selection; clicks notify but do not self-update", async () => {
    const onValueChange = mock();
    const { user, getAllByRole } = renderC(
      <Tabs tabs={TABS} value="a" onValueChange={onValueChange} />,
    );
    const triggers = getAllByRole("tab");
    expect(triggers[0]).toHaveAttribute("aria-selected", "true");

    await user.click(triggers[1]!);
    // callback fires with the clicked value...
    expect(onValueChange).toHaveBeenLastCalledWith("b");
    // ...but selection stays on the controlled value since parent didn't update.
    expect(triggers[0]).toHaveAttribute("aria-selected", "true");
    expect(triggers[1]).toHaveAttribute("aria-selected", "false");
  });

  test("controlled value updates selection when prop changes", () => {
    const { rerender, getAllByRole } = renderC(<Tabs tabs={TABS} value="a" />);
    let triggers = getAllByRole("tab");
    expect(triggers[0]).toHaveAttribute("aria-selected", "true");

    rerender(<Tabs tabs={TABS} value="c" />);
    triggers = getAllByRole("tab");
    expect(triggers[2]).toHaveAttribute("aria-selected", "true");
    expect(triggers[0]).toHaveAttribute("aria-selected", "false");
  });

  test("all panels render but only the active one is unhidden", () => {
    const { getAllByRole } = renderC(<Tabs tabs={TABS} defaultValue="b" />);
    const panels = getAllByRole("tabpanel", { hidden: true });
    expect(panels).toHaveLength(3);
    panels.forEach((p) => expect(p).toHaveClass("sk-tabs__content"));
    expect(panels[1]).not.toHaveAttribute("hidden");
    expect(panels[0]).toHaveAttribute("hidden");
    expect(panels[2]).toHaveAttribute("hidden");
  });
});
