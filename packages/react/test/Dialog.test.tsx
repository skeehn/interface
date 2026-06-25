import { describe, test, expect, mock } from "bun:test";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "../src/components/Dialog";
import { renderC } from "./harness";

describe("Dialog", () => {
  test("mounts as <dialog> with base class", () => {
    const { root } = renderC(<Dialog>body</Dialog>);
    expect(root.tagName).toBe("DIALOG");
    expect(root).toHaveClass("sk-dialog");
    expect(root).toHaveTextContent("body");
  });

  test("merges extra className", () => {
    const { root } = renderC(<Dialog className="extra">x</Dialog>);
    expect(root).toHaveClass("sk-dialog");
    expect(root).toHaveClass("extra");
  });

  test("open prop drives the native open state (showModal stubbed)", () => {
    // showModal/close are stubbed in setup.ts to flip el.open.
    const { root, rerender, getByRole } = renderC(<Dialog open>contents</Dialog>);
    const el = root as HTMLDialogElement;
    expect(el.open).toBe(true);
    // content is present and reachable while hidden from a11y tree
    expect(getByRole("dialog", { hidden: true })).toBe(el);
    expect(getByRole("dialog", { hidden: true })).toHaveTextContent("contents");

    rerender(<Dialog open={false}>contents</Dialog>);
    expect(el.open).toBe(false);
  });

  test("closed by default", () => {
    const { root } = renderC(<Dialog>x</Dialog>);
    expect((root as HTMLDialogElement).open).toBe(false);
  });

  test("fires onClose on the native close event when toggled shut", () => {
    const onClose = mock();
    const { rerender } = renderC(
      <Dialog open onClose={onClose}>
        x
      </Dialog>,
    );
    expect(onClose).not.toHaveBeenCalled();
    // Transition open -> closed triggers el.close(), which dispatches "close".
    rerender(
      <Dialog open={false} onClose={onClose}>
        x
      </Dialog>,
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("fires onClose on backdrop (self) click but not on inner content click", async () => {
    const onClose = mock();
    const { root, user, getByRole } = renderC(
      <Dialog open onClose={onClose}>
        <DialogContent>
          <button>inside</button>
        </DialogContent>
      </Dialog>,
    );

    // Click on inner content -> e.target !== dialog element -> no close.
    await user.click(getByRole("button", { name: "inside", hidden: true }));
    expect(onClose).not.toHaveBeenCalled();

    // Click directly on the <dialog> backdrop -> close.
    await user.click(root);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("DialogContent renders wrapper with its base class", () => {
    const { root } = renderC(<DialogContent className="c">hi</DialogContent>);
    expect(root).toHaveClass("sk-dialog__content");
    expect(root).toHaveClass("c");
    expect(root).toHaveTextContent("hi");
  });

  test("DialogHeader renders title and an accessible close button", async () => {
    const onClose = mock();
    const { user, getByRole } = renderC(<DialogHeader title="My Title" onClose={onClose} />);
    const title = getByRole("heading", { name: "My Title" });
    expect(title).toHaveClass("sk-dialog__title");

    const closeBtn = getByRole("button", { name: "Close dialog" });
    expect(closeBtn).toHaveClass("sk-dialog__close");
    expect(closeBtn).toHaveTextContent("[x]");

    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("DialogHeader without onClose renders no close button", () => {
    const { queryByRole } = renderC(<DialogHeader title="t" />);
    expect(queryByRole("button", { name: "Close dialog" })).toBeNull();
  });

  test("DialogBody and DialogFooter carry their base classes", () => {
    const { root: body } = renderC(<DialogBody>b</DialogBody>);
    expect(body).toHaveClass("sk-dialog__body");

    const { root: footer } = renderC(<DialogFooter>f</DialogFooter>);
    expect(footer).toHaveClass("sk-dialog__footer");
  });
});
