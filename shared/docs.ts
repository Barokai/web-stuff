import DOMPurify from 'dompurify';
import { marked } from 'marked';

/** Renders a README (imported with `?raw`) into the page's documentation panel. */
export function renderDocs(markdown: string, target: HTMLElement | null = document.getElementById('readme-content')): void {
  if (!target) {
    return;
  }
  const html = marked.parse(markdown, { async: false });
  target.innerHTML = DOMPurify.sanitize(html);
}
