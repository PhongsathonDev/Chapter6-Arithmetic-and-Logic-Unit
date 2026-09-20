import React from 'react';
import { 
  CheckCircle2, AlertTriangle, 
  Info, Lightbulb, ShieldAlert, Sparkles 
} from 'lucide-react';

export default function SummaryViewer({ modules, activeModuleId, searchQuery }) {
  const displayModules = searchQuery
    ? modules.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : modules.filter(m => m.id === activeModuleId);

  // Helper to format inline markdown (bold, code, links)
  const formatInlineMarkdown = (str) => {
    if (!str) return '';
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  };

  // Robust Markdown and HTML Parser
  const renderMarkdown = (content) => {
    if (!content) return null;

    // Split lines
    const lines = content.split('\n');
    const elements = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Empty line
      if (!trimmed) {
        i++;
        continue;
      }

      // Check for Raw HTML block (e.g. <div className="..." or <div class="...")
      if (trimmed.startsWith('<div') || trimmed.startsWith('<section')) {
        let htmlBlock = line;
        let depth = 1;
        i++;
        while (i < lines.length && depth > 0) {
          const currentLine = lines[i];
          htmlBlock += '\n' + currentLine;
          if (currentLine.includes('<div') || currentLine.includes('<section')) depth++;
          if (currentLine.includes('</div>') || currentLine.includes('</section>')) depth--;
          i++;
        }
        elements.push(
          <div 
            key={`html-${i}`} 
            dangerouslySetInnerHTML={{ __html: htmlBlock }} 
          />
        );
        continue;
      }

      // Headings
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${i}`} className="section-h3">
            {trimmed.replace('### ', '')}
          </h3>
        );
        i++;
        continue;
      }

      if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={`h4-${i}`} className="section-h4">
            {trimmed.replace('#### ', '')}
          </h4>
        );
        i++;
        continue;
      }

      // Horizontal Divider
      if (trimmed === '---') {
        elements.push(<hr key={`hr-${i}`} className="content-hr" />);
        i++;
        continue;
      }

      // Markdown Table Detection (| Header 1 | Header 2 |)
      if (trimmed.startsWith('|') && trimmed.endsWith('|') && lines[i + 1] && lines[i + 1].trim().startsWith('|') && lines[i + 1].includes('---')) {
        const tableLines = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }

        if (tableLines.length >= 2) {
          const headerCells = tableLines[0]
            .split('|')
            .slice(1, -1)
            .map(c => c.trim());

          const bodyRows = tableLines.slice(2).map(r => 
            r.split('|').slice(1, -1).map(c => c.trim())
          );

          elements.push(
            <div key={`tbl-${i}`} className="modern-table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    {headerCells.map((h, hIdx) => (
                      <th key={hIdx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(h) }} />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bodyRows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cell) }} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // GitHub Style Alerts / Callouts (> [!NOTE], > [!TIP], > [!IMPORTANT], > [!WARNING])
      if (trimmed.startsWith('>')) {
        const calloutLines = [];
        let calloutType = 'info'; // default

        while (i < lines.length && lines[i].trim().startsWith('>')) {
          const cLine = lines[i].trim().replace(/^>\s?/, '');
          if (cLine.startsWith('[!NOTE]') || cLine.startsWith('[!INFO]')) {
            calloutType = 'info';
          } else if (cLine.startsWith('[!TIP]')) {
            calloutType = 'tip';
          } else if (cLine.startsWith('[!IMPORTANT]')) {
            calloutType = 'important';
          } else if (cLine.startsWith('[!WARNING]')) {
            calloutType = 'warning';
          } else {
            calloutLines.push(cLine);
          }
          i++;
        }

        const calloutText = calloutLines.join(' ');
        let icon = <Info size={20} className="callout-icon" />;
        let calloutClass = 'callout-info';

        if (calloutType === 'tip') {
          icon = <Lightbulb size={20} className="callout-icon" />;
          calloutClass = 'callout-tip';
        } else if (calloutType === 'important') {
          icon = <Sparkles size={20} className="callout-icon" />;
          calloutClass = 'callout-important';
        } else if (calloutType === 'warning') {
          icon = <ShieldAlert size={20} className="callout-icon" />;
          calloutClass = 'callout-warning';
        }

        elements.push(
          <div key={`callout-${i}`} className={`callout ${calloutClass}`}>
            <div className="callout-header">
              {icon}
              <span className="callout-title">{calloutType.toUpperCase()}</span>
            </div>
            <div 
              className="callout-body"
              dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(calloutText) }}
            />
          </div>
        );
        continue;
      }

      // Unordered Lists (- or *)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const listItems = [];
        while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
          listItems.push(lines[i].trim().replace(/^[-*]\s+/, ''));
          i++;
        }
        elements.push(
          <ul key={`ul-${i}`} className="prose-ul">
            {listItems.map((item, lIdx) => (
              <li key={lIdx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
            ))}
          </ul>
        );
        continue;
      }

      // Ordered Lists (1. 2.)
      if (/^\d+\.\s+/.test(trimmed)) {
        const listItems = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
          i++;
        }
        elements.push(
          <ol key={`ol-${i}`} className="prose-ol">
            {listItems.map((item, lIdx) => (
              <li key={lIdx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
            ))}
          </ol>
        );
        continue;
      }

      // Code Block (Fenced)
      if (trimmed.startsWith('```')) {
        i++;
        const codeLines = [];
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing ```
        elements.push(
          <div key={`code-${i}`} className="code-block">
            <pre>{codeLines.join('\n')}</pre>
          </div>
        );
        continue;
      }

      // Normal Paragraph
      elements.push(
        <p key={`p-${i}`} className="prose-p" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }} />
      );
      i++;
    }

    return elements;
  };

  return (
    <main className="summary-viewer">
      {displayModules.map((module) => (
        <article key={module.id} className="content-card">
          <div className="card-header">
            <div className="card-header-left">
              <span className="module-badge">MODULE {module.moduleNumber}</span>
              <h2 className="card-title">{module.title}</h2>
            </div>
            <span className="page-ref-badge">{module.pageRef}</span>
          </div>

          <div className="callout callout-info" style={{ marginBottom: '24px' }}>
            <div className="callout-header">
              <Info size={18} />
              <span className="callout-title">สรุปภาพรวมโมดูล</span>
            </div>
            <div className="callout-body">
              <strong>สาระสำคัญ:</strong> {module.summary}
            </div>
          </div>

          {module.objectives && module.objectives.length > 0 && (
            <div className="module-objectives-box" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#4f46e5', fontWeight: '700', fontSize: '14px' }}>
                <CheckCircle2 size={18} />
                <span>วัตถุประสงค์เชิงพฤติกรรมประจำโมดูล:</span>
              </div>
              <ul style={{ paddingLeft: '20px', fontSize: '13.5px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {module.objectives.map((obj, oIdx) => (
                  <li key={oIdx}><strong>{obj.code}:</strong> {obj.text}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="prose">
            {renderMarkdown(module.content)}
          </div>
        </article>
      ))}

      {displayModules.length === 0 && (
        <div className="content-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <AlertTriangle size={48} color="#f59e0b" style={{ margin: '0 auto 16px auto' }} />
          <h3>ไม่พบข้อมูลที่ตรงกับคำค้นหา "{searchQuery}"</h3>
          <p style={{ color: '#64748b', marginTop: '8px' }}>ลองเปลี่ยนคำค้นหา หรือกดปุ่มรีเซ็ตการค้นหาที่แถบด้านบน</p>
        </div>
      )}
    </main>
  );
}
