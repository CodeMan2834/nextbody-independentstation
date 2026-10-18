"use server";

import { z } from "zod";
import { sendInquiryEmail } from "@/lib/email";

const inquirySchema = z.object({
  fullName: z.string().trim().min(2, "Name is required").max(120, "Name is too long").regex(/^[^\r\n\x00]*$/, "Enter a valid name"),
  email: z.string().trim().email("Valid email required").max(254),
  phone: z
    .string().trim().max(40, "Phone number is too long")
    .min(8, "Phone / WhatsApp is required")
    .regex(/^[+\d][\d\s()-]{6,}$/, "Enter a valid phone number with country code"),
  company: z.string().trim().min(2, "Company name is required").max(200, "Company name is too long").regex(/^[^\r\n\x00]*$/, "Enter a valid company name"),
  country: z.string().trim().min(1, "Country is required").max(100),
  productInterest: z.string().trim().max(200).optional(),
  message: z.string().trim().max(5000, "Message must be under 5000 characters").optional(),
});

export type InquiryFormData = z.infer<typeof inquirySchema>;
export type InquiryResult =
  | { success: true }
  | { success: false; error: string };

export async function submitInquiry(
  formData: InquiryFormData
): Promise<InquiryResult> {
  try {
    const parsed = inquirySchema.safeParse(formData);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(errors).flat()[0] || "Validation failed";
      return { success: false, error: firstError };
    }

    await sendInquiryEmail(parsed.data);

    return { success: true };
  } catch (error) {
    console.error("[Inquiry Error]", error instanceof Error ? error.message : "Email submission failed");
    return {
      success: false,
      error: "Something went wrong. Please try again or email us directly.",
    };
  }
}
