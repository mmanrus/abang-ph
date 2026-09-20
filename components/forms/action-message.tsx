import {
  ActionState,
} from "@/lib/action-state";

type Props = {
  state:
    ActionState;
};

export function ActionMessage({
  state,
}: Props) {
  if (
    !state.message
  ) {
    return null;
  }

  if (
    state.status ===
    "error"
  ) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {state.message}
      </div>
    );
  }

  if (
    state.status ===
    "success"
  ) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
      >
        {state.message}
      </div>
    );
  }

  return null;
}