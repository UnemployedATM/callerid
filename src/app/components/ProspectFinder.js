'use client';

import { useState } from 'react';

const TIER = 'free'; // change to 'pro' or 'agency' when auth/billing is wired up

function blur(value, locked) {
  if (!locked) return value || '—';
  return <span className="prospect-blur">{value || 'Hidden'}</span>;
}

function ScoreBadge({ score, locked }) {
  if (locked) return <span className="prospect-score prospect-blur">—</span>;
  const cls =
    score >= 7 ? 'prospect-score score-high' : score >= 4 ? 'prospect-score score-mid' : 'prospect-score score-low';
  return <span className={cls}>{score}/10</span>;
}

function ProspectCard({ prospect, tier }) {
  const isFree = tier === 'free';
  const isPro = tier === 'pro';
  const isAgency = tier === 'agency';

  const lockBasic = isFree;          // free locks everything
  const lockPhone = isFree || isPro; // phone locked on free + pro

  return (
    <div className="prospect-card">
      <div className="prospect-card-header">
        <div className="prospect-identity">
          <span className="prospect-name">{blur(prospect.name, lockBasic)}</span>
          <span className="prospect-title">{blur(prospect.title, lockBasic)}</span>
        </div>
        <ScoreBadge score={prospect.fitScore} locked={lockBasic} />
      </div>

      <div className="prospect-company">
        <span className="prospect-company-name">{blur(prospect.company, lockBasic)}</span>
        {isAgency && prospect.industry && (
          <span className="prospect-tag">{prospect.industry}</span>
        )}
      </div>

      <div className="prospect-contacts">
        <div className="prospect-contact-row">
          <span className="prospect-label">Email</span>
          <span>{blur(prospect.email, lockBasic)}</span>
        </div>
        <div className="prospect-contact-row">
          <span className="prospect-label">Phone</span>
          <span>{blur(prospect.phone, lockPhone)}</span>
        </div>
        {isAgency && (
          <>
            <div className="prospect-contact-row">
              <span className="prospect-label">LinkedIn</span>
              {prospect.linkedin
                ? <a href={prospect.linkedin} target="_blank" rel="noopener noreferrer" className="prospect-link">View</a>
                : <span>—</span>}
            </div>
            <div className="prospect-contact-row">
              <span className="prospect-label">Location</span>
              <span>{prospect.location || '—'}</span>
            </div>
          </>
        )}
      </div>

      {isAgency && (
        <div className="prospect-enrichment">
          <div className="prospect-contact-row">
            <span className="prospect-label">Headcount</span>
            <span>{prospect.headcount ? `~${prospect.headcount}` : '—'}</span>
          </div>
          <div className="prospect-contact-row">
            <span className="prospect-label">Revenue</span>
            <span>{prospect.revenue || '—'}</span>
          </div>
          <div className="prospect-contact-row">
            <span className="prospect-label">Funding</span>
            <span>{prospect.funding || '—'}</span>
          </div>
          {prospect.techStack?.length > 0 && (
            <div className="prospect-tags-row">
              <span className="prospect-label">Tech</span>
              <div className="prospect-tags">
                {prospect.techStack.slice(0, 5).map((t) => (
                  <span key={t} className="prospect-tag">{t}</span>
                ))}
              </div>
            </div>
          )}
          {prospect.investors?.length > 0 && (
            <div className="prospect-contact-row">
              <span className="prospect-label">Investors</span>
              <span>{prospect.investors.slice(0, 2).join(', ')}</span>
            </div>
          )}
        </div>
      )}

      <div className="prospect-reason">
        {lockBasic
          ? <span className="prospect-blur">Upgrade to see AI analysis</span>
          : <span>{prospect.fitReason}</span>}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="prospect-card prospect-skeleton">
      <div className="skeleton-line skeleton-wide" />
      <div className="skeleton-line skeleton-medium" />
      <div className="skeleton-line skeleton-narrow" />
    </div>
  );
}

export default function ProspectFinder() {
  const [query, setQuery] = useState('');
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setProspects([]);
    setSearched(true);

    try {
      const res = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, tier: TIER }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Search failed');
      setProspects(data.prospects ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="prospect-finder">
      <div className="prospect-header">
        <span className="prospect-title-main">B-ID</span>
        <span className="prospect-tier-badge">{TIER.toUpperCase()}</span>
      </div>

      <p className="prospect-subtitle">Find and qualify prospects with AI</p>

      <form className="prospect-form" onSubmit={handleSearch}>
        <input
          className="prospect-input"
          type="text"
          placeholder='e.g. "web design agencies NYC"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="prospect-btn" type="submit" disabled={loading}>
          {loading ? 'Searching…' : 'Find Prospects'}
        </button>
      </form>

      {error && <p className="prospect-error">{error}</p>}

      <div className="prospect-results">
        {loading && [0, 1, 2].map((i) => <SkeletonCard key={i} />)}

        {!loading && searched && prospects.length === 0 && !error && (
          <p className="prospect-empty">No prospects found. Try a different search.</p>
        )}

        {!loading && prospects.map((p, i) => (
          <ProspectCard key={i} prospect={p} tier={TIER} />
        ))}
      </div>

      {TIER === 'free' && prospects.length > 0 && (
        <div className="prospect-upgrade">
          <p>Unlock names, emails & AI scores — upgrade to Pro</p>
          <button className="prospect-upgrade-btn">Upgrade Plan</button>
        </div>
      )}
    </div>
  );
}
