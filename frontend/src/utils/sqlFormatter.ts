/**
 * Lightweight, robust SQL Formatter that indents clauses,
 * uppercases standard SQL keywords, and formats subqueries/joins cleanly.
 */

const MAJOR_KEYWORDS = [
  'SELECT',
  'FROM',
  'WHERE',
  'GROUP BY',
  'HAVING',
  'ORDER BY',
  'LIMIT',
  'OFFSET',
  'UNION ALL',
  'UNION',
  'INTERSECT',
  'EXCEPT',
  'INSERT INTO',
  'VALUES',
  'UPDATE',
  'SET',
  'DELETE FROM',
  'CREATE TABLE',
  'ALTER TABLE',
  'DROP TABLE',
  'WITH'
];

const JOIN_KEYWORDS = [
  'LEFT JOIN',
  'RIGHT JOIN',
  'INNER JOIN',
  'FULL OUTER JOIN',
  'CROSS JOIN',
  'JOIN'
];

const SECONDARY_KEYWORDS = [
  'AND',
  'OR',
  'ON',
  'AS',
  'IN',
  'IS',
  'NOT',
  'NULL',
  'BETWEEN',
  'LIKE',
  'ILIKE',
  'ASC',
  'DESC',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'DISTINCT',
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'ROUND',
  'COALESCE'
];

export function formatSql(sql: string): string {
  if (!sql || !sql.trim()) return '';

  // 1. Normalize line endings and multiple spaces
  let cleaned = sql
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  // Protect string literals and inline comments
  const stringLiterals: string[] = [];
  cleaned = cleaned.replace(/('(?:''|[^'])*')/g, (match) => {
    stringLiterals.push(match);
    return `___STR_${stringLiterals.length - 1}___`;
  });

  // Uppercase major clauses and keywords
  const allKeywords = [...MAJOR_KEYWORDS, ...JOIN_KEYWORDS, ...SECONDARY_KEYWORDS];
  for (const kw of allKeywords) {
    const regex = new RegExp(`\\b${kw.replace(/ /g, '\\s+')}\\b`, 'gi');
    cleaned = cleaned.replace(regex, kw.toUpperCase());
  }

  // Tokenize by spaces and parenthesis
  // Split query into major sections
  for (const kw of MAJOR_KEYWORDS) {
    const regex = new RegExp(`\\s+${kw}\\b`, 'g');
    cleaned = cleaned.replace(regex, `\n${kw}`);
  }

  for (const kw of JOIN_KEYWORDS) {
    const regex = new RegExp(`\\s+${kw}\\b`, 'g');
    cleaned = cleaned.replace(regex, `\n  ${kw}`);
  }

  // Clean lines and indent
  const lines = cleaned.split('\n');
  const formattedLines: string[] = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    const isMajor = MAJOR_KEYWORDS.some(kw => line.toUpperCase().startsWith(kw));
    const isJoin = JOIN_KEYWORDS.some(kw => line.toUpperCase().startsWith(kw));

    if (isMajor) {
      formattedLines.push(line);
    } else if (isJoin) {
      formattedLines.push('  ' + line);
    } else if (line.toUpperCase().startsWith('AND ') || line.toUpperCase().startsWith('OR ')) {
      formattedLines.push('  ' + line);
    } else {
      formattedLines.push('  ' + line);
    }
  }

  let result = formattedLines.join('\n');

  // Restore string literals
  result = result.replace(/___STR_(\d+)___/g, (_, idx) => {
    return stringLiterals[Number(idx)] || '';
  });

  return result;
}
