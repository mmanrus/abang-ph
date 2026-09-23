"use client";

import {
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  searchPropertyPickerAction,
  searchRentableSpacePickerAction,
} from "@/app/(app)/pickers/actions";

/**
 * These types are inferred directly from the server actions'
 * return types rather than imported/guessed from "@/lib/picker",
 * so this component always matches whatever those actions
 * actually return.
 */
type PropertyResult =
  Awaited<
    ReturnType<
      typeof searchPropertyPickerAction
    >
  >;

type PropertyOption =
  PropertyResult["items"][number];

type SpaceResult =
  Awaited<
    ReturnType<
      typeof searchRentableSpacePickerAction
    >
  >;

type SpaceOption =
  SpaceResult["items"][number];

type SelectedSpace = {
  id: string;
  label: string;
  defaultRent: string | null;
};

type Props = {
  /**
   * Name of the hidden field submitted with the parent form.
   *
   * Example: rentableSpaceId
   */
  name: string;

  label: string;

  placeholder: string;

  propertySearchPlaceholder: string;

  spaceSearchPlaceholder: string;

  /**
   * Fires whenever a space is chosen -- CreateLeaseForm uses
   * this to prefill "Monthly rent" from the space's
   * defaultRent, the same way it did before.
   */
  onSelect?: (
    space: SelectedSpace,
  ) => void;
};

const EMPTY_PROPERTY_RESULT: PropertyResult =
  {
    items: [],
    page: 1,
    totalPages: 1,
    totalItems: 0,
  };

const EMPTY_SPACE_RESULT: SpaceResult = {
  items: [],
  page: 1,
  totalPages: 1,
  totalItems: 0,
};

type Step = "property" | "space";

