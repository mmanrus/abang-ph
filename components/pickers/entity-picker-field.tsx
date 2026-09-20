"use client";

import {
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  UserRound,
  X,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

import {
  searchPropertyPickerAction,
  searchTenantPickerAction,
} from "@/app/(app)/pickers/actions";

import type {
  PickerOption,
  PickerResult,
} from "@/lib/picker";

type PickerKind =
  | "property"
  | "tenant";

type Props = {
  /**
   * Name of the hidden field submitted with the parent form.
   *
   * Examples:
   *
   * propertyId
   * tenantId
   */
  name: string;

  kind:
    PickerKind;

  label:
    string;

  placeholder:
    string;

  searchPlaceholder:
    string;

  initialSelection?:
    PickerOption | null;
};

const EMPTY_RESULT:
  PickerResult = {
    items: [],
    page: 1,
    totalPages: 1,
    totalItems: 0,
  };

export function EntityPickerField({
  name,
  kind,
  label,
  placeholder,
  searchPlaceholder,
  initialSelection =
    null,
}: Props) {
  const dialogRef =
    useRef<HTMLDialogElement>(
      null,
    );

  const [
    selected,
    setSelected,
  ] =
    useState<
      PickerOption | null
    >(
      initialSelection,
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    result,
    setResult,
  ] =
    useState<PickerResult>(
      EMPTY_RESULT,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    loadedOnce,
    setLoadedOnce,
  ] =
    useState(false);

  const Icon =
    kind === "property"
      ? Building2
      : UserRound;

  async function load(
    page: number,
    q: string,
  ) {
    setLoading(
      true,
    );

    try {
      /**
       * The Client Component chooses which server-side picker
       * action it needs.
       *
       * Authorization still happens inside each Server Action.
       */
      const data =
        kind === "property"
          ? await searchPropertyPickerAction(
              {
                q,
                page,
              },
            )
          : await searchTenantPickerAction(
              {
                q,
                page,
              },
            );

      setResult(
        data,
      );

      setLoadedOnce(
        true,
      );
    } finally {
      setLoading(
        false,
      );
    }
  }

  async function openPicker() {
    dialogRef.current?.showModal();

    /**
     * Load only when the user actually opens the picker.
     *
     * This means pages with several pickers do not automatically
     * execute unnecessary database queries.
     */
    if (!loadedOnce) {
      await load(
        1,
        "",
      );
    }
  }

  function closePicker() {
    dialogRef.current?.close();
  }

  function choose(
    option:
      PickerOption,
  ) {
    setSelected(
      option,
    );

    closePicker();
  }

  function handleSearch() {
    void load(
      1,
      search,
    );
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-800">
        {label}
      </label>

      {/*
       * This is the value the OUTER form actually submits.
       *
       * The pretty modal is presentation.
       *
       * propertyId / tenantId remains the real request value,
       * and the server validates ownership again.
       */}
      <input
        type="hidden"
        name={name}
        value={
          selected?.id ??
          ""
        }
      />

      <button
        type="button"
        onClick={
          openPicker
        }
        className="flex min-h-12 w-full items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left transition hover:border-zinc-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/10"
      >
        {selected ? (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Icon
                size={17}
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-950">
                {
                  selected.title
                }
              </p>

              {selected.subtitle && (
                <p className="mt-0.5 truncate text-xs text-zinc-500">
                  {
                    selected.subtitle
                  }
                </p>
              )}
            </div>
          </div>
        ) : (
          <span className="text-sm text-zinc-500">
            {placeholder}
          </span>
        )}

        <ChevronDown
          size={17}
          className="shrink-0 text-zinc-400"
        />
      </button>

      <dialog
        ref={
          dialogRef
        }
        onClick={(
          event,
        ) => {
          /**
           * Clicking the native dialog backdrop closes it.
           */
          if (
            event.target ===
            event.currentTarget
          ) {
            closePicker();
          }
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-3xl border border-zinc-200 bg-white p-0 shadow-2xl backdrop:bg-black/40"
      >
        <div className="flex max-h-[85vh] flex-col">
          {/* HEADER */}
          <div className="flex items-start justify-between border-b border-zinc-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-semibold text-zinc-950">
                Select{" "}
                {kind ===
                "property"
                  ? "property"
                  : "tenant"}
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Search and select from your records.
              </p>
            </div>

            <button
              type="button"
              onClick={
                closePicker
              }
              aria-label="Close picker"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100"
            >
              <X
                size={18}
              />
            </button>
          </div>

          {/* SEARCH */}
          <div className="border-b border-zinc-100 p-4 sm:p-5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                />

                <input
                  value={
                    search
                  }
                  onChange={(
                    event,
                  ) =>
                    setSearch(
                      event
                        .target
                        .value,
                    )
                  }
                  onKeyDown={(
                    event,
                  ) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      event.preventDefault();

                      handleSearch();
                    }
                  }}
                  placeholder={
                    searchPlaceholder
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-base outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 sm:text-sm"
                />
              </div>

              <button
                type="button"
                onClick={
                  handleSearch
                }
                disabled={
                  loading
                }
                className="rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60"
              >
                {loading
                  ? "Searching..."
                  : "Search"}
              </button>
            </div>
          </div>

          {/* RESULTS */}
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            {loading &&
            !loadedOnce ? (
              <PickerSkeleton />
            ) : result.items
                .length ===
              0 ? (
              <div className="py-12 text-center">
                <Search
                  size={30}
                  className="mx-auto text-zinc-300"
                />

                <p className="mt-4 font-medium text-zinc-800">
                  No results found
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Try a different search.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {result.items.map(
                  (option) => {
                    const active =
                      selected?.id ===
                      option.id;

                    return (
                      <button
                        type="button"
                        key={
                          option.id
                        }
                        onClick={() =>
                          choose(
                            option,
                          )
                        }
                        className={[
                          "rounded-2xl border p-4 text-left transition",

                          active
                            ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/10"
                            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50",
                        ].join(
                          " ",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                            <Icon
                              size={18}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-medium text-zinc-950">
                                {
                                  option.title
                                }
                              </p>

                              {option.badge && (
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                  {
                                    option.badge
                                  }
                                </span>
                              )}
                            </div>

                            {option.subtitle && (
                              <p className="mt-1 truncate text-sm text-zinc-500">
                                {
                                  option.subtitle
                                }
                              </p>
                            )}

                            {option.details &&
                              option.details.length >
                                0 && (
                                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                                  {option.details.map(
                                    (
                                      detail,
                                      index,
                                    ) => (
                                      <span
                                        key={`${option.id}-${index}`}
                                      >
                                        {
                                          detail
                                        }
                                      </span>
                                    ),
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </div>

          {/* PAGINATION */}
          <div className="flex flex-col gap-3 border-t border-zinc-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-zinc-500">
              {result.totalItems}{" "}
              {result.totalItems ===
              1
                ? "record"
                : "records"}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={
                  loading ||
                  result.page <=
                    1
                }
                onClick={() =>
                  void load(
                    result.page -
                      1,

                    search,
                  )
                }
                className="flex min-h-10 items-center gap-1 rounded-xl border border-zinc-200 px-3 text-sm font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft
                  size={15}
                />

                Previous
              </button>

              <span className="px-2 text-xs text-zinc-500">
                {result.page} /{" "}
                {
                  result.totalPages
                }
              </span>

              <button
                type="button"
                disabled={
                  loading ||
                  result.page >=
                    result.totalPages
                }
                onClick={() =>
                  void load(
                    result.page +
                      1,

                    search,
                  )
                }
                className="flex min-h-10 items-center gap-1 rounded-xl border border-zinc-200 px-3 text-sm font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next

                <ChevronRight
                  size={15}
                />
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}

function PickerSkeleton() {
  return (
    <div className="grid animate-pulse gap-3 sm:grid-cols-2">
      {Array.from({
        length: 4,
      }).map(
        (_, index) => (
          <div
            key={
              index
            }
            className="h-28 rounded-2xl border border-zinc-200 bg-zinc-50"
          />
        ),
      )}
    </div>
  );
}