import { Metadata } from 'next';
import { getGenericPageBySlug } from '@/lib/generic-page';

export const metadata: Metadata = {
  title: 'You\'re In — Reset Letters',
  description: 'Welcome to Reset Letters. Your first edition lands 22 June 2026.',
  robots: { index: false, follow: false },
};

const splitParas = (s: string) => s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

export default async function WelcomePage() {
  const cms = await getGenericPageBySlug('welcome');
  const headline = cms?.title || "You're in.";
  const bodyParas = cms?.intro ? splitParas(cms.intro) : [
    'Welcome to Reset Letters. You are now a Founding Member, which means you get full access to everything, for life. No charge. Ever.',
    'Your first edition will land in your inbox on **22 June 2026**. Until then, here are three things you can do:',
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: welcomeStyles }} />

      <div className="wl-page">
        {/* Brand lockup */}
        <header className="wl-header">
          <img src="/alw-logo.png" alt="Anna Lou Wellness" className="wl-alw-logo" />
          <p className="wl-tagline">BEAUTIFULLY WHOLE</p>
        </header>

        {/* Reset Letters wordmark */}
        <div className="wl-wordmark" aria-label="Reset Letters">
          <div className="wl-word">
            <span style={{ color: '#231F20' }}>R</span>
            <span style={{ color: '#EE312F' }}>E</span>
            <span style={{ color: '#FAA21B' }}>S</span>
            <span style={{ color: '#7BAFDD' }}>E</span>
            <span style={{ color: '#F280AA' }}>T</span>
          </div>
          <div className="wl-word">
            <span style={{ color: '#5DCAA5' }}>L</span>
            <span style={{ color: '#FFD07A' }}>E</span>
            <span style={{ color: '#7BAFDD' }}>T</span>
            <span style={{ color: '#F280AA' }}>T</span>
            <span style={{ color: '#D5D0C8' }}>E</span>
            <span style={{ color: '#FAA21B' }}>R</span>
            <span style={{ color: '#5DCAA5' }}>S</span>
          </div>
        </div>

        {/* Confirmation */}
        <div className="wl-content">
          <h1 className="wl-headline"><em>{headline}</em></h1>

          {bodyParas.map((p, i) => (
            <p key={i} className="wl-body" dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
          ))}

          <div className="wl-steps">
            <div className="wl-step">
              <span className="wl-num">1</span>
              <p className="wl-body"><strong>Follow on Instagram.</strong> That is where the conversation happens between editions. Behind the scenes, early peeks, and the odd voice note.</p>
            </div>
            <div className="wl-step">
              <span className="wl-num">2</span>
              <p className="wl-body"><strong>Reply to the welcome email.</strong> Tell me one thing you are carrying right now. I read every reply.</p>
            </div>
            <div className="wl-step">
              <span className="wl-num">3</span>
              <p className="wl-body"><strong>Forward this to a friend.</strong> Someone who needs it. You will know who.</p>
            </div>
          </div>

          <a
            href="https://www.instagram.com/annalouwellness"
            target="_blank"
            rel="noopener noreferrer"
            className="wl-insta-btn"
          >
            FOLLOW ON INSTAGRAM &rarr;
          </a>

          <div className="wl-signoff">
            <p className="wl-signoff-text">Still Sparkling,</p>
            <p className="wl-signoff-name">Anna Lou x</p>
          </div>
        </div>

        <footer className="wl-footer">
          <p className="wl-copyright">&copy; {new Date().getFullYear()} Anna Lou Wellness</p>
        </footer>
      </div>
    </>
  );
}

const welcomeStyles = `
* { margin:0; padding:0; box-sizing:border-box; }

.wl-page {
  background: #F1EAE0;
  color: #231F20;
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  max-width: 620px;
  margin: 0 auto;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.wl-header { text-align:center; margin-bottom:1.5rem; }
.wl-wordmark { text-align:center; margin-bottom:2.5rem; }
.wl-word {
  font-family:'Poppins',sans-serif;
  font-weight:900;
  font-size:clamp(2.2rem,6vw,3.6rem);
  line-height:0.95;
  letter-spacing:0.02em;
  display:block;
}
.wl-word span { display:inline-block; }
.wl-alw-logo { height:40px; width:auto; margin-bottom:0.4rem; display:inline-block; }
.wl-tagline {
  font-family:'Poppins',sans-serif;
  font-weight:400;
  font-size:0.55rem;
  letter-spacing:0.35em;
  color:#A67C3A;
}

.wl-content { text-align:center; }

.wl-headline {
  font-family:'Lora',Georgia,serif;
  font-style:italic;
  font-weight:400;
  font-size:clamp(2.5rem,6vw,3.5rem);
  color:#231F20;
  margin-bottom:1.5rem;
  line-height:1.2;
}

.wl-body {
  font-family:'Poppins',sans-serif;
  font-weight:300;
  font-size:0.92rem;
  line-height:1.8;
  color:#231F20;
  margin-bottom:1rem;
  text-align:center;
}
.wl-body strong { font-weight:600; }

.wl-steps {
  text-align:left;
  margin:2rem 0;
}
.wl-step {
  display:flex;
  gap:1rem;
  align-items:flex-start;
  margin-bottom:1.2rem;
}
.wl-num {
  font-family:'Poppins',sans-serif;
  font-weight:700;
  font-size:1.4rem;
  color:#F280AA;
  flex-shrink:0;
  margin-top:0.1rem;
}
.wl-step .wl-body { text-align:left; margin-bottom:0; }

.wl-insta-btn {
  display:inline-block;
  font-family:'Poppins',sans-serif;
  font-weight:600;
  font-size:0.65rem;
  letter-spacing:0.2em;
  color:#fff;
  background:#231F20;
  text-decoration:none;
  padding:0.9rem 2.2rem;
  border-radius:6px;
  margin:1.5rem 0 2.5rem;
  transition:background 0.3s;
}
.wl-insta-btn:hover { background:#3D3D3A; }

.wl-signoff { margin-bottom:2rem; }
.wl-signoff-text {
  font-family:'Lora',Georgia,serif;
  font-style:italic;
  font-size:1.1rem;
  color:#231F20;
  margin-bottom:0.2rem;
}
.wl-signoff-name {
  font-family:'Poppins',sans-serif;
  font-weight:500;
  font-size:0.85rem;
  color:#231F20;
}

.wl-footer { margin-top:auto; padding-top:1.5rem; border-top:1px solid rgba(0,0,0,0.06); width:100%; text-align:center; }
.wl-copyright {
  font-family:'Poppins',sans-serif;
  font-weight:300;
  font-size:0.65rem;
  color:#999;
}

@media (max-width:640px) {
  .wl-page { padding:2rem 1.2rem; }
  .wl-alw-logo { height:32px; }
}
`;
