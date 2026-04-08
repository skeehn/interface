import React from 'react';

/** Props for the {@link Table} component. */
export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Additional CSS class names. */
  className?: string;
  children?: React.ReactNode;
}

/**
 * Data table with dither row hover effect.
 * Renders a `<table>` with the `sk-table` class.
 */
export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, children, ...rest }, ref) => (
    <table ref={ref} className={`sk-table${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </table>
  ),
);

Table.displayName = 'Table';

/** Props for {@link TableHead}. */
export interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children?: React.ReactNode;
  className?: string;
}

/** Table head wrapper. */
export const TableHead = React.forwardRef<HTMLTableSectionElement, TableHeadProps>(
  ({ className, children, ...rest }, ref) => (
    <thead ref={ref} className={className} {...rest}>{children}</thead>
  ),
);

TableHead.displayName = 'TableHead';

/** Props for {@link TableBody}. */
export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children?: React.ReactNode;
  className?: string;
}

/** Table body wrapper. */
export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...rest }, ref) => (
    <tbody ref={ref} className={className} {...rest}>{children}</tbody>
  ),
);

TableBody.displayName = 'TableBody';

/** Props for {@link TableRow}. */
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children?: React.ReactNode;
  className?: string;
}

/** Table row. */
export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, children, ...rest }, ref) => (
    <tr ref={ref} className={className} {...rest}>{children}</tr>
  ),
);

TableRow.displayName = 'TableRow';

/** Props for {@link TableCell}. */
export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  className?: string;
}

/** Table data cell. */
export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, children, ...rest }, ref) => (
    <td ref={ref} className={className} {...rest}>{children}</td>
  ),
);

TableCell.displayName = 'TableCell';

/** Props for {@link TableHeaderCell}. */
export interface TableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  className?: string;
}

/** Table header cell. */
export const TableHeaderCell = React.forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  ({ className, children, ...rest }, ref) => (
    <th ref={ref} className={className} {...rest}>{children}</th>
  ),
);

TableHeaderCell.displayName = 'TableHeaderCell';
