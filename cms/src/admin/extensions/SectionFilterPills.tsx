/**
 * Section Filter Pills — quick filter row at the top of editorial list views.
 *
 * Currently active on TWO collection types:
 *
 *   1. Story · Category   — direct `section` field on the category
 *   2. Story · Article    — articles filtered by their category's section
 *
 * Renders a row of pills:
 *   [Filter by section]  [All]  [Reset Stories]  [Life]  [Love & Rels]  [Work & Money]
 *
 * Click a pill → URL updates with the appropriate `filters[...][$eq]=<slug>`,
 * page resets to 1, and Strapi re-fetches automatically.
 *
 * Only renders when the user is on one of the configured collection list pages.
 * Invisible everywhere else.
 *
 * --- Xceed pattern ---
 * Template approach for "section-aware quick filters". To reuse on another
 * project: copy this file, edit the TARGETS array (each one declares the
 * collection UID + the filter field path) and the SECTIONS array.
 */

import { useLocation, useNavigate } from 'react-router-dom';

// Map each editorial collection to the filter-field path Strapi expects.
// Direct field:  'section'                       → filters[section][$eq]=...
// Relation hop:  'category][section'             → filters[category][section][$eq]=...
//   (Strapi v5 bracket-notation: each level is its own []-segment in the key)
type Target = { uid: string; filterField: string };
const TARGETS: Target[] = [
  { uid: 'api::article-category.article-category', filterField: 'section' },
  { uid: 'api::article.article', filterField: 'category][section' },
];

// Editorial sections that have article categories. Mirror of the enum in
// cms/src/api/article-category/content-types/article-category/schema.json
// — keep in sync if you add/rename a section there.
const SECTIONS: { label: string; value: string; colour: string }[] = [
  { label: 'Reset Stories', value: 'reset-stories', colour: '#6E3A5A' },
  { label: 'Life', value: 'life', colour: '#FAA21B' },
  { label: 'Love & Rels', value: 'love-and-relationships', colour: '#F280AA' },
  { label: 'Work & Money', value: 'work-and-money', colour: '#FFD07A' },
];

const SectionFilterPills = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Match the current path against any of the configured target UIDs
  const target = TARGETS.find(
    (t) =>
      location.pathname.includes('/content-manager/collection-types/') &&
      location.pathname.includes(t.uid),
  );
  if (!target) return null;

  const filterKey = `filters[${target.filterField}][$eq]`;

  // Determine current active filter from URL (if any)
  const params = new URLSearchParams(location.search);
  const activeSection = params.get(filterKey) || '';

  const goTo = (section: string) => {
    const next = new URLSearchParams(location.search);
    if (section) {
      next.set(filterKey, section);
    } else {
      next.delete(filterKey);
    }
    // Reset to page 1 whenever the filter changes
    next.set('page', '1');
    navigate(`${location.pathname}?${next.toString()}`);
  };

  const pillBase: React.CSSProperties = {
    cursor: 'pointer',
    padding: '6px 14px',
    borderRadius: 999,
    border: '1px solid #d9d8ff',
    background: 'transparent',
    fontFamily: 'inherit',
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: '0.02em',
    color: '#32324d',
    transition: 'all 0.15s',
  };
  const pillActive = (colour: string): React.CSSProperties => ({
    ...pillBase,
    background: colour,
    borderColor: colour,
    color: '#fff',
  });

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        padding: '12px 16px',
        background: '#f6f6f9',
        borderBottom: '1px solid #eaeaef',
        marginBottom: 8,
      }}
      role="toolbar"
      aria-label="Quick filter by section"
    >
      <span
        style={{
          alignSelf: 'center',
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#666687',
          marginRight: 4,
        }}
      >
        Filter by section
      </span>

      <button
        type="button"
        onClick={() => goTo('')}
        style={!activeSection ? pillActive('#32324d') : pillBase}
      >
        All
      </button>

      {SECTIONS.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => goTo(s.value)}
          style={activeSection === s.value ? pillActive(s.colour) : pillBase}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
};

export default SectionFilterPills;
