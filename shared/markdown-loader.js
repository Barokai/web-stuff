export async function loadMarkdown(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      if (response.status === 404) {
        return '<div class="info">Documentation not available for this tool.</div>';
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    if (!text.trim()) {
      return '<div class="info">No documentation content available.</div>';
    }

    // Store code blocks to protect them
    const codeBlocks = [];
    const withProtectedCode = text.replace(/```[\s\S]*?```/g, (match) => {
      try {
        const code = match
          .slice(match.indexOf('\n') + 1, -3)
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        codeBlocks.push(`<pre><code>${code}</code></pre>`);
        return `___CODE_BLOCK_${codeBlocks.length - 1}___`;
      } catch (err) {
        console.warn('Error processing code block:', err);
        return '<pre><code>Error processing code block</code></pre>';
      }
    });

    // Process regular markdown with error handling
    try {
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
          try {
            if (p.trim() === '') return '';
            if (p.startsWith('<')) return p;
            return `<p>${p.replace(/\n/g, '<br>')}</p>`;
          } catch (err) {
            console.warn('Error processing paragraph:', err);
            return '<p>Error processing content</p>';
          }
        })
        .filter(Boolean)
        .join('\n');

      // Restore code blocks with error handling
      return processed.replace(/___CODE_BLOCK_(\d+)___/g, (_, index) => {
        return codeBlocks[index] || '<pre><code>Missing code block</code></pre>';
      });
    } catch (err) {
      console.error('Error processing markdown:', err);
      return '<div class="error">Error processing documentation.</div>';
    }

  } catch (error) {
    console.error('Error loading markdown:', error);
    if (error.name === 'TypeError' && error.message.includes('failed to fetch')) {
      return '<div class="info">Unable to load documentation. Please check your connection.</div>';
    }
    return '<div class="error">Error loading documentation.</div>';
  }
}
