/**
 * HTML sanitization utilities for preventing XSS attacks.
 *
 * - escapeHtml: for plain text contexts (email templates, user-generated text)
 * - sanitizeHtml: for rich HTML content (blog posts, product descriptions)
 */

/** Escape HTML special characters to prevent injection in plain text contexts */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Allowed HTML tags for rich content (blog posts, product descriptions) */
const ALLOWED_TAGS = new Set([
  'b', 'i', 'em', 'strong', 'u', 'p', 'br', 'ul', 'ol', 'li',
  'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre',
  'code', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'img', 'figure', 'figcaption', 'hr', 'sub', 'sup', 'mark',
]);

/** Allowed attributes per tag */
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target', 'rel']),
  img: new Set(['src', 'alt', 'title', 'width', 'height']),
  td: new Set(['colspan', 'rowspan']),
  th: new Set(['colspan', 'rowspan']),
  '*': new Set(['class', 'style']),
};

/**
 * Sanitize rich HTML content by stripping dangerous tags and attributes.
 * Removes script, iframe, object, embed, form, input, event handlers, and javascript: URLs.
 * Works on the server side without DOM dependencies.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';

  let clean = dirty;

  // Remove script tags and their content
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers (onclick, onerror, onload, etc.)
  clean = clean.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // Remove javascript:, vbscript:, data: URLs in attributes
  clean = clean.replace(/(?:href|src|action)\s*=\s*(?:"(?:javascript|vbscript|data):[^"]*"|'(?:javascript|vbscript|data):[^']*')/gi, '');

  // Remove dangerous tags entirely (with content for some)
  const dangerousTags = ['iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button', 'meta', 'link', 'base', 'applet'];
  for (const tag of dangerousTags) {
    // Remove self-closing and opening/closing pairs
    clean = clean.replace(new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi'), '');
    clean = clean.replace(new RegExp(`</${tag}>`, 'gi'), '');
  }

  // Remove style tags and their content
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  return clean;
}
