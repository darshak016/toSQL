import React, { useState } from 'react';
import { BarChart03, BarLineChart, PieChart01 } from './Icons';

// Cohere 2026 Curated Color Palette for Visualizations
const COHERE_CHART_PALETTE = [
  '#003c33', // Deep Enterprise Green
  '#1863dc', // Action Blue
  '#ff7759', // Coral
  '#17171c', // Near-Black
  '#071829', // Dark Navy
  '#75758a', // Slate
  '#00875a', // Emerald
  '#9b60aa', // Accent Violet
];

export default function Visualizer({ 
  columns = [], 
  rows = [], 
  suggestedChart = 'bar',
  chartConfig = {} 
}) {
  const [chartType, setChartType] = useState(suggestedChart || 'bar');

  if (!columns.length || !rows.length) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--cohere-muted)',
      }}>
        No data available for visualization. Run a query first.
      </div>
    );
  }

  // Determine x (categorical) and y (numeric) columns
  let xIdx = 0;
  let yIdx = 1;

  if (chartConfig?.x_axis && columns.includes(chartConfig.x_axis)) {
    xIdx = columns.indexOf(chartConfig.x_axis);
  }
  if (chartConfig?.y_axis && columns.includes(chartConfig.y_axis)) {
    yIdx = columns.indexOf(chartConfig.y_axis);
  } else {
    // Auto-detect first numeric column
    const foundNumIdx = columns.findIndex((_, idx) => 
      idx !== xIdx && rows.some(r => typeof r[idx] === 'number')
    );
    if (foundNumIdx !== -1) yIdx = foundNumIdx;
  }

  // Format dataset (up to 10 items for crisp Cohere display)
  const dataset = rows.slice(0, 10).map(row => ({
    label: String(row[xIdx] ?? 'N/A'),
    value: typeof row[yIdx] === 'number' ? row[yIdx] : parseFloat(row[yIdx]) || 0
  }));

  const maxValue = Math.max(...dataset.map(d => d.value), 1);
  const totalValue = dataset.reduce((acc, d) => acc + (d.value > 0 ? d.value : 0), 0) || 1;
  const chartTitle = chartConfig?.title || `${columns[yIdx] || 'Metric'} by ${columns[xIdx] || 'Dimension'}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '1.25rem' }}>
      {/* Header & Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        borderBottom: '1px solid var(--cohere-hairline)',
        paddingBottom: '0.875rem',
        marginBottom: '1.25rem',
      }}>
        <div>
          <h4 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.95rem',
            fontWeight: 600,
            color: 'var(--cohere-ink)',
            marginBottom: '0.2rem',
          }}>
            {chartTitle}
          </h4>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--cohere-muted)',
          }}>
            <span>X: <strong style={{ color: 'var(--cohere-ink)' }}>{columns[xIdx]}</strong></span>
            <span>•</span>
            <span>Y: <strong style={{ color: 'var(--cohere-deep-green)' }}>{columns[yIdx]}</strong></span>
          </div>
        </div>

        {/* Chart Switcher Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--cohere-soft-stone)',
          border: '1px solid var(--cohere-hairline)',
        }}>
          {[
            { id: 'bar', icon: <BarChart03 style={{ width: '0.8rem', height: '0.8rem' }} />, label: 'Bar' },
            { id: 'line', icon: <BarLineChart style={{ width: '0.8rem', height: '0.8rem' }} />, label: 'Line' },
            { id: 'pie', icon: <PieChart01 style={{ width: '0.8rem', height: '0.8rem' }} />, label: 'Donut' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setChartType(btn.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '4px 10px',
                borderRadius: 'var(--radius-xl)',
                border: 'none',
                backgroundColor: chartType === btn.id ? '#ffffff' : 'transparent',
                color: chartType === btn.id ? 'var(--cohere-primary)' : 'var(--cohere-muted)',
                boxShadow: chartType === btn.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {btn.icon}
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Render Chart Mode */}
      {chartType === 'bar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {dataset.map((d, idx) => {
            const pct = Math.max(2, Math.round((d.value / maxValue) * 100));
            const color = COHERE_CHART_PALETTE[idx % COHERE_CHART_PALETTE.length];
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, color: 'var(--cohere-ink)' }}>
                    {d.label}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--cohere-primary)' }}>
                    {d.value.toLocaleString()}
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  width: '100%',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--cohere-soft-stone)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: color,
                    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {chartType === 'line' && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '1rem',
          height: '180px',
          padding: '1rem 0.5rem 0.5rem',
          borderBottom: '1px solid var(--cohere-hairline)',
        }}>
          {dataset.map((d, idx) => {
            const pct = Math.max(6, Math.round((d.value / maxValue) * 100));
            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.35rem',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--cohere-muted)' }}>
                  {d.value > 999 ? `${(d.value / 1000).toFixed(1)}k` : d.value}
                </span>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '24px',
                    height: `${pct}%`,
                    borderRadius: '4px 4px 0 0',
                    backgroundColor: 'var(--cohere-deep-green)',
                    transition: 'height 0.4s ease',
                  }}
                />
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.65rem',
                  color: 'var(--cohere-ink)',
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '50px',
                }}>
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {chartType === 'pie' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'center',
        }}>
          {dataset.map((d, idx) => {
            const share = Math.round((d.value / totalValue) * 100);
            const color = COHERE_CHART_PALETTE[idx % COHERE_CHART_PALETTE.length];
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--cohere-soft-stone)',
                  border: '1px solid var(--cohere-hairline)',
                }}
              >
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'var(--cohere-ink)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {d.label}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: 'var(--cohere-muted)',
                  }}>
                    {d.value.toLocaleString()} ({share}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
