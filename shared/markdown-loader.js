export async function loadMarkdown(path) {
  try {
    const response = await fetch(path);
    const text = await response.text();

    return text
      // First, protect code blocks
      .replace(/```[\s\S]*?```/g, match => {
        return '<pre><code>' +
          match.slice(match.indexOf('\n') + 1, -3) // Remove first line (language) and backticks
            .replace(/^# /gm, '# ') // Protect # from being interpreted as headers
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
          + '</code></pre>';
      })
      // Handle headers (only if # is at start of line)
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      // Handle links [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // Handle bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Handle lists (only at start of line)
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      // Handle paragraphs
      .split('\n\n')
      .map(p => {
        if (p.trim() === '') return '';
        if (p.startsWith('<')) return p; // Don't wrap existing HTML
        return `<p>${p.replace(/\n/g, '<br>')}</p>`;
      })
      .join('\n');
  } catch (error) {
    console.error('Error loading markdown:', error);
    return '<div class="error">Error loading documentation.</div>';
  }
}
