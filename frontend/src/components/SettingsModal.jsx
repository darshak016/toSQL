import React, { useState, useEffect } from 'react';
import { Key01, Check, XClose } from './Icons';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  settings, 
  onSaveSettings 
}) {
  const [provider, setProvider] = useState(settings.provider || 'gemini');
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [modelName, setModelName] = useState(settings.modelName || 'gemini-2.5-flash');

  useEffect(() => {
    setProvider(settings.provider || 'gemini');
    setApiKey(settings.apiKey || '');
    setModelName(settings.modelName || (settings.provider === 'openai' ? 'gpt-4o-mini' : 'gemini-2.5-flash'));
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleProviderChange = (p) => {
    setProvider(p);
    setModelName(p === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings({ provider, apiKey: apiKey.trim(), modelName: modelName.trim() });
    onClose();
  };

  return (
    <div className="untitledui-modal-backdrop" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--cohere-hairline)',
          boxShadow: 'var(--shadow-console)',
          width: '100%',
          maxWidth: '460px',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--cohere-hairline)',
          backgroundColor: 'var(--cohere-soft-stone)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2rem',
              height: '2rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--cohere-primary)',
              color: '#ffffff',
            }}>
              <Key01 style={{ width: '1rem', height: '1rem' }} />
            </div>
            <div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--cohere-ink)',
              }}>
                AI Model &amp; API Key Settings
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--cohere-muted)' }}>
                Configure synthesis credentials stored in browser localStorage
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '1.75rem',
              height: '1.75rem',
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--cohere-muted)',
              cursor: 'pointer',
            }}
          >
            <XClose style={{ width: '1rem', height: '1rem' }} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          {/* Provider Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--cohere-ink)',
              textTransform: 'uppercase',
            }}>
              LLM Provider
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {[
                { id: 'gemini', label: 'Google Gemini' },
                { id: 'openai', label: 'OpenAI GPT' },
              ].map(p => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handleProviderChange(p.id)}
                  style={{
                    padding: '0.625rem',
                    borderRadius: 'var(--radius-sm)',
                    border: provider === p.id ? '2px solid var(--cohere-primary)' : '1px solid var(--cohere-hairline)',
                    backgroundColor: provider === p.id ? 'var(--cohere-soft-stone)' : '#ffffff',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--cohere-ink)',
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Model Name Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--cohere-ink)',
              textTransform: 'uppercase',
            }}>
              Model Identifier
            </label>
            <input
              type="text"
              value={modelName}
              onChange={e => setModelName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--cohere-hairline)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--cohere-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--cohere-hairline)'}
            />
          </div>

          {/* API Key Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--cohere-ink)',
              textTransform: 'uppercase',
            }}>
              API Secret Key
            </label>
            <input
              type="password"
              placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--cohere-hairline)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--cohere-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--cohere-hairline)'}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--cohere-muted)' }}>
              Leave blank to run in mock simulation fallback mode without consuming credits.
            </span>
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '0.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--cohere-hairline)',
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-cohere-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-cohere-primary"
            >
              <Check style={{ width: '0.85rem', height: '0.85rem' }} />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
