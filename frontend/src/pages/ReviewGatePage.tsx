import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, FileText, Clock, UserCheck, Search } from 'lucide-react';
import { fetchReviewDrafts, approveReviewDraft, rejectReviewDraft, getUserRole } from '../services/api';
import { ReviewDraft } from '../types';

export const ReviewGatePage: React.FC = () => {
  const [drafts, setDrafts] = useState<ReviewDraft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<ReviewDraft | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const currentRole = getUserRole();

  const loadDrafts = async () => {
    try {
      setLoading(true);
      const data = await fetchReviewDrafts(filterStatus === 'all' ? undefined : filterStatus);
      setDrafts(data);
      if (data.length > 0 && (!selectedDraft || !data.find(d => d.review_id === selectedDraft.review_id))) {
        setSelectedDraft(data[0]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load review drafts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, [filterStatus]);

  const handleApprove = async () => {
    if (!selectedDraft) return;
    try {
      setLoading(true);
      const updated = await approveReviewDraft(selectedDraft.review_id, comment);
      setSelectedDraft(updated);
      setComment('');
      loadDrafts();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDraft) return;
    try {
      setLoading(true);
      const updated = await rejectReviewDraft(selectedDraft.review_id, comment);
      setSelectedDraft(updated);
      setComment('');
      loadDrafts();
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Hero Banner */}
      <div className="hero-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <ShieldCheck size={28} color="var(--accent-emerald)" />
          <h2 className="hero-title">Human Approval Gate (Requirement 2)</h2>
        </div>
        <p className="hero-desc">
          Enforces mandatory human verification lifecycle: <code>draft → pending_review → approved/rejected</code> for all generated reports, spreadsheets, slide decks, and code snippets. Automatically flags <code>mandatory_review=true</code> whenever low-confidence OCR or vision outputs are detected.
        </p>
      </div>

      {/* Main Split Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', minHeight: '520px' }}>
        
        {/* Left Column: Drafts List */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1rem', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>GENERATED DRAFTS</span>
            <span className="badge badge-secure" style={{ fontSize: '10px' }}>{drafts.length} QUEUED</span>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {['all', 'pending_review', 'approved', 'rejected'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`btn-outline ${filterStatus === st ? 'active' : ''}`}
                style={{
                  fontSize: '10px',
                  padding: '3px 8px',
                  textTransform: 'uppercase',
                  background: filterStatus === st ? 'var(--accent-cyan)' : 'transparent',
                  color: filterStatus === st ? '#000' : 'var(--text-secondary)'
                }}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* List items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', maxHeight: '480px' }}>
            {drafts.length === 0 && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '1rem', textAlign: 'center' }}>
                No drafts found for status '{filterStatus}'.
              </div>
            )}
            {drafts.map(d => {
              const isSelected = selectedDraft?.review_id === d.review_id;
              const isPending = d.status === 'pending_review';
              return (
                <div
                  key={d.review_id}
                  onClick={() => setSelectedDraft(d)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                    background: isSelected ? 'rgba(0, 229, 255, 0.06)' : 'var(--bg-panel-elevated)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {d.deliverable_type.toUpperCase()}
                    </span>
                    <span className={`badge ${d.status === 'approved' ? 'badge-secure' : d.status === 'rejected' ? 'badge-fault' : 'badge-warning'}`} style={{ fontSize: '9px' }}>
                      {d.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {d.title}
                  </div>

                  {d.mandatory_review && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--accent-amber)', fontWeight: 700 }}>
                      <AlertTriangle size={11} /> MANDATORY REVIEW (LOW CONFIDENCE)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Draft Inspection & Approval Action Pane */}
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!selectedDraft ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
              Select a draft from the queue to inspect reasoning trace and approve/reject.
            </div>
          ) : (
            <>
              {/* Top Detail Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedDraft.title}</h3>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Job ID: <code>{selectedDraft.job_id}</code> | Created: {selectedDraft.created_at.substring(0, 19).replace('T', ' ')}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {selectedDraft.mandatory_review && (
                    <span className="badge badge-warning" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={12} /> MANDATORY REVIEW
                    </span>
                  )}
                  <span className={`badge ${selectedDraft.status === 'approved' ? 'badge-secure' : selectedDraft.status === 'rejected' ? 'badge-fault' : 'badge-warning'}`} style={{ fontSize: '11px' }}>
                    STATUS: {selectedDraft.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Draft Content Preview */}
              <div>
                <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} /> GENERATED DELIVERABLE CONTENT ({selectedDraft.deliverable_type.toUpperCase()})
                </div>
                <div style={{
                  background: '#040711',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '1rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontFamily: selectedDraft.deliverable_type === 'code' ? 'var(--font-mono)' : 'inherit'
                }}>
                  {typeof selectedDraft.content === 'object' ? JSON.stringify(selectedDraft.content, null, 2) : String(selectedDraft.content)}
                </div>
              </div>

              {/* Reasoning Trace Section */}
              <div>
                <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} /> AGENT REASONING TRACE & AUDIT PROVENANCE
                </div>
                <div style={{
                  background: '#040711',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  maxHeight: '180px',
                  overflowY: 'auto'
                }}>
                  {selectedDraft.reasoning_trace?.map((step: any, idx: number) => (
                    <div key={idx} style={{ fontSize: '0.78rem', borderBottom: '1px solid #101c38', paddingBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>Step {step.step}: </span>
                      <span style={{ color: 'var(--text-primary)' }}>{step.thought}</span>
                      {step.action && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--accent-teal)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                          Action: <code>{step.action}</code> ({JSON.stringify(step.action_input)})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Approval Action Form */}
              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    ACTIVE REVIEWER ROLE: <strong style={{ color: 'var(--accent-amber)' }}>{currentRole.toUpperCase()}</strong>
                  </span>
                  {selectedDraft.reviewed_at && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Reviewed by {selectedDraft.reviewer_role} at {selectedDraft.reviewed_at.substring(0, 19).replace('T', ' ')}
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Optional review comment or justification..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#050a16',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem'
                  }}
                />

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={handleApprove}
                    disabled={loading || selectedDraft.status === 'approved'}
                    className="btn-primary"
                    style={{ flex: 1, background: 'var(--accent-emerald)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <CheckCircle2 size={16} />
                    <span>APPROVE DELIVERABLE</span>
                  </button>

                  <button
                    onClick={handleReject}
                    disabled={loading || selectedDraft.status === 'rejected'}
                    className="btn-outline"
                    style={{ flex: 1, borderColor: 'var(--accent-rose)', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <XCircle size={16} />
                    <span>REJECT DRAFT</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
