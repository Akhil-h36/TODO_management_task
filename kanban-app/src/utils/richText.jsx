const TOKEN_RE = /\*\*(.+?)\*\*|==(.+?)==/g;

/**
 * Parses a small, fixed inline-formatting subset out of plain text:
 * **bold** and ==highlight==. Never touches innerHTML - unmatched
 * markers just render as literal text, so there is no injection surface,
 * unlike a real HTML/markdown renderer would have.
 */
export function renderFormattedText(text) {
  if (!text) return null;

  const nodes = [];
  let lastIndex = 0;
  let key = 0;
  let match;

  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    if (match[1] !== undefined) {
      nodes.push(<strong key={key++}>{match[1]}</strong>);
    } else {
      nodes.push(<mark key={key++}>{match[2]}</mark>);
    }
    lastIndex = TOKEN_RE.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

  return nodes;
}
