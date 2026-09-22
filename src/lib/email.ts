import { Resend } from "resend";
import { siteConfig } from "@/lib/site-config";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type InquiryEmailData = {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  productInterest?: string;
  message?: string;
};

export async function sendInquiryEmail(data: InquiryEmailData) {
  const {
    fullName,
    email,
    phone,
    company,
    country,
    productInterest,
    message,
  } = data;

  const safe = {
    fullName: escapeHtml(fullName),
    email: escapeHtml(email),
    phone: escapeHtml(phone),
    company: escapeHtml(company),
    country: escapeHtml(country),
    productInterest: escapeHtml(productInterest || "Not specified"),
    message: message ? escapeHtml(message) : "",
  };

  const resend = getResendClient();
  // Keep public contact, inquiry sender and recipient on the same CMS setting.
  // Legacy EMAIL_FROM / EMAIL_TO values must not route inquiries to old mailboxes.
  const contactEmail = siteConfig.contactEmail.trim();
  const result = await resend.emails.send({
    from: `NEXBODY <${contactEmail}>`,
    to: contactEmail,
    subject: `New Inquiry from ${fullName} — ${company}`,
    html: `
      <h2>New NEXBODY Inquiry</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;font-weight:600">Name</td><td style="padding:8px">${safe.fullName}</td></tr>
        <tr><td style="padding:8px;font-weight:600">Email</td><td style="padding:8px">${safe.email}</td></tr>
        <tr><td style="padding:8px;font-weight:600">Phone / WhatsApp</td><td style="padding:8px">${safe.phone}</td></tr>
        <tr><td style="padding:8px;font-weight:600">Company</td><td style="padding:8px">${safe.company}</td></tr>
        <tr><td style="padding:8px;font-weight:600">Country</td><td style="padding:8px">${safe.country}</td></tr>
        <tr><td style="padding:8px;font-weight:600">Product</td><td style="padding:8px">${safe.productInterest}</td></tr>
      </table>
      ${safe.message ? `<h3>Message</h3><p>${safe.message}</p>` : ""}
    `,
    replyTo: email,
  });

  if (result.error) {
    throw new Error(`Email provider rejected the inquiry (${result.error.name})`);
  }
  if (!result.data?.id) {
    throw new Error("Email provider did not acknowledge the inquiry");
  }

  return result.data;
}
