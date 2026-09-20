import Link from "next/link";

type Props = {
  icon:
    React.ElementType;

  title:
    string;

  description:
    string;

  actionLabel?:
    string;

  actionHref?:
    string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
        <Icon
          size={23}
          aria-hidden="true"
        />
      </div>

      <h2 className="mt-4 font-semibold text-zinc-950">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        {description}
      </p>

      {actionLabel &&
        actionHref && (
          <Link
            href={
              actionHref
            }
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
          >
            {
              actionLabel
            }
          </Link>
        )}
    </div>
  );
}