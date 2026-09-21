import React from 'react';
import type { DbInfo } from '../types';
import { 
  Database01, 
  Settings01, 
  RefreshCw01, 
  Key01, 
  Check,
  Clock,
  Share04,
  BookOpen,
  Sun,
  Moon,
} from './Icons';

interface NavbarProps {
  dbInfo: DbInfo | null;
  onOpenConnect: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  onOpenDictionary?: () => void;
  dictionaryCount?: number;
  onRefreshSchema: () => void;
  isRefreshing: boolean;
  apiKeyConfigured: boolean;
  onOpenErd?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function Navbar({ 
  dbInfo, 
  onOpenConnect, 
  onOpenSettings, 
  onOpenHistory,
  historyCount,
  onOpenDictionary,
  dictionaryCount = 0,
  onRefreshSchema,
  isRefreshing,
  apiKeyConfigured,
  onOpenErd,
  theme = 'light',
  onToggleTheme,
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
          {/* Geometric Cohere-style symbol matching favicon.svg */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '1.95rem',
            width: '1.95rem',
            borderRadius: '6px',
            backgroundColor: 'var(--cohere-primary)',
            color: 'var(--cohere-canvas)',
            boxShadow: 'var(--shadow-subtle)',
            overflow: 'hidden',
            border: '1px solid var(--cohere-hairline)',
            flexShrink: 0,
          }}>
            {/* Coral Accent Line matching favicon */}
            <div style={{
              position: 'absolute',
              top: '2px',
              left: '3px',
              right: '3px',
              height: '2px',
              borderRadius: '1px',
              backgroundColor: 'var(--cohere-coral)',
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '-0.06em',
              paddingTop: '2px',
            }}>
              to_
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.15rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'var(--cohere-ink)',
            }}>
              toSQL
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              fontWeight: 600,
              color: 'var(--cohere-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
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
          title={dbInfo ? "Click to switch database connection" : "Click to connect database"}
        >
          <Database01 style={{ width: '0.85rem', height: '0.85rem', color: dbInfo ? 'var(--cohere-deep-green)' : 'var(--cohere-muted)' }} />
          {dbInfo ? (
            <>
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
            </>
          ) : (
            <>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--cohere-muted)' }}>No DB</span>
              <span style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                backgroundColor: 'var(--cohere-coral)',
                color: 'var(--cohere-canvas)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-xs)',
                fontWeight: 600,
                marginLeft: '4px',
              }}>
                Connect
              </span>
            </>
          )}
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
          border: '1px solid var(--cohere-hairline)',
          backgroundColor: 'var(--cohere-pale-green)',
          fontSize: '12px',
          fontWeight: 500,
          color: 'var(--cohere-deep-green)',
        }}>
          <Check style={{ width: '0.85rem', height: '0.85rem', color: 'var(--cohere-deep-green)', strokeWidth: 2.5 }} />
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
            borderColor: apiKeyConfigured ? 'var(--cohere-hairline)' : 'var(--cohere-hairline)',
            backgroundColor: apiKeyConfigured ? 'var(--cohere-pale-green)' : 'transparent',
            color: apiKeyConfigured ? 'var(--cohere-deep-green)' : 'var(--cohere-ink)',
          }}
        >
          <Key01 style={{ width: '0.8rem', height: '0.8rem' }} />
          <span>{apiKeyConfigured ? 'Gemini 2.5 Flash' : 'Demo Mode (Mock AI)'}</span>
        </button>

        {/* Schema ERD Button */}
        {onOpenErd && (
          <button
            onClick={onOpenErd}
            className="btn-cohere-pill-outline"
            style={{
              fontSize: '12px',
              padding: '5px 12px',
              color: 'var(--cohere-ink)',
            }}
            title="Open Entity Relationship Diagram (ERD)"
          >
            <Share04 style={{ width: '0.8rem', height: '0.8rem', color: 'var(--cohere-primary)' }} />
            <span>Schema ERD</span>
          </button>
        )}

        {/* Semantic Dictionary & Few-Shots Button */}
        {onOpenDictionary && (
          <button
            onClick={onOpenDictionary}
            className="btn-cohere-pill-outline"
            style={{
              fontSize: '12px',
              padding: '5px 12px',
              color: 'var(--cohere-ink)',
            }}
            title="Open Semantic Dictionary & Few-Shot Rules"
          >
            <BookOpen style={{ width: '0.8rem', height: '0.8rem', color: 'var(--cohere-primary)' }} />
            <span>Dictionary</span>
            {dictionaryCount > 0 && (
              <span style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                backgroundColor: 'var(--cohere-primary)',
                color: 'var(--cohere-canvas)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                marginLeft: '2px',
              }}>
                {dictionaryCount}
              </span>
            )}
          </button>
        )}

        {/* History & Favorites Drawer Button */}

        <button
          onClick={onOpenHistory}
          className="btn-cohere-pill-outline"
          style={{
            fontSize: '12px',
            padding: '5px 12px',
            color: 'var(--cohere-ink)',
          }}
          title="Open Query History & Saved Favorites"
        >
          <Clock style={{ width: '0.8rem', height: '0.8rem', color: 'var(--cohere-primary)' }} />
          <span>History</span>
          {historyCount > 0 && (
            <span style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              backgroundColor: 'var(--cohere-primary)',
              color: 'var(--cohere-canvas)',
              padding: '1px 6px',
              borderRadius: 'var(--radius-full)',
              marginLeft: '2px',
            }}>
              {historyCount}
            </span>
          )}
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

        {/* Theme Toggle Button (Light/Dark) */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="btn-cohere-pill-outline"
            style={{
              padding: '6px 10px',
              cursor: 'pointer',
              color: 'var(--cohere-ink)',
            }}
            title={theme === 'dark' ? 'Switch to Cohere Warm Light' : 'Switch to Enterprise Command Center Dark'}
          >
            {theme === 'dark' ? (
              <Sun style={{ width: '0.85rem', height: '0.85rem', color: '#ffb300' }} />
            ) : (
              <Moon style={{ width: '0.85rem', height: '0.85rem', color: 'var(--cohere-ink)' }} />
            )}
          </button>
        )}

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
