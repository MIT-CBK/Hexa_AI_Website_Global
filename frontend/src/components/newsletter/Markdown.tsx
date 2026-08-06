import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

/**
 * Renders Markdown to React elements. react-markdown does NOT render raw HTML
 * (rehype-raw is intentionally NOT enabled), so author input cannot inject
 * scripts/HTML — safe by construction, no dangerouslySetInnerHTML needed.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-hexa">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer noopener">
              {children}
            </a>
          ),
          img: ({ src, alt }) =>
            typeof src === "string" ? <img src={src} alt={alt ?? ""} loading="lazy" /> : null,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
