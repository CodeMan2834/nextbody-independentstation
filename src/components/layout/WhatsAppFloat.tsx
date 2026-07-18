import Link from "next/link";
import { MessageCircle } from "lucide-react";
import {
  isWhatsAppPlaceholder,
  WHATSAPP_MESSAGES,
  whatsappHref,
} from "@/lib/site-config";

export function WhatsAppFloat() {
  if (isWhatsAppPlaceholder()) return null;

  return (
    <Link
      href={whatsappHref(WHATSAPP_MESSAGES.float)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed inset-block-end-6 inset-inline-end-6 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="size-6" />
    </Link>
  );
}
