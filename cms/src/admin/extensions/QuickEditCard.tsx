/**
 * QuickEditCard — single card in the Quick Edit dashboard.
 *
 * Anatomy:
 *
 *   ┌──────────────────────────────────┐
 *   │ Label                            │ ← clickable main area
 *   │ Description                      │   (goes to the edit view)
 *   │ [Categories] [Articles]          │ ← optional sub-link chips
 *   └──────────────────────────────────┘
 *
 * The main area is the primary edit destination. Optional `sublinks` render
 * as small pill buttons below the description — used by editorial sections
 * to jump straight to the filtered articles or categories list for that
 * section (the "sub-menu" inside the dashboard).
 *
 * Card itself is a <div>, not a <button>, so sub-link <button> chips inside
 * don't violate the "no nested buttons" HTML rule.
 *
 * --- Xceed pattern ---
 * Reusable card for "click to edit X page" dashboards. Supports flat use
 * (no sublinks) or tree-style use (with sublinks for sub-resources).
 */

import { useNavigate } from 'react-router-dom';

export type Sublink = { label: string; to: string };

interface Props {
  uid: string; // e.g. 'api::homepage.homepage'
  kind: 'single-types' | 'collection-types';
  label: string;
  description: string;
  colour: string;
  sublinks?: Sublink[];
}

const QuickEditCard = ({ uid, kind, label, description, colour, sublinks }: Props) => {
  const navigate = useNavigate();
  const mainHref = `/content-manager/${kind}/${uid}`;
  const goMain = () => navigate(mainHref);

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
    </div>
  );
};

export default QuickEditCard;