export function SpacePickerField({
  name,
  label,
  placeholder,
  propertySearchPlaceholder,
  spaceSearchPlaceholder,
  onSelect,
}: Props) {
  const dialogRef =
    useRef<HTMLDialogElement>(
      null,
    );

  const [
    step,
    setStep,
  ] = useState<Step>(
    "property",
  );

  const [
    selected,
    setSelected,
  ] =
    useState<SelectedSpace | null>(
      null,
    );

  // -- Step 1: property search state --

  const [
    propertySearch,
    setPropertySearch,
  ] = useState("");

  const [
    propertyResult,
    setPropertyResult,
  ] = useState<PropertyResult>(
    EMPTY_PROPERTY_RESULT,
  );

  const [
    propertyLoading,
    setPropertyLoading,
  ] = useState(false);

  const [
    propertyLoadedOnce,
    setPropertyLoadedOnce,
  ] = useState(false);

  // -- Step 2: space search state (scoped to selectedProperty) --

  const [
    selectedProperty,
    setSelectedProperty,
  ] =
    useState<PropertyOption | null>(
      null,
    );

  const [
    spaceSearch,
    setSpaceSearch,
  ] = useState("");

  const [
    spaceResult,
    setSpaceResult,
  ] = useState<SpaceResult>(
    EMPTY_SPACE_RESULT,
  );

  const [
    spaceLoading,
    setSpaceLoading,
  ] = useState(false);

  const [
    spaceLoadedOnce,
    setSpaceLoadedOnce,
  ] = useState(false);

  /**
   * SCROLL LOCK
   * ------------
   *
   * Native <dialog> with showModal() does NOT reliably prevent
   * the page behind it from scrolling in every browser -- this
   * is a known gap, especially noticeable on touch/mobile. We
   * lock document.body scrolling for as long as the dialog is
   * open, and unlock it on the dialog's native "close" event
   * (not just our own closePicker()) so it's restored no matter
   * how the dialog was closed -- backdrop click, Escape key, or
   * the X button.
   */
  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    function handleClose() {
      document.body.style.overflow = "";
    }

    dialog.addEventListener(
      "close",
      handleClose,
    );

    return () => {
      dialog.removeEventListener(
        "close",
        handleClose,
      );
    };
  }, []);

  async function loadProperties(
    page: number,
    q: string,
  ) {
    setPropertyLoading(true);

    try {
      const data =
        await searchPropertyPickerAction(
          {
            q,
            page,
          },
        );

      setPropertyResult(data);
      setPropertyLoadedOnce(true);
    } finally {
      setPropertyLoading(false);
    }
  }

  async function loadSpaces(
    propertyId: string,
    page: number,
    q: string,
  ) {
    setSpaceLoading(true);

    try {
      const data =
        await searchRentableSpacePickerAction(
          {
            propertyId,
            q,
            page,
          },
        );

      setSpaceResult(data);
      setSpaceLoadedOnce(true);
    } finally {
      setSpaceLoading(false);
    }
  }

  async function openPicker() {
    setStep("property");
    document.body.style.overflow = "hidden";
    dialogRef.current?.showModal();

    if (!propertyLoadedOnce) {
      await loadProperties(1, "");
    }
  }

  function closePicker() {
    dialogRef.current?.close();
  }

  function chooseProperty(
    property: PropertyOption,
  ) {
    setSelectedProperty(property);
    setStep("space");
    setSpaceSearch("");
    setSpaceResult(
      EMPTY_SPACE_RESULT,
    );
    setSpaceLoadedOnce(false);

    void loadSpaces(
      property.id,
      1,
      "",
    );
  }

  function backToProperties() {
    setStep("property");
  }

  function chooseSpace(
    space: SpaceOption,
  ) {
    if (!selectedProperty) {
      return;
    }

    const value: SelectedSpace = {
      id: space.id,

      label: [
        selectedProperty.title,
        space.subtitle,
        space.title,
      ].join(" · "),

      defaultRent:
        space.defaultRent,
    };

    setSelected(value);
    onSelect?.(value);
    closePicker();
  }

  function handlePropertySearch() {
    void loadProperties(
      1,
      propertySearch,
    );
  }

  function handleSpaceSearch() {
    if (!selectedProperty) {
      return;
    }

    void loadSpaces(
      selectedProperty.id,
      1,
      spaceSearch,
    );
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-800">
        {label}
      </label>

      {/*
       * This is the value the OUTER form actually submits.
       * The picker UI is presentation only.
       */}
      <input
        type="hidden"
        name={name}
        value={
          selected?.id ?? ""
        }
        required
      />

      <button
        type="button"
        onClick={openPicker}
        className="flex min-h-12 w-full items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left transition hover:border-zinc-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/10"
      >
        {selected ? (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Building2
                size={17}
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-950">
                {selected.label}
              </p>

              {selected.defaultRent && (
                <p className="mt-0.5 truncate text-xs text-zinc-500">
                  ₱{selected.defaultRent} / month
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
        ref={dialogRef}
        onClick={(event) => {
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
          {step === "property" ? (
            <>
              {/* HEADER */}
              <div className="flex items-start justify-between border-b border-zinc-100 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="font-semibold text-zinc-950">
                    Select property
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Choose the property this lease belongs to.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closePicker}
                  aria-label="Close picker"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100"
                >
                  <X size={18} />
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
                        propertySearch
                      }
                      onChange={(
                        event,
                      ) =>
                        setPropertySearch(
                          event.target
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
                          handlePropertySearch();
                        }
                      }}
                      placeholder={
                        propertySearchPlaceholder
                      }
                      className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-base outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 sm:text-sm"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={
                      handlePropertySearch
                    }
                    disabled={
                      propertyLoading
                    }
                    aria-label="Search properties"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-zinc-950 px-0 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60 sm:w-auto sm:px-5"
                  >
                    <Search
                      size={16}
                      aria-hidden="true"
                    />

                    <span className="hidden sm:inline">
                      {propertyLoading
                        ? "Searching..."
                        : "Search"}
                    </span>
                  </button>
                </div>
              </div>

              {/* RESULTS */}
              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                {propertyLoading &&
                !propertyLoadedOnce ? (
                  <PickerSkeleton />
                ) : propertyResult
                    .items.length ===
                  0 ? (
                  <div className="py-12 text-center">
                    <Search
                      size={30}
                      className="mx-auto text-zinc-300"
                    />

                    <p className="mt-4 font-medium text-zinc-800">
                      No properties found
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Try a different search.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {propertyResult.items.map(
                      (property) => (
                        <button
                          type="button"
                          key={
                            property.id
                          }
                          onClick={() =>
                            chooseProperty(
                              property,
                            )
                          }
                          className="rounded-2xl border border-zinc-200 bg-white p-4 text-left transition hover:border-zinc-300 hover:bg-zinc-50"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                              <Building2
                                size={18}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate font-medium text-zinc-950">
                                  {
                                    property.title
                                  }
                                </p>

                                {property.badge && (
                                  <span
                                    className={[
                                      "rounded-full px-2 py-0.5 text-[11px] font-medium",

                                      property.badge ===
                                      "Fully Occupied"
                                        ? "bg-zinc-100 text-zinc-600"
                                        : "bg-emerald-50 text-emerald-700",
                                    ].join(
                                      " ",
                                    )}
                                  >
                                    {
                                      property.badge
                                    }
                                  </span>
                                )}
                              </div>

                              {property.subtitle && (
                                <p className="mt-1 truncate text-sm text-zinc-500">
                                  {
                                    property.subtitle
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>

              {/* PAGINATION */}
              <div className="flex flex-col gap-3 border-t border-zinc-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-xs text-zinc-500">
                  {
                    propertyResult.totalItems
                  }{" "}
                  {propertyResult.totalItems ===
                  1
                    ? "property"
                    : "properties"}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={
                      propertyLoading ||
                      propertyResult.page <=
                        1
                    }
                    onClick={() =>
                      void loadProperties(
                        propertyResult.page -
                          1,
                        propertySearch,
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
                    {
                      propertyResult.page
                    }{" "}
                    /{" "}
                    {
                      propertyResult.totalPages
                    }
                  </span>

                  <button
                    type="button"
                    disabled={
                      propertyLoading ||
                      propertyResult.page >=
                        propertyResult.totalPages
                    }
                    onClick={() =>
                      void loadProperties(
                        propertyResult.page +
                          1,
                        propertySearch,
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
            </>
          ) : (
            <>
              {/* HEADER */}
              <div className="flex items-start justify-between border-b border-zinc-100 px-5 py-4 sm:px-6">
                <div className="flex min-w-0 items-start gap-3">
                  <button
                    type="button"
                    onClick={
                      backToProperties
                    }
                    aria-label="Back to properties"
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100"
                  >
                    <ChevronLeft
                      size={18}
                    />
                  </button>

                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-zinc-950">
                      Select space
                      {selectedProperty
                        ? ` · ${selectedProperty.title}`
                        : ""}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      Only available spaces are shown.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closePicker}
                  aria-label="Close picker"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100"
                >
                  <X size={18} />
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
                        spaceSearch
                      }
                      onChange={(
                        event,
                      ) =>
                        setSpaceSearch(
                          event.target
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
                          handleSpaceSearch();
                        }
                      }}
                      placeholder={
                        spaceSearchPlaceholder
                      }
                      className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-base outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 sm:text-sm"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleSpaceSearch
                    }
                    disabled={
                      spaceLoading
                    }
                    aria-label="Search spaces"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-zinc-950 px-0 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60 sm:w-auto sm:px-5"
                  >
                    <Search
                      size={16}
                      aria-hidden="true"
                    />

                    <span className="hidden sm:inline">
                      {spaceLoading
                        ? "Searching..."
                        : "Search"}
                    </span>
                  </button>
                </div>
              </div>

              {/* RESULTS */}
              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                {spaceLoading &&
                !spaceLoadedOnce ? (
                  <PickerSkeleton />
                ) : spaceResult.items
                    .length === 0 ? (
                  <div className="py-12 text-center">
                    <Search
                      size={30}
                      className="mx-auto text-zinc-300"
                    />

                    <p className="mt-4 font-medium text-zinc-800">
                      {!spaceSearch &&
                      spaceResult.totalItems ===
                        0
                        ? "No available spaces"
                        : "No results found"}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      {!spaceSearch &&
                      spaceResult.totalItems ===
                        0
                        ? "This property has no available spaces right now."
                        : "Try a different search."}
                    </p>

                    <button
                      type="button"
                      onClick={
                        backToProperties
                      }
                      className="mt-5 inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                    >
                      <ChevronLeft
                        size={16}
                      />
                      Choose a different property
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {spaceResult.items.map(
                      (space) => {
                        const active =
                          selected?.id ===
                          space.id;

                        return (
                          <button
                            type="button"
                            key={
                              space.id
                            }
                            onClick={() =>
                              chooseSpace(
                                space,
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
                                <Building2
                                  size={18}
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-zinc-950">
                                  {
                                    space.title
                                  }
                                </p>

                                <p className="mt-1 truncate text-sm text-zinc-500">
                                  {
                                    space.subtitle
                                  }
                                </p>

                                {space.defaultRent && (
                                  <p className="mt-1 text-xs text-zinc-500">
                                    ₱
                                    {
                                      space.defaultRent
                                    }{" "}
                                    / month
                                  </p>
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
                  {
                    spaceResult.totalItems
                  }{" "}
                  {spaceResult.totalItems ===
                  1
                    ? "space"
                    : "spaces"}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={
                      spaceLoading ||
                      spaceResult.page <=
                        1
                    }
                    onClick={() =>
                      selectedProperty &&
                      void loadSpaces(
                        selectedProperty.id,
                        spaceResult.page -
                          1,
                        spaceSearch,
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
                    {
                      spaceResult.page
                    }{" "}
                    /{" "}
                    {
                      spaceResult.totalPages
                    }
                  </span>

                  <button
                    type="button"
                    disabled={
                      spaceLoading ||
                      spaceResult.page >=
                        spaceResult.totalPages
                    }
                    onClick={() =>
                      selectedProperty &&
                      void loadSpaces(
                        selectedProperty.id,
                        spaceResult.page +
                          1,
                        spaceSearch,
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
            </>
          )}
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
      }).map((_, index) => (
        <div
          key={index}
          className="h-28 rounded-2xl border border-zinc-200 bg-zinc-50"
        />
      ))}
    </div>
  );
}