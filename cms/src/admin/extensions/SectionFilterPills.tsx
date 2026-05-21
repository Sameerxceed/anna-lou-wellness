/**
 * Section Filter Pills — Story · Category list view enhancement.
 *
 * Renders a row of pills at the top of the Story · Category list:
 *   [All]  [Reset Stories]  [Life]  [Love & Rels]  [Work & Money]
 *
 * Click a pill → URL updates with ?filters[section][$eq]=<slug>&page=1
 * The list re-fetches automatically (Strapi reads filter from URL).
 *
 * Only renders when the user is on the article-category list page.
 * On any other content type's list view, returns null (invisible).
 *
 * --- Xceed pattern ---
 * This is the template approach for "section-aware quick filters" on any
 * collection that has an enum-typed `section`/`category`/`group` field.
 * To reuse on another project:
 *   1. Copy this file, rename the SECTIONS array
 *   2. Update TARGET_UID to the new content type's UID
 *   3. Update the filter field name if not 'section'
 */

import { useLocation, useNavigate } from 'react-router-dom';

const TARGET_UID = 'api::article-category.article-category';

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

  // Only show on the article-category list page
  const isTargetList =
    location.pathname.includes('/content-manager/collection-types/') &&
    location.pathname.includes(TARGET_UID);
  if (!isTargetList) return null;

  // Determine current active filter from URL (if any)
  const params = new URLSearchParams(location.search);
  const activeSection = params.get('filters[section][$eq]') || '';

  const goTo = (section: string) => {
    const next = new URLSearchParams(location.search);
    if (section) {
      next.set('filters[section][$eq]', section);
    } else {
      next.delete('filters[section][$eq]');
    }
    // Reset to page 1 when filter changes
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
