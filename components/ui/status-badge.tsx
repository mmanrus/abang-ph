type Tone =
  | "green"
  | "blue"
  | "amber"
  | "red"
  | "gray";

type Props = {
  children:
    React.ReactNode;

  tone?: Tone;
};

const toneClasses: Record<
  Tone,
  string
> = {
  green:
    "bg-emerald-50 text-emerald-700",

  blue:
    "bg-blue-50 text-blue-700",

  amber:
    "bg-amber-50 text-amber-700",

  red:
    "bg-red-50 text-red-700",

  gray:
    "bg-zinc-100 text-zinc-600",
};

export function StatusBadge({
  children,
  tone = "gray",
}: Props) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",

        toneClasses[
          tone
        ],
      ].join(" ")}
    >
      {children}
    </span>
  );
}