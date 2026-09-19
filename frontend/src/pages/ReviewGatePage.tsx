import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, FileText, Clock, UserCheck, Search, Filter } from 'lucide-react';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header Strip */}
      <div className="page-header-strip">
        <div>
          <h1 className="page-title">
            <ShieldCheck size={22} color="var(--accent-emerald)" />
            Approval Gate
          </h1>
          <p className="page-subtitle">
            Human-in-the-loop review for low-confidence outputs, sensitive deliverables, and formal sign-offs.
          </p>
        </div>

        <div className="status-badge nominal" style={{ padding: '6px 14px' }}>
          <span>Active Reviewer Role: {currentRole.toUpperCase()}</span>
        </div>
      </div>

      {/* Main Split Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', minHeight: '520px' }}>
        
        {/* Left Column: Drafts Queue List */}
        <div className="instrument-card" style={{ display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Review Queue</span>
            <span className="status-badge nominal" style={{ fontSize: '11px' }}>{drafts.length} Item(s)</span>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {['all', 'pending_review', 'approved', 'rejected'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className="btn-outline"
                style={{
                  fontSize: '11px',
                  padding: '4px 8px',
                  background: filterStatus === st ? 'var(--accent-blue)' : 'transparent',
                  color: filterStatus === st ? '#fff' : 'var(--text-secondary)',
                  borderColor: filterStatus === st ? 'var(--accent-blue)' : 'var(--border-subtle)'
                }}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* List items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '480px' }}>
            {drafts.length === 0 && (
              <div className="standby-row">
                <span className="idle-dot" />
                <span style={{ color: 'var(--text-secondary)' }}>No drafts awaiting review</span>
              </div>
            )}
            {drafts.map(d => {
              const isSelected = selectedDraft?.review_id === d.review_id;
              return (
                <div
                  key={d.review_id}
                  onClick={() => setSelectedDraft(d)}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                    background: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-panel-elevated)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {d.deliverable_type.toUpperCase()}
                    </span>
                    <span className={`status-badge ${d.status === 'approved' ? 'nominal' : d.status === 'rejected' ? 'fault' : 'attention'}`} style={{ fontSize: '10px' }}>
                      {d.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {d.title}
                  </div>

                  {d.mandatory_review && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--accent-amber)', fontWeight: 600 }}>
                      <AlertTriangle size={12} /> Mandatory Review Required
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Draft Inspection & Action Pane */}
        <div className="instrument-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!selectedDraft ? (
            <div className="standby-row" style={{ height: '100%', justifyContent: 'center' }}>
              <span className="idle-dot" />
              <span>Select an item from the review queue to inspect and approve</span>
            </div>
          ) : (
            <>
              {/* Top Detail Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedDraft.title}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Job ID: <code>{selectedDraft.job_id}</code> | Created: {selectedDraft.created_at.substring(0, 19).replace('T', ' ')}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedDraft.mandatory_review && (
                    <span className="status-badge attention" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={12} /> Mandatory Review
                    </span>
                  )}
                  <span className={`status-badge ${selectedDraft.status === 'approved' ? 'nominal' : selectedDraft.status === 'rejected' ? 'fault' : 'attention'}`} style={{ fontSize: '11px' }}>
                    Status: {selectedDraft.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Draft Content Preview */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} /> Deliverable Content Preview ({selectedDraft.deliverable_type.toUpperCase()})
                </div>
                <div style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '16px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap'
                }}>
                  {typeof selectedDraft.content === 'object' ? JSON.stringify(selectedDraft.content, null, 2) : String(selectedDraft.content)}
                </div>
              </div>

              {/* Approval Action Form */}
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  className="cmd-input"
                  placeholder="Optional reviewer notes or justification..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleApprove}
                    disabled={loading || selectedDraft.status === 'approved'}
                    className="btn-teal"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Approve Deliverable</span>
                  </button>

                  <button
                    onClick={handleReject}
                    disabled={loading || selectedDraft.status === 'rejected'}
                    className="btn-outline"
                    style={{ flex: 1, justifyContent: 'center', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}
                  >
                    <XCircle size={16} />
                    <span>Reject Draft</span>
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
