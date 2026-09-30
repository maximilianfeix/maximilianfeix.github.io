import { Fragment } from "react";

/**
 * Splits text into words and characters for animation while keeping it readable to assistive tech:
 * the full string is the accessible name, the pieces are hidden from the accessibility tree.
 */
export function SplitText({
  text,
  className = "",
  charClassName = "",
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  charClassName?: string;
  as?: "span" | "h1" | "h2" | "p";
}) {
  const words = text.split(" ");
  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, w) => (
        <Fragment key={w}>
          <span aria-hidden className="split-word">
            {[...word].map((ch, c) => (
              <span key={c} className={`inline-block will-change-transform ${charClassName}`} data-char>
                {ch}
              </span>
            ))}
          </span>
          {w < words.length - 1 && <span aria-hidden> </span>}
        </Fragment>
      ))}
    </Tag>
  );
}
