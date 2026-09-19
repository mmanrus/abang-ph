"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (result.error) {
        setError(
          result.error.message ??
            "We couldn't create your account.",
        );

        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        "Something went wrong while creating your account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-emerald-600">
          ABANG PH
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
          Create your account
        </h1>

        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Start managing your properties, tenants, rent, and
          expenses in one place.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-zinc-800"
          >
            Full name
          </label>

          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            disabled={isSubmitting}
            placeholder="Juan Dela Cruz"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-zinc-800"
          >
            Email address
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            disabled={isSubmitting}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-zinc-800"
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            disabled={isSubmitting}
            placeholder="Minimum 8 characters"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-zinc-800"
          >
            Confirm password
          </label>

          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            disabled={isSubmitting}
            placeholder="Enter your password again"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-60"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Creating account..."
            : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-emerald-700 hover:text-emerald-800"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}