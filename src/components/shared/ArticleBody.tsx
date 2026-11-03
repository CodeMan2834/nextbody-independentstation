import Markdown, { defaultUrlTransform } from "react-markdown";

export function articleUrl(url: string, key: string): string {
  const safe = defaultUrlTransform(url);
  if (!safe || safe.startsWith("//") || safe.includes("\\")) return "";
  if (key === "src") {
    try {
      const decoded = decodeURIComponent(safe);
      return /^\/(?!\/)[^<>\\\x00-\x1f?#]+\.(png|jpe?g|webp|gif|avif)$/i.test(decoded) && !decoded.split("/").some(part => part === ".." || part === ".") ? safe : "";
    } catch { return ""; }
  }
  return /^(https:\/\/|mailto:|\/(?!\/)|#)/i.test(safe) ? safe : "";
}

export function ArticleBody({ body }: { body: string }) {
  return <div className="journal-body"><Markdown skipHtml urlTransform={articleUrl} components={{
    h1: ({ children }) => <h2>{children}</h2>,
    a: ({ href, children }) => href ? <a href={href} {...(href.startsWith("https:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}</a> : <span>{children}</span>,
    img: ({ src, alt, title }) => typeof src === "string" && src ?
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt || "Article illustration"} title={title} loading="lazy" decoding="async" /> : null,
  }}>{body}</Markdown></div>;
}
