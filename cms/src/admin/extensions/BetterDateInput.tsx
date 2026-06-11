/**
 * BetterDateInput — replaces Strapi v5's built-in date picker.
 *
 * Anna's complaint (10 Jun): "On the Align & Amplify workshop I was trying
 * to change the date but can't see the months ahead to be able to choose a
 * date." Strapi v5's React date picker on certain browsers (Safari iOS in
 * particular) doesn't show the next-month chevron reliably.
 *
 * Native HTML5 <input type="date"> has been bulletproof everywhere since ~2020.
 * iOS uses a native wheel picker (rotate years/months reliably). Desktop uses
 * a real calendar with full month/year navigation. Falls back to typed entry
 * on browsers that don't support it. No external libraries required.
 *
 * Registered as a custom field so existing date columns keep their type
 * (date) — only the input UI changes.
 */

import { useEffect, useState } from 'react';

type Props = {
  name: string;
  value?: string | null;
  attribute?: any;
  onChange: (e: { target: { name: string; value: string | null; type: string } }) => void;
  intlLabel?: { defaultMessage?: string };
  description?: { defaultMessage?: string };
  hint?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  labelAction?: React.ReactNode;
};

// Strapi stores date columns as ISO 8601 — either "YYYY-MM-DD" (date) or
// "YYYY-MM-DDTHH:mm:ss.sssZ" (datetime). Both work in HTML5 <input type="date">
// but only the date part is rendered. We trim to YYYY-MM-DD on display.
function toInputValue(raw: string | null | undefined): string {
  if (!raw) return '';
  const s = String(raw);
  return s.slice(0, 10);
}

export default function BetterDateInput({
  name,
  value,
  onChange,
  intlLabel,
  description,
  hint,
  required,
  error,
  disabled,
  labelAction,
}: Props) {
  const [local, setLocal] = useState(toInputValue(value));

  useEffect(() => {
    setLocal(toInputValue(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value || null;
    setLocal(e.target.value);
    onChange({ target: { name, value: newValue, type: 'date' } });
  };

  const setToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const newValue = `${yyyy}-${mm}-${dd}`;
    setLocal(newValue);
    onChange({ target: { name, value: newValue, type: 'date' } });
  };

  const clear = () => {
    setLocal('');
    onChange({ target: { name, value: null, type: 'date' } });
  };

  const label = intlLabel?.defaultMessage || name;
  const helpText = description?.defaultMessage || hint || '';

  return (
    <div style={styles.wrap}>
      <label htmlFor={name} style={styles.label}>
        <span>
          {label}
          {required ? <span style={styles.required}> *</span> : null}
        </span>
        {labelAction}
      </label>
      <div style={styles.inputRow}>
        <input
          id={name}
          name={name}
          type="date"
          value={local}
          onChange={handleChange}
          disabled={disabled}
          style={{ ...styles.input, ...(error ? styles.inputError : {}), ...(disabled ? styles.inputDisabled : {}) }}
        />
        <button
          type="button"
          onClick={setToday}
          disabled={disabled}
          style={styles.quickBtn}
          title="Set to today"
        >
          Today
        </button>
        {local ? (
          <button
            type="button"
            onClick={clear}
            disabled={disabled}
            style={{ ...styles.quickBtn, ...styles.clearBtn }}
            title="Clear date"
          >
            Clear
          </button>
        ) : null}
      </div>
      {helpText ? <p style={styles.hint}>{helpText}</p> : null}
      <p style={styles.tip}>
        Tip: tap the field and use your phone's native date picker — or just type the date as DD/MM/YYYY.
      </p>
      {error ? <p style={styles.error}>{error}</p> : null}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: {
    fontFamily: 'system-ui, sans-serif',
    fontSize: 12,
    fontWeight: 600,
    color: '#32324D',
    marginBottom: 4,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  required: { color: '#D02B20' },
  inputRow: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  input: {
    flex: '1 1 200px',
    minWidth: 200,
    padding: '10px 12px',
    border: '1px solid #DCDCE4',
    borderRadius: 4,
    fontFamily: 'system-ui, sans-serif',
    fontSize: 14,
    color: '#32324D',
    background: '#fff',
    outline: 'none',
  },
  inputError: { borderColor: '#D02B20' },
  inputDisabled: { background: '#F6F6F9', color: '#666687', cursor: 'not-allowed' },
  quickBtn: {
    padding: '8px 14px',
    border: '1px solid #DCDCE4',
    borderRadius: 4,
    background: '#fff',
    color: '#4945FF',
    fontFamily: 'system-ui, sans-serif',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  clearBtn: { color: '#666687' },
  hint: { fontFamily: 'system-ui, sans-serif', fontSize: 12, color: '#666687', margin: '4px 0 0' },
  tip: {
    fontFamily: 'system-ui, sans-serif',
    fontSize: 11,
    color: '#8C8880',
    fontStyle: 'italic',
    margin: '2px 0 0',
  },
  error: { fontFamily: 'system-ui, sans-serif', fontSize: 12, color: '#D02B20', margin: '4px 0 0' },
};
