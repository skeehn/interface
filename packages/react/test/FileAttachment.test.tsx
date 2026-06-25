import { describe, test, expect, mock } from "bun:test";
import { FileAttachment, FileAttachments } from "../src/components/FileAttachment";
import { renderC } from "./harness";

const STATES = ["uploading", "done", "error"] as const;

describe("FileAttachment", () => {
  test("mounts as a div with base class", () => {
    const { root } = renderC(<FileAttachment name="report.pdf" />);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-file-attachment");
  });

  test("renders the file name", () => {
    const { root, getByText } = renderC(<FileAttachment name="report.pdf" />);
    expect(root.querySelector(".sk-file-attachment__name")).not.toBeNull();
    expect(getByText("report.pdf")).toHaveClass("sk-file-attachment__name");
  });

  test("renders the size when provided", () => {
    const { root, getByText } = renderC(<FileAttachment name="a.png" size="2.4 MB" />);
    expect(root.querySelector(".sk-file-attachment__size")).not.toBeNull();
    expect(getByText("2.4 MB")).toHaveClass("sk-file-attachment__size");
  });

  test("omits the size element when not provided", () => {
    const { root } = renderC(<FileAttachment name="a.png" />);
    expect(root.querySelector(".sk-file-attachment__size")).toBeNull();
  });

  test("renders the icon when provided", () => {
    const { root, getByText } = renderC(<FileAttachment name="a.png" icon="*" />);
    expect(root.querySelector(".sk-file-attachment__icon")).not.toBeNull();
    expect(getByText("*")).toHaveClass("sk-file-attachment__icon");
  });

  test("always renders the progress element", () => {
    const { root } = renderC(<FileAttachment name="a.png" />);
    expect(root.querySelector(".sk-file-attachment__progress")).not.toBeNull();
  });

  test.each(STATES)("state=%s sets data-state", (s) => {
    const { root } = renderC(<FileAttachment name="a.png" state={s} />);
    expect(root).toHaveAttribute("data-state", s);
  });

  test("omits data-state when not provided", () => {
    const { root } = renderC(<FileAttachment name="a.png" />);
    expect(root).not.toHaveAttribute("data-state");
  });

  test("progress sets the --_progress CSS variable as a percentage", () => {
    const { root } = renderC(<FileAttachment name="a.png" progress={42} />);
    expect(root.style.getPropertyValue("--_progress")).toBe("42%");
  });

  test("does not set --_progress when progress is undefined", () => {
    const { root } = renderC(<FileAttachment name="a.png" />);
    expect(root.style.getPropertyValue("--_progress")).toBe("");
  });

  test("renders the remove button (with aria-label) only when onRemove is given", () => {
    const { queryByLabelText } = renderC(<FileAttachment name="a.png" />);
    expect(queryByLabelText("Remove file")).toBeNull();

    const onRemove = mock();
    const { getByLabelText } = renderC(<FileAttachment name="a.png" onRemove={onRemove} />);
    expect(getByLabelText("Remove file")).toHaveClass("sk-file-attachment__remove");
  });

  test("fires onRemove when the remove button is clicked", async () => {
    const onRemove = mock();
    const { getByLabelText, user } = renderC(<FileAttachment name="a.png" onRemove={onRemove} />);
    await user.click(getByLabelText("Remove file"));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(<FileAttachment name="a.png" className="extra" />);
    expect(root).toHaveClass("sk-file-attachment");
    expect(root).toHaveClass("extra");
  });
});

describe("FileAttachments", () => {
  test("mounts as a div with the wrapper base class", () => {
    const { root } = renderC(<FileAttachments />);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-file-attachments");
  });

  test("renders child attachments", () => {
    const { root } = renderC(
      <FileAttachments>
        <FileAttachment name="a.png" />
        <FileAttachment name="b.pdf" />
      </FileAttachments>,
    );
    expect(root.querySelectorAll(".sk-file-attachment").length).toBe(2);
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(<FileAttachments className="extra" />);
    expect(root).toHaveClass("sk-file-attachments");
    expect(root).toHaveClass("extra");
  });
});
