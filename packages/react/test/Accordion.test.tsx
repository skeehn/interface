import { describe, test, expect, mock } from "bun:test";
import { Accordion, type AccordionItem } from "../src/components/Accordion";
import { renderC } from "./harness";

const ITEMS: AccordionItem[] = [
  { value: "one", label: "Section One", content: <p>body-one</p> },
  { value: "two", label: "Section Two", content: <p>body-two</p> },
  { value: "three", label: "Section Three", content: <p>body-three</p> },
];

describe("Accordion", () => {
  test("mounts with base class and a trigger button per item", () => {
    const { root, getAllByRole } = renderC(<Accordion items={ITEMS} />);
    expect(root).toHaveClass("sk-accordion");
    const triggers = getAllByRole("button");
    expect(triggers).toHaveLength(3);
    triggers.forEach((t) => expect(t).toHaveClass("sk-accordion__trigger"));
  });

  test("all collapsed by default: aria-expanded false, no content, no data-open", () => {
    const { root, getAllByRole } = renderC(<Accordion items={ITEMS} />);
    getAllByRole("button").forEach((t) =>
      expect(t).toHaveAttribute("aria-expanded", "false"),
    );
    expect(root.querySelector(".sk-accordion__content")).toBeNull();
    root
      .querySelectorAll(".sk-accordion__item")
      .forEach((item) => expect(item).not.toHaveAttribute("data-open"));
  });

  test("defaultValue (string) opens that section initially", () => {
    const { root, getAllByRole, getByText } = renderC(
      <Accordion items={ITEMS} defaultValue="two" />,
    );
    const triggers = getAllByRole("button");
    expect(triggers[1]).toHaveAttribute("aria-expanded", "true");
    expect(triggers[0]).toHaveAttribute("aria-expanded", "false");
    expect(root.querySelectorAll(".sk-accordion__item")[1]).toHaveAttribute("data-open", "");
    expect(getByText("body-two")).toBeInTheDocument();
  });

  test("clicking a trigger expands it, reveals content, fires onValueChange([value])", async () => {
    const onValueChange = mock();
    const { root, user, getAllByRole, getByText } = renderC(
      <Accordion items={ITEMS} onValueChange={onValueChange} />,
    );
    const triggers = getAllByRole("button");

    await user.click(triggers[0]!);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenLastCalledWith(["one"]);
    expect(triggers[0]).toHaveAttribute("aria-expanded", "true");
    expect(root.querySelectorAll(".sk-accordion__item")[0]).toHaveAttribute("data-open", "");
    expect(getByText("body-one")).toBeInTheDocument();
  });

  test("clicking an open trigger collapses it and fires onValueChange([])", async () => {
    const onValueChange = mock();
    const { user, getAllByRole, queryByText } = renderC(
      <Accordion items={ITEMS} defaultValue="one" onValueChange={onValueChange} />,
    );
    const triggers = getAllByRole("button");
    expect(triggers[0]).toHaveAttribute("aria-expanded", "true");

    await user.click(triggers[0]!);
    expect(onValueChange).toHaveBeenLastCalledWith([]);
    expect(triggers[0]).toHaveAttribute("aria-expanded", "false");
    expect(queryByText("body-one")).toBeNull();
  });

  test("single mode: opening a second section closes the first", async () => {
    const onValueChange = mock();
    const { user, getAllByRole, getByText, queryByText } = renderC(
      <Accordion items={ITEMS} defaultValue="one" onValueChange={onValueChange} />,
    );
    const triggers = getAllByRole("button");

    await user.click(triggers[1]!);
    expect(onValueChange).toHaveBeenLastCalledWith(["two"]);
    expect(triggers[0]).toHaveAttribute("aria-expanded", "false");
    expect(triggers[1]).toHaveAttribute("aria-expanded", "true");
    expect(queryByText("body-one")).toBeNull();
    expect(getByText("body-two")).toBeInTheDocument();
  });

  test("multiple mode: sections accumulate open state", async () => {
    const onValueChange = mock();
    const { user, getAllByRole, getByText } = renderC(
      <Accordion items={ITEMS} multiple onValueChange={onValueChange} />,
    );
    const triggers = getAllByRole("button");

    await user.click(triggers[0]!);
    expect(onValueChange).toHaveBeenLastCalledWith(["one"]);

    await user.click(triggers[2]!);
    expect(onValueChange).toHaveBeenLastCalledWith(["one", "three"]);

    expect(triggers[0]).toHaveAttribute("aria-expanded", "true");
    expect(triggers[2]).toHaveAttribute("aria-expanded", "true");
    expect(getByText("body-one")).toBeInTheDocument();
    expect(getByText("body-three")).toBeInTheDocument();
  });

  test("controlled value (array) pins open sections; click notifies only", async () => {
    const onValueChange = mock();
    const { user, rerender, getAllByRole } = renderC(
      <Accordion items={ITEMS} value={["one"]} multiple onValueChange={onValueChange} />,
    );
    const triggers = getAllByRole("button");
    expect(triggers[0]).toHaveAttribute("aria-expanded", "true");

    // Clicking a closed section reports the intended next set but does not self-update.
    await user.click(triggers[1]!);
    expect(onValueChange).toHaveBeenLastCalledWith(["one", "two"]);
    expect(triggers[1]).toHaveAttribute("aria-expanded", "false");
    expect(triggers[0]).toHaveAttribute("aria-expanded", "true");

    // Parent applies new value.
    rerender(
      <Accordion items={ITEMS} value={["two"]} multiple onValueChange={onValueChange} />,
    );
    expect(triggers[0]).toHaveAttribute("aria-expanded", "false");
    expect(triggers[1]).toHaveAttribute("aria-expanded", "true");
  });

  test("chevron glyph reflects open/closed state", async () => {
    const { root, user, getAllByRole } = renderC(<Accordion items={ITEMS} />);
    const chevrons = root.querySelectorAll(".sk-accordion__chevron");
    expect(chevrons[0]).toHaveTextContent("▸"); // closed ▸
    await user.click(getAllByRole("button")[0]!);
    expect(root.querySelectorAll(".sk-accordion__chevron")[0]).toHaveTextContent("▾"); // open ▾
  });
});
