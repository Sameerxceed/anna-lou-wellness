/**
 * QuickEditCard — single card in the Quick Edit dashboard.
 *
 * Renders a clickable card with section colour, title, and short description.
 * On click, navigates to the corresponding Strapi edit view.
 *
 * --- Xceed pattern ---
 * Drop-in dashboard card for "click to edit X page". Reuses on any project
 * by passing the singletype UID + colour + label.
 */

import { useNavigate } from 'react-router-dom';

interface Props {
  uid: string; // e.g. 'api::homepage.homepage'
  kind: 'single-types' | 'collection-types';
  label: string;
  description: string;
  colour: string;
}

const QuickEditCard = ({ uid, kind, label, description, colour }: Props) => {
  const navigate = useNavigate();
  const handleClick = () => navigate(`/content-manager/${kind}/${uid}`);

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        textAlign: 'left',
        background: '#fff',
        border: '1px solid #eaeaef',
        borderLeft: `4px solid ${colour}`,
        borderRadius: 6,
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
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
    </button>
  );
};

export default QuickEditCard;
