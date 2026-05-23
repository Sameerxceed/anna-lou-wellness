/**
 * QuickEditCard — single card in the Quick Edit dashboard.
 *
 * Anatomy:
 *
 *   ┌──────────────────────────────────┐
 *   │ Label                            │ ← clickable main area
 *   │ Description                      │   (goes to the edit view)
 *   │ [Categories] [Articles]          │ ← optional sub-link chips
 *   │ ▸ Show contents                  │ ← optional expand toggle
 *   │   • Holding Everything           │   (loadChildren result —
 *   │   • The Strong One               │    renders inline like the
 *   │   • + Add new                    │    site's dropdown menu)
 *   └──────────────────────────────────┘
 *
 * The main area is the primary edit destination. Two optional extensions:
 *
 *   1. `sublinks` — small pill buttons below the description, used for
 *      jumping to filtered list views (Categories / Articles).
 *
 *   2. `loadChildren` — an async function that returns the items "under"
 *      this card (e.g. articles in a section). When provided, the card
 *      shows an expand toggle. Click to fetch and render the list inline,
 *      with each child clickable to edit. This mirrors the live site's
 *      dropdown menu pattern: click section header → see its pages.
 *
 * Card itself is a <div>, not a <button>, so child <button>s inside don't
 * violate the "no nested buttons" HTML rule.
 *
 * --- Xceed pattern ---
 * Reusable card for "click to edit X page" dashboards. Supports flat use,
 * sub-link use, or tree-style use with async children loading. Same
 * vocabulary as the live site's nav, so editors don't have to mentally
 * translate between "what visitors see" and "what I click in the CMS".
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export type Sublink = { label: string; to: string };

export type ChildItem = {
  id: string | number;
  label: string;
  to: string;
  badge?: string; // e.g. "draft", "published"
  // When true, renders as a small uppercase group divider (non-clickable),
  // so `loadChildren` can return multiple semantic groups in one list —
  // e.g. sub-pages, then upcoming events, then past events.
  groupHeader?: boolean;
};

export type LoadChildren = () => Promise<ChildItem[]>;

interface Props {
  uid: string;
  kind: 'single-types' | 'collection-types';
  label: string;
  description: string;
  colour: string;
  sublinks?: Sublink[];
  loadChildren?: LoadChildren;
  newItemTo?: string; // optional "+ Add new" target
  newItemLabel?: string; // e.g. "+ Add new article"
}

const QuickEditCard = ({
  uid,
  kind,
  label,
  description,
  colour,
  sublinks,
  loadChildren,
  newItemTo,
  newItemLabel,
}: Props) => {
  const navigate = useNavigate();
  const mainHref = `/content-manager/${kind}/${uid}`;
  const goMain = () => navigate(mainHref);

  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<ChildItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleChildren = async () => {
    if (!loadChildren) return;
    const next = !expanded;
    setExpanded(next);
    if (!next || children !== null) return;
    setLoading(true);
    setError(null);
    try {
      const items = await loadChildren();
      setChildren(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #eaeaef',
        borderLeft: `4px solid ${colour}`,
        borderRadius: 6,
        padding: '14px 16px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        transition: 'all 0.15s',
        minHeight: 76,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={goMain}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            goMain();
          }
        }}
        style={{
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#32324d',
            letterSpacing: '0.01em',
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: 12, color: '#666687', lineHeight: 1.4 }}>
          {description}
        </span>
      </div>

      {sublinks && sublinks.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginTop: 8,
          }}
        >
          {sublinks.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => navigate(s.to)}
              style={{
                cursor: 'pointer',
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 999,
                border: `1px solid ${colour}`,
                background: 'transparent',
                color: colour,
                fontWeight: 600,
                letterSpacing: '0.02em',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colour;
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = colour;
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {loadChildren && (
        <div style={{ marginTop: 10 }}>
          <button
            type="button"
            onClick={toggleChildren}
            style={{
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              color: colour,
              background: 'transparent',
              border: 'none',
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s',
              }}
            >
              ▸
            </span>
            {loading
              ? 'Loading…'
              : expanded
              ? children
                ? `${children.length} item${children.length === 1 ? '' : 's'}`
                : 'Loading…'
              : 'Show contents'}
          </button>

          {expanded && (
            <div
              style={{
                marginTop: 6,
                marginLeft: 12,
                paddingLeft: 10,
                borderLeft: `2px solid ${colour}33`,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {error && (
                <span style={{ fontSize: 11, color: '#d02b20' }}>
                  Couldn't load — use the chip above instead.
                </span>
              )}
              {!loading && !error && children && children.length === 0 && (
                <span style={{ fontSize: 12, color: '#666687', fontStyle: 'italic' }}>
                  Nothing here yet.
                </span>
              )}
              {children &&
                children.map((c) => {
                  if (c.groupHeader) {
                    return (
                      <div
                        key={c.id}
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: colour,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          padding: '8px 6px 2px',
                        }}
                      >
                        {c.label}
                      </div>
                    );
                  }
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => navigate(c.to)}
                      style={{
                        cursor: 'pointer',
                        textAlign: 'left',
                        padding: '4px 6px',
                        borderRadius: 4,
                        border: 'none',
                        background: 'transparent',
                        color: '#32324d',
                        fontSize: 12,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${colour}11`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <span style={{ color: colour }}>•</span>
                      <span style={{ flex: 1 }}>{c.label}</span>
                      {c.badge && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: '1px 6px',
                            borderRadius: 999,
                            background: '#eaeaef',
                            color: '#666687',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {c.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              {newItemTo && !loading && (
                <button
                  type="button"
                  onClick={() => navigate(newItemTo)}
                  style={{
                    cursor: 'pointer',
                    textAlign: 'left',
                    padding: '4px 6px',
                    borderRadius: 4,
                    border: 'none',
                    background: 'transparent',
                    color: colour,
                    fontSize: 12,
                    fontWeight: 600,
                    marginTop: 4,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${colour}11`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  + {newItemLabel || 'Add new'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuickEditCard;
