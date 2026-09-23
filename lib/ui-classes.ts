/**
 * Shared UI class names
 * ---------------------
 *
 * WHY?
 *
 * Without shared primitives, pages slowly become inconsistent:
 *
 * one input:
 *   rounded-lg
 *
 * another:
 *   rounded-xl
 *
 * another:
 *   text-sm
 *
 * another:
 *   text-base
 *
 * Centralizing the common styles gives Abang a consistent
 * visual language without introducing a large UI framework.
 *
 * IMPORTANT MOBILE DETAIL:
 *
 * Inputs use:
 *
 *   text-base sm:text-sm
 *
 * On many mobile browsers, very small input text can trigger
 * automatic zoom when the field receives focus.
 *
 * 16px (`text-base`) on mobile avoids that annoyance.
 */
export const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500 sm:text-sm";

export const selectClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-zinc-100 sm:text-sm";

export const textareaClass =
  "w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-zinc-100 sm:text-sm";

export const labelClass =
  "mb-2 block text-sm font-medium text-zinc-800";

export const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zinc-500/10 disabled:cursor-not-allowed disabled:opacity-60";

export const dangerButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60";

  
/**
 * iconButtonClass
 * ----------------
 *
 * For square, icon-only buttons/links — e.g. a "clear search"
 * X button next to a search field. Sized to h-11/w-11 to line
 * up with the 44px min-height used across inputs and the other
 * button classes above, and uses the same zinc/border language
 * as `secondaryButtonClass` so icon-only actions don't drift
 * into a different visual style over time.
 */
export const iconButtonClass =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zinc-500/10 disabled:cursor-not-allowed disabled:opacity-60";
