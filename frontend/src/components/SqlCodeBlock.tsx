import React from 'react';

/**
 * Splits SQL into highlighted tokens using theme variables:
 * - Keywords: var(--cohere-action-blue) with bold 700 weight
 * - Strings: var(--cohere-deep-green) with medium 500 weight
 * - Numbers: var(--cohere-coral) with semi-bold 600 weight
 * - Text/Identifiers: var(--cohere-ink)
 */
export function highlightSql(sql: string, showLineNumbers = true): React.ReactNode[] {
  if (!sql) return [];

  const tokenRegex = /('(?:''|[^'])*')|\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET|AS|ON|AND|OR|NOT|IN|IS|NULL|COUNT|SUM|AVG|MAX|MIN|DISTINCT|CASE|WHEN|THEN|ELSE|END|BETWEEN|LIKE|ILIKE|ASC|DESC|WITH|UNION|INTERSECT|EXCEPT|CREATE|DROP|INSERT|UPDATE|DELETE|ALTER|INDEX|VIEW)\b|\b(\d+(?:\.\d+)?)\b/gi;

  return sql.split('\n').map((line, idx) => {
    // Escape HTML special characters
    let html = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    html = html.replace(tokenRegex, (_match, str, kw, num) => {
      if (str !== undefined) {
        return `<span style="color:var(--cohere-deep-green);font-weight:500">${str}</span>`;
      }
      if (kw !== undefined) {
        return `<span style="color:var(--cohere-action-blue);font-weight:700">${kw.toUpperCase()}</span>`;
      }
      if (num !== undefined) {
        return `<span style="color:var(--cohere-coral);font-weight:600">${num}</span>`;
      }
      return _match;
    });

    return (
      <div key={idx} style={{ display: 'table-row' }}>
        {showLineNumbers && (
          <span style={{
            display: 'table-cell',
            paddingRight: '1.25rem',
            userSelect: 'none',
            textAlign: 'right',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'var(--cohere-muted)',
            minWidth: '2.5rem',
          }}>
            {idx + 1}
          </span>
        )}
        <span
          style={{
            display: 'table-cell',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            lineHeight: 1.7,
            color: 'var(--cohere-ink)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
          dangerouslySetInnerHTML={{ __html: html || '&nbsp;' }}
        />
      </div>
    );
  });
}

interface SqlCodeBlockProps {
  sql: string;
  showLineNumbers?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function SqlCodeBlock({ 
  sql, 
  showLineNumbers = true, 
  style, 
  className 
}: SqlCodeBlockProps) {
  if (!sql) return null;

  return (
    <div 
      className={className}
      style={{
        display: 'table',
        width: '100%',
        overflowX: 'auto',
        fontFamily: 'var(--font-mono)',
        backgroundColor: 'var(--cohere-canvas)',
        borderRadius: 'var(--radius-xs)',
        padding: '0.75rem 1rem',
        border: '1px solid var(--cohere-hairline)',
        ...style
      }}
    >
      {highlightSql(sql, showLineNumbers)}
    </div>
  );
}
