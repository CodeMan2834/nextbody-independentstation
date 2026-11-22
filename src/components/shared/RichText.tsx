import Markdown from "react-markdown";
import { articleUrl } from "./ArticleBody";

export function RichText({ body, className = "" }: { body: string; className?: string }) {
  return (
    <div className={`rich-content ${className}`.trim()}>
      <Markdown skipHtml urlTransform={articleUrl} components={{
        h1: ({ children }) => <h2>{children}</h2>,
        a: ({ href, children }) => href
          ? <a href={href} {...(href.startsWith("https:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}</a>
          : <span>{children}</span>,
        img: ({ src, alt, title }) => typeof src === "string" && src
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={src} alt={alt || "Content illustration"} title={title} loading="lazy" decoding="async" />
          : null,
      }}>{body}</Markdown>
    </div>
  );
}
