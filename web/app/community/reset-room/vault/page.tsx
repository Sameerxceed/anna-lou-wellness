import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'The Vault',
  robots: { index: false, follow: false },
};

const VAULT = [
  { slug: 'coming-back-online', name: 'Coming Back Online', length: '12 min', tone: '#F280AA', kind: 'Foundational journey', desc: 'The opening journey. Where you remember what your inner guidance system feels like when nothing is overriding it.' },
  { slug: 'three-mantras', name: 'The Three Mantras', length: '8 min', tone: '#FFD07A', kind: 'Daily practice', desc: 'Three short phrases. One short audio. The smallest, most usable practice in the Vault.' },
  { slug: 'body-holding-it', name: 'The Body That Has Been Holding It', length: '18 min', tone: '#7BAFDD', kind: 'Somatic release', desc: 'A long, slow journey for the body. Tension release through breath, sound, and gentle movement.' },
  { slug: 'decision-audit', name: 'The Decision Audit', length: '15 min', tone: '#5DCAA5', kind: 'Clarity practice', desc: 'For when you cannot tell which decision is yours and which is everyone else\'s expectations of you.' },
  { slug: 'the-returning', name: 'The Returning', length: '20 min', tone: '#FAA21B', kind: 'Reset journey', desc: 'The Reset in audio form. Twenty minutes to come back to yourself.' },
  { slug: 'pattern-underneath', name: 'The Pattern Underneath', length: '16 min', tone: '#6E3A5A', kind: 'Pattern work', desc: 'A guided enquiry for the pattern that keeps repeating, however many times you have tried to fix it.' },
  { slug: 'houseboat-reset', name: 'The Houseboat Reset', length: '10 min', tone: '#A67C3A', kind: 'Founding signature', desc: 'The shortest piece. A founding signature recorded on the boat. The Reset Room\'s heartbeat.' },
];

export default function VaultPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: vaultStyles }} />

      <section className="vault-page">
        <div className="vault-inner">
          <p className="vault-eyebrow">Reset Room · The Vault</p>
          <h1 className="vault-title">Signature journeys.</h1>
          <p className="vault-sub"><em>Music, breath, visualisation, embodiment. Where insight becomes the actual life.</em></p>

          <div className="vault-notice">
            <p className="vault-notice-label">Pre-launch placeholder</p>
            <p>The Vault opens with these seven founding journeys when the Reset Room launches. Each one will play inline — audio version pushed to your private podcast feed, video version embedded here. New piece every month.</p>
          </div>

          <div className="vault-filter">
            <button className="vault-filter-btn vault-active">All</button>
            <button className="vault-filter-btn">Foundational</button>
            <button className="vault-filter-btn">Daily practice</button>
            <button className="vault-filter-btn">Somatic release</button>
            <button className="vault-filter-btn">Clarity</button>
          </div>

          <div className="vault-grid">
            {VAULT.map(j => (
              <Link key={j.slug} href={`/community/reset-room/vault/${j.slug}`} className="vault-card" style={{ borderLeftColor: j.tone }}>
                <div className="vault-card-head">
                  <p className="vault-card-kind">{j.kind}</p>
                  <p className="vault-card-length">{j.length}</p>
                </div>
                <h3 className="vault-card-name">{j.name}</h3>
                <p className="vault-card-desc">{j.desc}</p>
                <div className="vault-card-foot">
                  <span className="vault-card-icon">▶</span>
                  <span>Audio + Video</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const vaultStyles = `
.vault-page { background: #F1EAE0; padding: 3rem 2rem 4rem; min-height: 70vh; }
.vault-inner { max-width: 1200px; margin: 0 auto; }
.vault-eyebrow {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase;
  color: #6E3A5A; margin-bottom: 0.6rem;
}
.vault-title {
  font-family: 'Work Sans', sans-serif; font-weight: 300;
  font-size: clamp(2.2rem, 5vw, 3.2rem); color: #231F20;
  letter-spacing: 0.04em; line-height: 1.15; margin-bottom: 0.4rem;
}
.vault-sub {
  font-family: 'EB Garamond', Georgia, serif; font-style: italic;
  font-size: 1.15rem; color: #3D3D3A; margin-bottom: 1.5rem;
}

.vault-notice {
  background: #FFE9C4; border-left: 3px solid #FAA21B;
  padding: 1rem 1.2rem; border-radius: 0 4px 4px 0; margin-bottom: 2rem;
}
.vault-notice-label {
  font-family: Mulish, sans-serif; font-weight: 600;
  font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase;
  color: #FAA21B; margin-bottom: 0.3rem;
}
.vault-notice p {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 0.9rem; color: #3D3D3A; line-height: 1.6;
}

.vault-filter { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.vault-filter-btn {
  background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 20px;
  padding: 0.5rem 1rem; cursor: pointer;
  font-family: Mulish, sans-serif; font-weight: 400;
  font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase;
  color: #3D3D3A; transition: all 0.2s;
}
.vault-filter-btn:hover { border-color: #6E3A5A; color: #6E3A5A; }
.vault-filter-btn.vault-active { background: #6E3A5A; color: #fff; border-color: #6E3A5A; }

.vault-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;
}
.vault-card {
  background: #fff; padding: 1.5rem; border-radius: 8px;
  border-left: 3px solid; text-decoration: none;
  display: flex; flex-direction: column; gap: 0.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}
.vault-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.06); }
.vault-card-head { display: flex; justify-content: space-between; align-items: center; }
.vault-card-kind {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.55rem; letter-spacing: 0.22em; text-transform: uppercase;
  color: #6E3A5A;
}
.vault-card-length {
  font-family: Mulish, sans-serif; font-weight: 400;
  font-size: 0.7rem; color: #8C8880;
}
.vault-card-name {
  font-family: 'Work Sans', sans-serif; font-weight: 400;
  font-size: 1.1rem; color: #231F20; line-height: 1.3;
}
.vault-card-desc {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 0.9rem; line-height: 1.6; color: #3D3D3A;
  flex: 1;
}
.vault-card-foot {
  border-top: 1px solid rgba(0,0,0,0.06); padding-top: 0.6rem;
  display: flex; align-items: center; gap: 0.5rem;
  font-family: Mulish, sans-serif; font-weight: 400;
  font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase;
  color: #8C8880;
}
.vault-card-icon { color: #6E3A5A; font-size: 0.85rem; }

@media (max-width: 900px) { .vault-grid { grid-template-columns: 1fr; } }
`;
