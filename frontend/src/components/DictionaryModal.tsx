import React, { useState, useEffect } from 'react';
import type { GlossaryTerm, FewShotExample } from '../types';
import { 
  Bookmark, 
  BookOpen, 
  Plus, 
  Trash01, 
  Check, 
  SearchLg, 
  XClose, 
  Terminal,
} from './Icons';
import { highlightSql } from './SqlCodeBlock';

interface DictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  terms: GlossaryTerm[];
  fewShots: FewShotExample[];
  onSaveTerms: (terms: GlossaryTerm[]) => void;
  onSaveFewShots: (fewShots: FewShotExample[]) => void;
  onTestPrompt?: (prompt: string) => void;
}

export default function DictionaryModal({
  isOpen,
  onClose,
  terms,
  fewShots,
  onSaveTerms,
  onSaveFewShots,
  onTestPrompt
}: DictionaryModalProps) {
  const [activeTab, setActiveTab] = useState<'glossary' | 'fewshots'>('glossary');
  const [searchQuery, setSearchQuery] = useState('');

  // New Term Form State
  const [newTerm, setNewTerm] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [termSuccessToast, setTermSuccessToast] = useState(false);

  // New Few-Shot Form State
  const [newPrompt, setNewPrompt] = useState('');
  const [newSql, setNewSql] = useState('');
  const [newExplanation, setNewExplanation] = useState('');
  const [fewShotSuccessToast, setFewShotSuccessToast] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim() || !newDefinition.trim()) return;

    const termItem: GlossaryTerm = {
      id: `term_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      term: newTerm.trim(),
      definition: newDefinition.trim(),
      category: newCategory.trim() || 'General'
    };

    onSaveTerms([...terms, termItem]);
    setNewTerm('');
    setNewDefinition('');
    setTermSuccessToast(true);
    setTimeout(() => setTermSuccessToast(false), 2000);
  };

  const handleDeleteTerm = (indexToDelete: number) => {
    onSaveTerms(terms.filter((_, idx) => idx !== indexToDelete));
  };

  const handleAddFewShot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim() || !newSql.trim()) return;

    const fewShotItem: FewShotExample = {
      id: `fs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      prompt: newPrompt.trim(),
      sql: newSql.trim(),
      explanation: newExplanation.trim() || undefined
    };

    onSaveFewShots([...fewShots, fewShotItem]);
    setNewPrompt('');
    setNewSql('');
    setNewExplanation('');
    setFewShotSuccessToast(true);
    setTimeout(() => setFewShotSuccessToast(false), 2000);
  };

  const handleDeleteFewShot = (indexToDelete: number) => {
    onSaveFewShots(fewShots.filter((_, idx) => idx !== indexToDelete));
  };

  const filteredTerms = terms.filter(t => 
    t.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredFewShots = fewShots.filter(f =>
    f.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.sql.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        padding: '1.25rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="dictionary-modal-title"
        style={{
          width: '100%',
          maxWidth: '58rem',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-modal)',
          border: '1px solid var(--cohere-hairline)',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease-out',
        }}
      >
        {/* Modal Header */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--cohere-hairline)',
            backgroundColor: 'var(--cohere-soft-stone)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div 
              style={{
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--cohere-hairline)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bookmark style={{ width: '1.1rem', height: '1.1rem', color: 'var(--cohere-primary)' }} filled />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 
                  id="dictionary-modal-title"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: 'var(--cohere-ink)',
                    lineHeight: 1.2,
                  }}
                >
                  Semantic Dictionary &amp; Few-Shot Rules
                </h3>
                <span 
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--cohere-primary)',
                    color: 'var(--cohere-canvas)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-xs)',
                  }}
                >
                  {terms.length} Terms • {fewShots.length} Few-Shots
                </span>
              </div>
              <p 
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.76rem',
                  color: 'var(--cohere-muted)',
                  marginTop: '2px',
                }}
              >
                Register business domain definitions and few-shot query reference pairs injected directly into AI prompts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dictionary modal"
            className="btn-cohere-pill-outline"
            style={{ 
              padding: '6px', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              backgroundColor: 'transparent'
            }}
            title="Close"
          >
            <XClose style={{ width: '1.1rem', height: '1.1rem', color: 'var(--cohere-slate)' }} />
          </button>
        </div>

        {/* Sub-Header Toolbar: Tabs & Search */}
        <div 
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: '0.75rem 1.75rem',
            backgroundColor: 'var(--bg-card)',
            borderBottom: '1px solid var(--cohere-hairline)',
          }}
        >
          {/* Tabs */}
          <div 
            role="tablist"
            aria-label="Dictionary sections"
            style={{
              display: 'flex',
              gap: '4px',
              backgroundColor: 'var(--cohere-soft-stone)',
              border: '1px solid var(--cohere-hairline)',
              borderRadius: 'var(--radius-xl)',
              padding: '3px',
            }}
          >
            <button
              role="tab"
              aria-selected={activeTab === 'glossary'}
              onClick={() => setActiveTab('glossary')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '4px 14px',
                borderRadius: 'var(--radius-xl)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: activeTab === 'glossary' ? 'var(--cohere-primary)' : 'transparent',
                color: activeTab === 'glossary' ? 'var(--cohere-canvas)' : 'var(--cohere-muted)',
                transition: 'all 0.15s ease',
              }}
            >
              <Bookmark style={{ width: '0.75rem', height: '0.75rem' }} />
              <span>Glossary Terms ({terms.length})</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'fewshots'}
              onClick={() => setActiveTab('fewshots')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '4px 14px',
                borderRadius: 'var(--radius-xl)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: activeTab === 'fewshots' ? 'var(--cohere-primary)' : 'transparent',
                color: activeTab === 'fewshots' ? 'var(--cohere-canvas)' : 'var(--cohere-muted)',
                transition: 'all 0.15s ease',
              }}
            >
              <BookOpen style={{ width: '0.75rem', height: '0.75rem' }} />
              <span>Few-Shot Examples ({fewShots.length})</span>
            </button>
          </div>

          {/* Search filter */}
          <div style={{ position: 'relative', width: '16rem' }}>
            <SearchLg style={{
              position: 'absolute',
              left: '0.625rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '0.8rem',
              height: '0.8rem',
              color: 'var(--cohere-muted)',
              pointerEvents: 'none',
            }} />
            <input
              type="text"
              aria-label={activeTab === 'glossary' ? 'Filter glossary terms' : 'Filter few-shot examples'}
              placeholder={activeTab === 'glossary' ? 'Filter glossary terms...' : 'Filter few-shot examples...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '1.875rem',
                paddingRight: '0.625rem',
                paddingTop: '0.35rem',
                paddingBottom: '0.35rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--cohere-hairline)',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--cohere-ink)',
                fontSize: '0.78rem',
                outline: 'none',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Main List Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', backgroundColor: 'var(--cohere-canvas)' }}>
            {activeTab === 'glossary' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredTerms.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--cohere-muted)', fontSize: '0.85rem' }}>
                    No glossary terms registered yet. Add terms on the right to teach the AI domain rules.
                  </div>
                ) : (
                  filteredTerms.map((t, idx) => (
                    <div 
                      key={t.id || idx}
                      style={{
                        padding: '1rem',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--cohere-hairline)',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: 'var(--shadow-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            color: 'var(--cohere-ink)',
                          }}>
                            "{t.term}"
                          </span>
                          {t.category && (
                            <span style={{
                              fontSize: '0.68rem',
                              fontFamily: 'var(--font-body)',
                              fontWeight: 600,
                              padding: '1px 8px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: 'var(--cohere-soft-stone)',
                              color: 'var(--cohere-slate)',
                              border: '1px solid var(--cohere-hairline)',
                            }}>
                              {t.category}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteTerm(idx)}
                          className="btn-cohere-pill-outline"
                          style={{ padding: '4px', border: 'none', color: 'var(--cohere-muted)' }}
                          title="Remove term"
                        >
                          <Trash01 style={{ width: '0.85rem', height: '0.85rem' }} />
                        </button>
                      </div>

                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.76rem',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: 'var(--cohere-soft-stone)',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--cohere-hairline)',
                        color: 'var(--cohere-ink)',
                        lineHeight: 1.5,
                      }}>
                        {t.definition}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {filteredFewShots.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--cohere-muted)', fontSize: '0.85rem' }}>
                    No few-shot query examples registered yet. Add question &amp; SQL pairs on the right.
                  </div>
                ) : (
                  filteredFewShots.map((fs, idx) => (
                    <div 
                      key={fs.id || idx}
                      style={{
                        padding: '1rem',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--cohere-hairline)',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: 'var(--shadow-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.6rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Terminal style={{ width: '0.85rem', height: '0.85rem', color: 'var(--cohere-primary)' }} />
                          <span style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            color: 'var(--cohere-ink)',
                          }}>
                            {fs.prompt}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          {onTestPrompt && (
                            <button
                              onClick={() => {
                                onTestPrompt(fs.prompt);
                                onClose();
                              }}
                              className="btn-cohere-pill-outline"
                              style={{ padding: '3px 8px', fontSize: '11px' }}
                              title="Test this prompt in the query runner"
                            >
                              Use Prompt
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteFewShot(idx)}
                            className="btn-cohere-pill-outline"
                            style={{ padding: '4px', border: 'none', color: 'var(--cohere-muted)' }}
                            title="Remove few-shot example"
                          >
                            <Trash01 style={{ width: '0.85rem', height: '0.85rem' }} />
                          </button>
                        </div>
                      </div>

                      {fs.explanation && (
                        <div style={{ fontSize: '0.76rem', color: 'var(--cohere-muted)', fontFamily: 'var(--font-body)' }}>
                          {fs.explanation}
                        </div>
                      )}

                      <div style={{
                        margin: 0,
                        padding: '0.625rem 0.85rem',
                        backgroundColor: 'var(--cohere-canvas)',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--cohere-hairline)',
                        overflowX: 'auto',
                      }}>
                        <div style={{ display: 'table', width: '100%', overflowX: 'auto' }}>
                          {highlightSql(fs.sql, true)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right Form Sidebar: Add Entry */}
          <div 
            style={{
              width: '21rem',
              backgroundColor: 'var(--bg-card)',
              borderLeft: '1px solid var(--cohere-hairline)',
              padding: '1.25rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {activeTab === 'glossary' ? (
              <form onSubmit={handleAddTerm} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <h4 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: 'var(--cohere-ink)',
                    marginBottom: '0.25rem',
                  }}>
                    Add Glossary Definition
                  </h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--cohere-muted)', lineHeight: 1.4 }}>
                    Maps business terms (e.g. "active customer") to explicit SQL filters or calculations.
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--cohere-ink)', marginBottom: '4px' }}>
                    Term or Concept
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. active customer"
                    value={newTerm}
                    onChange={e => setNewTerm(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--cohere-hairline)',
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--cohere-ink)',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-body)',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--cohere-ink)', marginBottom: '4px' }}>
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Status, Revenue, Inventory"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--cohere-hairline)',
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-body)',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--cohere-ink)', marginBottom: '4px' }}>
                    SQL Definition / Logic
                  </label>
                  <textarea
                    placeholder="e.g. orders placed in last 90 days (status = 'completed')"
                    value={newDefinition}
                    onChange={e => setNewDefinition(e.target.value)}
                    rows={4}
                    required
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--cohere-hairline)',
                      fontSize: '0.76rem',
                      fontFamily: 'var(--font-mono)',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-cohere-primary"
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Plus style={{ width: '0.8rem', height: '0.8rem' }} />
                  <span>Add Term to Dictionary</span>
                </button>

                {termSuccessToast && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.72rem',
                    color: 'var(--cohere-deep-green)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                  }}>
                    <Check style={{ width: '0.8rem', height: '0.8rem' }} />
                    <span>Term added &amp; active in prompt builder!</span>
                  </div>
                )}
              </form>
            ) : (
              <form onSubmit={handleAddFewShot} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <h4 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: 'var(--cohere-ink)',
                    marginBottom: '0.25rem',
                  }}>
                    Add Few-Shot Reference
                  </h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--cohere-muted)', lineHeight: 1.4 }}>
                    Provides golden reference SQL examples to guide LLM query generation on complex schemas.
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--cohere-ink)', marginBottom: '4px' }}>
                    User Prompt
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Show top 3 products by price"
                    value={newPrompt}
                    onChange={e => setNewPrompt(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--cohere-hairline)',
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-body)',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--cohere-ink)', marginBottom: '4px' }}>
                    Target SQL
                  </label>
                  <textarea
                    placeholder="SELECT name, price FROM products ORDER BY price DESC LIMIT 3"
                    value={newSql}
                    onChange={e => setNewSql(e.target.value)}
                    rows={4}
                    required
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--cohere-hairline)',
                      fontSize: '0.76rem',
                      fontFamily: 'var(--font-mono)',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--cohere-ink)', marginBottom: '4px' }}>
                    Explanation (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sorts products by price descending"
                    value={newExplanation}
                    onChange={e => setNewExplanation(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--cohere-hairline)',
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-body)',
                      outline: 'none',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-cohere-primary"
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Plus style={{ width: '0.8rem', height: '0.8rem' }} />
                  <span>Add Few-Shot Example</span>
                </button>

                {fewShotSuccessToast && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.72rem',
                    color: 'var(--cohere-deep-green)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                  }}>
                    <Check style={{ width: '0.8rem', height: '0.8rem' }} />
                    <span>Few-shot example saved!</span>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1.75rem',
            borderTop: '1px solid var(--cohere-hairline)',
            backgroundColor: 'var(--cohere-canvas)',
          }}
        >
          <span style={{ fontSize: '0.72rem', color: 'var(--cohere-muted)', fontFamily: 'var(--font-mono)' }}>
            Changes are saved to local workspace and injected in future prompts.
          </span>
          <button
            onClick={onClose}
            className="btn-cohere-primary"
            style={{ padding: '6px 18px', fontSize: '12px' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
