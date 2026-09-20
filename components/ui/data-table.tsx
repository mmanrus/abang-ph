import type {
  ReactNode,
} from "react";

export type DataTableColumn<T> = {
  /**
   * Unique column identifier.
   */
  key: string;

  /**
   * Header content.
   */
  header:
    ReactNode;

  /**
   * How this column renders one row.
   *
   * Business-specific formatting stays in the page.
   *
   * The table only controls layout.
   */
  cell: (
    row: T,
  ) => ReactNode;

  className?:
    string;

  headerClassName?:
    string;
};

type Props<T> = {
  rows: T[];

  columns:
    DataTableColumn<T>[];

  /**
   * React needs a stable key for each row.
   *
   * Usually:
   *
   * row.id
   */
  rowKey: (
    row: T,
  ) => string;
};

export function DataTable<T>({
  rows,
  columns,
  rowKey,
}: Props<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {/*
       * Horizontal overflow protects us if a laptop
       * becomes narrower than the table.
       */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50/80">
            <tr>
              {columns.map(
                (column) => (
                  <th
                    key={
                      column.key
                    }
                    scope="col"
                    className={[
                      "whitespace-nowrap px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500",

                      column.headerClassName ??
                        "",
                    ].join(
                      " ",
                    )}
                  >
                    {
                      column.header
                    }
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100">
            {rows.map(
              (row) => (
                <tr
                  key={
                    rowKey(
                      row,
                    )
                  }
                  className="transition hover:bg-zinc-50"
                >
                  {columns.map(
                    (column) => (
                      <td
                        key={
                          column.key
                        }
                        className={[
                          "px-5 py-4 align-middle text-zinc-700",

                          column.className ??
                            "",
                        ].join(
                          " ",
                        )}
                      >
                        {column.cell(
                          row,
                        )}
                      </td>
                    ),
                  )}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}