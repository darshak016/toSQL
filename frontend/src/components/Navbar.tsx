import React from 'react';
import type { DbInfo } from '../types';
import { 
  Database01, 
  Settings01, 
  RefreshCw01, 
  Key01, 
  Check,
} from './Icons';

interface NavbarProps {
  dbInfo: DbInfo | null;
  onOpenConnect: () => void;
  onOpenSettings: () => void;
  onRefreshSchema: () => void;
  isRefreshing: boolean;
  apiKeyConfigured: boolean;
}

export default function Navbar({ 
  dbInfo, 
  onOpenConnect, 
  onOpenSettings, 
  onRefreshSchema,
  isRefreshing,
  apiKeyConfigured
}: NavbarProps) {
  const dbType = dbInfo?.database_type?.toUpperCase() || 'SQLITE';
  const tableCount = dbInfo?.table_count || 0;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      display: 'flex',
      height: '3.5rem',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.75rem',
      backgroundColor: 'var(--cohere-canvas)',
      borderBottom: '1px solid var(--cohere-hairline)',
    }}>
      {/* Zone 1 (Left): Brand + Database Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {/* Geometric Cohere-style symbol */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '1.875rem',
            width: '1.875rem',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--cohere-primary)',
            color: '#ffffff',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '-0.05em' }}>
              to_
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'var(--cohere-black)',
            }}>
              toSQL
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: 'var(--cohere-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Command
            </span>
          </div>
        </div>

        {/* Hairline Divider */}
        <div style={{ width: 1, height: '1.25rem', backgroundColor: 'var(--cohere-hairline)' }} />

        {/* Database Switcher (Pill outline) */}
        <button
          onClick={onOpenConnect}
          className="btn-cohere-pill-outline"
          style={{
            padding: '5px 12px',
            fontSize: '12px',
            backgroundColor: 'var(--cohere-soft-stone)',
            borderColor: 'transparent',
            color: 'var(--cohere-ink)',
          }}
          title="Click to switch database connection"
        >
          <Database01 style={{ width: '0.85rem', height: '0.85rem', color: 'var(--cohere-deep-green)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{dbType}</span>
          <span style={{ color: 'var(--cohere-muted)' }}>•</span>
          <span>{tableCount} tables</span>
          <span style={{
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            backgroundColor: 'rgba(23,23,28,0.08)',
            padding: '1px 6px',
            borderRadius: 'var(--radius-xs)',
            fontWeight: 600,
            marginLeft: '4px',
          }}>
            Switch
          </span>
        </button>
      </div>

      {/* Zone 2 (Center): Verified Trust & Read-Only Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '4px 12px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid #d1fae5',
          backgroundColor: '#f0fdf4',
          fontSize: '12px',
          fontWeight: 500,
          color: 'var(--cohere-deep-green)',
        }}>
          <Check style={{ width: '0.85rem', height: '0.85rem', color: '#059669', strokeWidth: 2.5 }} />
          <span>AST Read-Only Guardrails Active</span>
        </div>
      </div>

      {/* Zone 3 (Right): AI Status, Refresh, Settings CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* AI Provider Status */}
        <button
          onClick={onOpenSettings}
          className="btn-cohere-pill-outline"
          style={{
            fontSize: '12px',
            padding: '5px 12px',
            borderColor: apiKeyConfigured ? '#bbf7d0' : 'var(--cohere-hairline)',
            backgroundColor: apiKeyConfigured ? '#f0fdf4' : 'transparent',
            color: apiKeyConfigured ? '#15803d' : 'var(--cohere-ink)',
          }}
        >
          <Key01 style={{ width: '0.8rem', height: '0.8rem' }} />
          <span>{apiKeyConfigured ? 'Gemini 2.5 Flash' : 'Demo Mode (Mock AI)'}</span>
        </button>

        {/* Refresh Schema Button */}
        <button
          onClick={onRefreshSchema}
          disabled={isRefreshing}
          aria-label="Refresh database schema"
          className="btn-cohere-pill-outline"
          style={{
            padding: '6px 10px',
            opacity: isRefreshing ? 0.5 : 1,
            cursor: isRefreshing ? 'not-allowed' : 'pointer',
          }}
          title="Refresh schema"
        >
          <RefreshCw01 style={{
            width: '0.85rem',
            height: '0.85rem',
            animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
          }} />
        </button>

        {/* Settings Pill CTA Button */}
        <button
          onClick={onOpenSettings}
          className="btn-cohere-primary"
          style={{ padding: '7px 18px', fontSize: '13px' }}
        >
          <Settings01 style={{ width: '0.85rem', height: '0.85rem' }} />
          Settings
        </button>
      </div>
    </header>
  );
}
