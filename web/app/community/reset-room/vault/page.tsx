import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getVaultJourneys, type VaultJourney } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'The Vault',
  robots: { index: false, follow: false },
};

export default async function VaultPage() {
  const session = await getSession();
  if (!session) redirect('/login?next=/community/reset-room/vault');
  if (!session.isMember) redirect('/community/reset-room');

  const journeys = await getVaultJourneys();
  // Unique kinds for filter pills (always include "All").
  const kinds = Array.from(new Set(journeys.map((j) => j.kind).filter(Boolean)));

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: vaultStyles }} />

      <section className="vault-page">
        <div className="vault-inner">
          <p className="vault-eyebrow">Reset Room · The Vault</p>
          <h1 className="vault-title">Signature journeys.</h1>
          <p className="vault-sub"><em>Music, breath, visualisation, embodiment. Where insight becomes the actual life.</em></p>

          {journeys.length === 0 ? (
            <div className="vault-empty">
              <p>Anna is finalising the founding journeys. The Vault opens with seven on launch — each playable inline (audio + video), with a companion PDF.</p>
              <p className="vault-empty-sub">New journey published every month thereafter.</p>
            </div>
          ) : (
            <>
              {kinds.length > 1 && (
                <div className="vault-filter">
                  <button className="vault-filter-btn vault-active">All</button>
                  {kinds.map((k) => (
                    <button key={k} className="vault-filter-btn">{k}</button>
                  ))}
                </div>
              )}

              <div className="vault-grid">
                {journeys.map((j) => <VaultCard key={j.slug} journey={j} />)}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

function VaultCard({ journey }: { journey: VaultJourney }) {
  const formats: string[] = [];
  if (journey.audioUrl) formats.push('Audio');
  if (journey.videoUrl) formats.push('Video');
  const formatLabel = formats.length ? formats.join(' + ') : 'Coming soon';

  return (
    <Link href={`/community/reset-room/vault/${journey.slug}`} className="vault-card" style={{ borderLeftColor: journey.toneColour }}>
      <div className="vault-card-head">
        <p className="vault-card-kind" style={{ color: journey.toneColour }}>{journey.kind}</p>
        {journey.duration && <p className="vault-card-length">{journey.duration}</p>}
      </div>
      <h3 className="vault-card-name">{journey.name}</h3>
      {journey.description && <p className="vault-card-desc">{journey.description}</p>}
      <div className="vault-card-foot">
        <span className="vault-card-icon">▶</span>
        <span>{formatLabel}</span>
      </div>
    </Link>
  );
}

const vaultStyles = `
.vault-page { background: #F1EAE0; padding: 3rem 2rem 4rem; min-height: 70vh; }
.vault-inner { max-width: 1200px; margin: 0 auto; }
.vault-eyebrow { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase; color: #6E3A5A; margin-bottom: 0.6rem; }
.vault-title { font-family: 'Work Sans', sans-serif; font-weight: 300; font-size: clamp(2.2rem, 5vw, 3.2rem); color: #231F20; letter-spacing: 0.04em; line-height: 1.15; margin-bottom: 0.4rem; }
.vault-sub { font-family: 'EB Garamond', Georgia, serif; font-style: italic; font-size: 1.15rem; color: #3D3D3A; margin-bottom: 1.5rem; }

.vault-empty { background: #fff; padding: 3rem 2rem; border-radius: 6px; text-align: center; }
.vault-empty p { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; color: #3D3D3A; margin-bottom: 0.5rem; line-height: 1.6; }
.vault-empty-sub { color: #8C8880 !important; font-size: 0.9rem !important; }

.vault-filter { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.vault-filter-btn { background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 20px; padding: 0.5rem 1rem; cursor: pointer; font-family: Mulish, sans-serif; font-weight: 400; font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase; color: #3D3D3A; transition: all 0.2s; }
.vault-filter-btn:hover { border-color: #6E3A5A; color: #6E3A5A; }
.vault-filter-btn.vault-active { background: #6E3A5A; color: #fff; border-color: #6E3A5A; }

.vault-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.vault-card { background: #fff; padding: 1.5rem; border-radius: 8px; border-left: 3px solid; text-decoration: none; display: flex; flex-direction: column; gap: 0.5rem; transition: transform 0.2s, box-shadow 0.2s; }
.vault-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.06); }
.vault-card-head { display: flex; justify-content: space-between; align-items: center; }
.vault-card-kind { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.55rem; letter-spacing: 0.22em; text-transform: uppercase; }
.vault-card-length { font-family: Mulish, sans-serif; font-weight: 400; font-size: 0.7rem; color: #8C8880; }
.vault-card-name { font-family: 'Work Sans', sans-serif; font-weight: 400; font-size: 1.1rem; color: #231F20; line-height: 1.3; }
.vault-card-desc { font-family: 'EB Garamond', Georgia, serif; font-size: 0.9rem; line-height: 1.6; color: #3D3D3A; flex: 1; }
.vault-card-foot { border-top: 1px solid rgba(0,0,0,0.06); padding-top: 0.6rem; display: flex; align-items: center; gap: 0.4rem; font-family: Mulish, sans-serif; font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; color: #8C8880; }
.vault-card-icon { color: #6E3A5A; font-size: 0.85rem; }

@media (max-width: 900px) { .vault-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .vault-grid { grid-template-columns: 1fr; } }
`;
