import { describe, test, expect, mock } from "bun:test";
import { Dropdown, type DropdownItem } from "../src/components/Dropdown";
import { renderC } from "./harness";

const ITEMS: DropdownItem[] = [
  { value: "edit", label: "Edit" },
  { value: "dupe", label: "Duplicate" },
  { value: "del", label: "Delete", destructive: true, separator: true },
];

describe("Dropdown", () => {
  test("mounts with base class and renders the trigger", () => {
    const { root, getByRole } = renderC(
      <Dropdown items={ITEMS} trigger={<button>Open</button>} />,
    );
    expect(root).toHaveClass("sk-dropdown");
    expect(getByRole("button", { name: "Open" })).toBeInTheDocument();
  });

  test("content is rendered but closed by default (no data-open)", () => {
    const { root } = renderC(<Dropdown items={ITEMS} trigger={<span>t</span>} />);
    const content = root.querySelector(".sk-dropdown__content")!;
    expect(content).not.toBeNull();
    expect(content).not.toHaveAttribute("data-open");
  });

  test("renders all items with menuitem role and correct labels", () => {
    const { getAllByRole } = renderC(<Dropdown items={ITEMS} trigger={<span>t</span>} />);
    const menuitems = getAllByRole("menuitem");
    expect(menuitems).toHaveLength(3);
    expect(menuitems.map((m) => m.textContent)).toEqual(["Edit", "Duplicate", "Delete"]);
    menuitems.forEach((m) => expect(m).toHaveClass("sk-dropdown__item"));
  });

  test("destructive item gets the modifier class; separator div is rendered", () => {
    const { root, getByRole } = renderC(<Dropdown items={ITEMS} trigger={<span>t</span>} />);
    const del = getByRole("menuitem", { name: "Delete" });
    expect(del).toHaveClass("sk-dropdown__item--destructive");
    expect(root.querySelector(".sk-dropdown__separator")).not.toBeNull();

    const edit = getByRole("menuitem", { name: "Edit" });
    expect(edit).not.toHaveClass("sk-dropdown__item--destructive");
  });

  test("clicking trigger opens (data-open) and fires onOpenChange(true)", async () => {
    const onOpenChange = mock();
    const { root, user, getByRole } = renderC(
      <Dropdown items={ITEMS} trigger={<button>Menu</button>} onOpenChange={onOpenChange} />,
    );
    const content = root.querySelector(".sk-dropdown__content")!;
    expect(content).not.toHaveAttribute("data-open");

    await user.click(getByRole("button", { name: "Menu" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(content).toHaveAttribute("data-open", "");
  });

  test("selecting an item fires onSelect(value) and closes the menu", async () => {
    const onSelect = mock();
    const onOpenChange = mock();
    const { root, user, getByRole } = renderC(
      <Dropdown
        items={ITEMS}
        trigger={<button>Menu</button>}
        onSelect={onSelect}
        onOpenChange={onOpenChange}
      />,
    );
    const content = root.querySelector(".sk-dropdown__content")!;

    await user.click(getByRole("button", { name: "Menu" }));
    expect(content).toHaveAttribute("data-open", "");

    await user.click(getByRole("menuitem", { name: "Duplicate" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenLastCalledWith("dupe");
    // close() runs after select
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(content).not.toHaveAttribute("data-open");
  });

  test("outside mousedown closes an open dropdown", async () => {
    const onOpenChange = mock();
    const { root, user, getByRole } = renderC(
      <div>
        <Dropdown items={ITEMS} trigger={<button>Menu</button>} onOpenChange={onOpenChange} />
        <button>outside</button>
      </div>,
    );
    const content = root.querySelector(".sk-dropdown__content")!;

    await user.click(getByRole("button", { name: "Menu" }));
    expect(content).toHaveAttribute("data-open", "");

    await user.click(getByRole("button", { name: "outside" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(content).not.toHaveAttribute("data-open");
  });

  test("controlled open: open prop drives data-open regardless of clicks", async () => {
    const onOpenChange = mock();
    const { root, user, rerender, getByRole } = renderC(
      <Dropdown
        items={ITEMS}
        trigger={<button>Menu</button>}
        open={false}
        onOpenChange={onOpenChange}
      />,
    );
    const content = root.querySelector(".sk-dropdown__content")!;
    expect(content).not.toHaveAttribute("data-open");

    // Click notifies parent but does not self-open while controlled.
    await user.click(getByRole("button", { name: "Menu" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(content).not.toHaveAttribute("data-open");

    // Parent opens it.
    rerender(
      <Dropdown
        items={ITEMS}
        trigger={<button>Menu</button>}
        open
        onOpenChange={onOpenChange}
      />,
    );
    expect(content).toHaveAttribute("data-open", "");
  });
});
