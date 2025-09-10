(function(){
  function escapeHtml(str){
    return str.replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  }
  function inline(md){
    // links
    md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1<\/a>');
    // bold **text**
    md = md.replace(/\*\*([^*]+)\*\*/g, '<strong>$1<\/strong>');
    // italic *text*
    md = md.replace(/(^|\W)\*([^*]+)\*(?=\W|$)/g, '$1<em>$2<\/em>');
    return md;
  }
  function render(md){
    const lines = md.split(/\r?\n/);
    let html = '';
    let inList = false;
    for (let raw of lines){
      let line = raw.trimEnd();
      if (/^\s*$/.test(line)) { // blank line
        if (inList) { html += '</ul>'; inList = false; }
        html += '';
        continue;
      }
      const h = line.match(/^(#{1,3})\s+(.*)$/);
      if (h){
        if (inList) { html += '</ul>'; inList = false; }
        const level = h[1].length;
        html += `<h${level}>${inline(escapeHtml(h[2]))}</h${level}>`;
        continue;
      }
      const li = line.match(/^[-*]\s+(.*)$/);
      if (li){
        if (!inList) { html += '<ul>'; inList = true; }
        html += `<li>${inline(escapeHtml(li[1]))}</li>`;
        continue;
      }
      // paragraph
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p>${inline(escapeHtml(line))}</p>`;
    }
    if (inList) html += '</ul>';
    return html;
  }
  window.renderMarkdown = async function(path, targetId){
    try{
      const res = await fetch(path, {cache: 'no-store'});
      const text = await res.text();
      const root = document.getElementById(targetId);
      root.innerHTML = render(text);
    }catch(e){
      console.error('Failed to load markdown:', e);
    }
  }
})();

