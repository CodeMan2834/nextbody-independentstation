"use server";

import { z } from "zod";
import { sendInquiryEmail } from "@/lib/email";

const inquirySchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z
    .string()
    .min(8, "Phone / WhatsApp is required")
    .regex(/^[+\d][\d\s()-]{6,}$/, "Enter a valid phone number with country code"),
  company: z.string().min(2, "Company name is required"),
  country: z.string().min(1, "Country is required"),
  productInterest: z.string().optional(),
  message: z.string().optional(),
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

    if (process.env.RESEND_API_KEY) {
      await sendInquiryEmail(parsed.data);
    } else {
      console.log("[Inquiry]", JSON.stringify(parsed.data, null, 2));
    }

    return { success: true };
  } catch (error) {
    console.error("[Inquiry Error]", error);
    return {
      success: false,
      error: "Something went wrong. Please try again or email us directly.",
    };
  }
}
