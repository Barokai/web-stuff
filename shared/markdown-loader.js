export async function loadMarkdown(path) {
  try {
    const response = await fetch(path);
    const text = await response.text();

    // Store code blocks to protect them
    const codeBlocks = [];
    const withProtectedCode = text.replace(/```[\s\S]*?```/g, (match) => {
      const code = match
        .slice(match.indexOf('\n') + 1, -3) // Remove language line and end ticks
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      codeBlocks.push(`<pre><code>${code}</code></pre>`);
      return `___CODE_BLOCK_${codeBlocks.length - 1}___`;
    });

    // Process regular markdown
    const processed = withProtectedCode
      // Handle headers (only if # is at start of line and not in code block)
      .replace(/^# ([^#].*$)/gm, '<h1>$1</h1>')
      .replace(/^## ([^#].*$)/gm, '<h2>$1</h2>')
      .replace(/^### ([^#].*$)/gm, '<h3>$1</h3>')
      // Handle links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // Handle bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Handle lists
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      // Handle paragraphs
      .split('\n\n')
      .map(p => {
        if (p.trim() === '') return '';
        if (p.startsWith('<')) return p;
        return `<p>${p.replace(/\n/g, '<br>')}</p>`;
      })
      .join('\n');

    // Restore code blocks
    return processed.replace(/___CODE_BLOCK_(\d+)___/g, (_, index) => codeBlocks[index]);

  } catch (error) {
    console.error('Error loading markdown:', error);
    return '<div class="error">Error loading documentation.</div>';
  }
}
