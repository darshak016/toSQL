import React from 'react';
import { highlightSql } from '../utils/sqlHighlighter';

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
