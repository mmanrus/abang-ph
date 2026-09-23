import {
  Eye,
} from "lucide-react";

export function DemoModeBanner() {
  return (
    <div
      className="
        border-b
        border-amber-200
        bg-amber-50
      "
    >
      <div
        className="
          mx-auto
          flex
          max-w-7xl
          items-start
          gap-3
          px-4
          py-3
          sm:items-center
          sm:px-6
          lg:px-8
        "
      >
        <Eye
          size={18}
          className="
            mt-0.5
            shrink-0
            text-amber-700
            sm:mt-0
          "
          aria-hidden="true"
        />

        <div>
          <p
            className="
              text-sm
              font-medium
              text-amber-900
            "
          >
            You&apos;re viewing the Abang PH live demo.
          </p>

          <p
            className="
              mt-0.5
              text-xs
              leading-5
              text-amber-700
            "
          >
            Explore the app freely. Changes are disabled
            to keep the demo ready for everyone.
          </p>
        </div>
      </div>
    </div>
  );
}