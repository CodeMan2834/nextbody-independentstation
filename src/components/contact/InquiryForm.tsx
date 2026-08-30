"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { submitInquiry } from "@/actions/submit-inquiry";
import type { InquiryFormData } from "@/actions/submit-inquiry";

const COUNTRIES = [
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Kuwait",
  "Oman",
  "Bahrain",
  "Thailand",
  "Indonesia",
  "Malaysia",
  "Vietnam",
  "Philippines",
  "Other",
];

const PRODUCTS = ["Nexbody-X60", "OneScan", "F20", "Multiple / Not Sure"];

const fieldClass =
  "w-full rounded-lg border border-[var(--surface-border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]";

const labelClass = "mb-2 block text-sm font-medium text-[var(--text-primary)]";

export function InquiryForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data: InquiryFormData = {
      fullName: (formData.get("fullName") as string)?.trim(),
      email: (formData.get("email") as string)?.trim(),
      phone: (formData.get("phone") as string)?.trim(),
      company: (formData.get("company") as string)?.trim(),
      country: formData.get("country") as string,
      productInterest: (formData.get("productInterest") as string) || undefined,
      message: (formData.get("message") as string)?.trim() || undefined,
    };

    startTransition(async () => {
      const result = await submitInquiry(data);
      if (result.success) {
        router.push("/success");
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="fullName" className={labelClass}>
            Full Name *
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            autoComplete="name"
            className={fieldClass}
            placeholder="Ahmed Al Rashid"
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Work Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
            placeholder="ahmed@gym.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone / WhatsApp *
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            className={fieldClass}
            placeholder="+971 50 123 4567"
          />
          <p className="mt-1.5 text-xs text-[var(--text-dim)]">
            Include country code (e.g. +971, +966, +66)
          </p>
        </div>

        <div>
          <label htmlFor="company" className={labelClass}>
            Company / Facility *
          </label>
          <input
            id="company"
            name="company"
            type="text"
            required
            autoComplete="organization"
            className={fieldClass}
            placeholder="Clinic, gym or research lab"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="country" className={labelClass}>
            Country *
          </label>
          <select
            id="country"
            name="country"
            required
            defaultValue=""
            className={fieldClass}
          >
            <option value="" disabled>
              Select country
            </option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="productInterest" className={labelClass}>
          Product Interest
        </label>
        <select
          id="productInterest"
          name="productInterest"
          defaultValue=""
          className={fieldClass}
        >
          <option value="">Select product (optional)</option>
          {PRODUCTS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className={`${fieldClass} resize-none`}
          placeholder="Tell us about your facility — specialty, locations, and which system you want to see."
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-br from-[#0070ff] via-[var(--brand)] to-[#0050d4] px-8 py-4 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_4px_20px_rgba(0,102,255,0.28)] transition-[transform,box-shadow,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_36px_rgba(0,102,255,0.42)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:brightness-100"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Inquiry"
        )}
      </button>
    </form>
  );
}
