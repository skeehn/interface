import { describe, test, expect } from "bun:test";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
} from "../src/components/Table";
import { renderC } from "./harness";

describe("Table", () => {
  test("Table mounts as <table> with base class and merges className", () => {
    const { root, getByRole } = renderC(<Table className="extra" />);
    expect(root.tagName).toBe("TABLE");
    expect(root).toHaveClass("sk-table");
    expect(root).toHaveClass("extra");
    // role table is implicit on <table>
    expect(getByRole("table")).toBe(root);
  });

  test("renders a full composition with correct element tags", () => {
    const { root } = renderC(
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Role</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Ada</TableCell>
            <TableCell>Engineer</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(root.querySelector("thead")).not.toBeNull();
    expect(root.querySelector("tbody")).not.toBeNull();
    expect(root.querySelectorAll("tr")).toHaveLength(2);
    expect(root.querySelectorAll("th")).toHaveLength(2);
    expect(root.querySelectorAll("td")).toHaveLength(2);
  });

  test("header cells expose columnheader role; data cells expose cell role", () => {
    const { getByRole } = renderC(
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Ada</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(getByRole("columnheader", { name: "Name" }).tagName).toBe("TH");
    expect(getByRole("cell", { name: "Ada" }).tagName).toBe("TD");
  });

  test("sub-components pass className straight through (no forced base class)", () => {
    const { getByTestId } = renderC(
      <Table>
        <TableHead className="hd" data-testid="thead">
          <TableRow className="rw" data-testid="tr">
            <TableHeaderCell className="hc" data-testid="th">
              H
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody className="bd" data-testid="tbody">
          <TableRow>
            <TableCell className="cl" data-testid="td">
              C
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(getByTestId("thead")).toHaveClass("hd");
    expect(getByTestId("tbody")).toHaveClass("bd");
    expect(getByTestId("tr")).toHaveClass("rw");
    expect(getByTestId("th")).toHaveClass("hc");
    expect(getByTestId("td")).toHaveClass("cl");
  });

  test("forwards arbitrary HTML attributes onto cells", () => {
    const { getByTestId } = renderC(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell colSpan={3} data-testid="span">
              wide
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(getByTestId("span")).toHaveAttribute("colspan", "3");
  });

  test("forwards refs to underlying DOM nodes", () => {
    let tableEl: HTMLTableElement | null = null;
    renderC(<Table ref={(n) => (tableEl = n)} />);
    expect(tableEl).not.toBeNull();
    expect(tableEl!.tagName).toBe("TABLE");
  });
});
