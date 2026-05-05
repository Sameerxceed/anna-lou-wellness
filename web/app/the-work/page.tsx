import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'The Work',
  description: 'Somatic coaching with Anna Lou. The Signal Method, 1:1 sessions, founder reset, dating reset, nervous system reset. Ways to work with Anna.',
  openGraph: {
    title: 'The Work — Anna Lou Wellness',
    description: 'Somatic coaching with Anna Lou. The Signal Method and 1:1 sessions.',
  },
};

export default function TheWorkPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: workStyles }} />

      {/* Header */}
      <section className="work-header">
        <div className="work-header-inner reveal">
          <p className="work-kicker">The Work</p>
          <h1 className="work-title">Your inner world already knows.</h1>
          <p className="work-intro">Most people arrive here after trying everything else. The therapy. The journalling. The courses. The spiritual work. Getting all the way to the insight, and then hitting the same wall. This work meets you in the body, where the patterns actually live.</p>
        </div>
      </section>

      {/* Ways to work */}
      <section className="work-ways">
        <div className="work-ways-inner">
          <div className="reveal">
            <h2 className="work-section-title">Ways to Work With Me</h2>
            <p className="work-body">The Signal Method&#8482; is the umbrella for all the coaching work here. Underneath it sit the programmes, each designed for a different stage of the journey. Whether you are just beginning to notice the patterns, or you are ready to rewire them completely, there is a way in.</p>
            <div className="work-cta-group">
              <Link href="/the-work/quiz" className="work-cta-primary">What do you need right now? <span>&rarr;</span></Link>
            </div>
          </div>
          <div className="work-image reveal rd1" />
        </div>
      </section>

      {/* 1:1 Sessions */}
      <section className="work-sessions">
        <div className="work-sessions-inner">
          <p className="work-kicker reveal">1:1 Sessions</p>
          <h2 className="work-section-title reveal rd1">Four ways to begin.</h2>
          <div className="work-sessions-grid">
            <div className="work-session-card reveal">
              <h3>1:1 Reset Sessions</h3>
              <p>The first shift. Your inner guidance system starts recalibrating.</p>
              <Link href="/the-work/sessions" className="work-card-link">Learn more <span>&rarr;</span></Link>
            </div>
            <div className="work-session-card reveal rd1">
              <h3>Founder Reset</h3>
              <p>For founders and leaders who built something great and lost themselves inside it.</p>
              <Link href="/the-work/sessions" className="work-card-link">Learn more <span>&rarr;</span></Link>
            </div>
            <div className="work-session-card reveal rd2">
              <h3>Dating Reset</h3>
              <p>For women who keep choosing the same pattern and want to understand why.</p>
              <Link href="/the-work/sessions" className="work-card-link">Learn more <span>&rarr;</span></Link>
            </div>
            <div className="work-session-card reveal rd3">
              <h3>Nervous System Reset</h3>
              <p>For bodies that have been holding too much for too long.</p>
              <Link href="/the-work/sessions" className="work-card-link">Learn more <span>&rarr;</span></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Client Stories */}
      <section className="work-stories">
        <div className="work-stories-inner">
          <p className="work-kicker reveal">Client Stories</p>
          <h2 className="work-section-title reveal rd1">What happens when you come home to yourself.</h2>
          <div className="work-stories-grid">
            <div className="work-story-card reveal" style={{ background: '#FCE8EF' }}>
              <p className="work-story-quote">&ldquo;I came to Anna feeling like I had done all the work and still was not quite arriving. Within three sessions something shifted I had been trying to reach for years.&rdquo;</p>
              <p className="work-story-author">Claudine, Founder</p>
            </div>
            <div className="work-story-card reveal rd1" style={{ background: '#E1F5EE' }}>
              <p className="work-story-quote">&ldquo;The Returning Circle changed something in me I did not know needed changing. Being in a room with people who are actually honest.&rdquo;</p>
              <p className="work-story-author">Susan, Coach</p>
            </div>
            <div className="work-story-card reveal rd2" style={{ background: '#E9EBF6' }}>
              <p className="work-story-quote">&ldquo;Anna does something different. She meets you in the body, not the story. That is where the change actually lives.&rdquo;</p>
              <p className="work-story-author">Nicky, Creative Director</p>
            </div>
          </div>
        </div>
      </section>

      {/* Free download CTA */}
      <section className="work-free reveal">
        <p className="work-kicker">Start here</p>
        <h2 className="work-section-title">The Nervous System Decoder</h2>
        <p className="work-body" style={{ maxWidth: '550px', margin: '0 auto 1.5rem', textAlign: 'center' }}>A free guide to understanding your inner guidance system. Download it, read it, and begin.</p>
        <Link href="#" className="work-download-btn">Download free <span>&rarr;</span></Link>
      </section>
    </>
  );
}

const workStyles = `
.work-header { background:#fff; padding:2.5rem 3rem 1.5rem; text-align:center; }
.work-header-inner { max-width:700px; margin:0 auto; }
.work-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:#F280AA; margin-bottom:0.5rem; }
.work-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:300; font-size:clamp(2rem,5vw,3.2rem); color:#231F20; letter-spacing:0.05em; line-height:1.1; margin-bottom:1rem; }
.work-intro { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; color:#3D3D3A; line-height:1.85; max-width:600px; margin:0 auto; }
.work-section-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:400; font-size:clamp(1.4rem,2.5vw,1.8rem); color:#231F20; line-height:1.2; margin-bottom:1rem; letter-spacing:0.02em; }
.work-body { font-family:'EB Garamond',Georgia,serif; font-size:1.02rem; line-height:1.85; color:#3D3D3A; margin-bottom:1rem; }
.work-cta-group { display:flex; gap:1.2rem; flex-wrap:wrap; margin-top:1.5rem; }
.work-cta-primary { font-family:Mulish,sans-serif; font-weight:400; font-size:0.65rem; letter-spacing:0.14em; text-transform:uppercase; color:#F280AA; border-bottom:1px solid #F280AA; padding-bottom:2px; transition:all 0.3s; display:inline-flex; align-items:center; gap:0.4rem; text-decoration:none; }
.work-cta-primary:hover { gap:0.7rem; }

.work-ways { background:#FCE8EF; padding:2rem 3rem; }
.work-ways-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1fr 0.8fr; gap:2.5rem; align-items:center; }
.work-image { aspect-ratio:4/5; border-radius:6px; overflow:hidden; max-height:380px; background:linear-gradient(160deg,#e0cfc0,#ccbaa8); position:relative; }
.work-image::after { content:'Photo. Coaching session'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-family:Mulish,sans-serif; font-size:0.5rem; letter-spacing:0.1em; text-transform:uppercase; color:rgba(0,0,0,0.1); text-align:center; }

.work-sessions { background:#fff; padding:2rem 3rem; }
.work-sessions-inner { max-width:1200px; margin:0 auto; }
.work-sessions-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1rem; margin-top:1rem; }
.work-session-card { background:#F5F3EF; border-radius:8px; padding:1.8rem; transition:all 0.3s; border-left:3px solid #F280AA; }
.work-session-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.06); }
.work-session-card h3 { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:400; font-size:1rem; color:#231F20; margin-bottom:0.5rem; }
.work-session-card p { font-family:'EB Garamond',Georgia,serif; font-size:0.9rem; color:#3D3D3A; line-height:1.6; margin-bottom:0.8rem; }
.work-card-link { font-family:Mulish,sans-serif; font-weight:400; font-size:0.6rem; letter-spacing:0.12em; text-transform:uppercase; color:#F280AA; text-decoration:none; display:inline-flex; align-items:center; gap:0.3rem; transition:gap 0.3s; }
.work-card-link:hover { gap:0.6rem; }

.work-stories { background:#fff; padding:2rem 3rem; }
.work-stories-inner { max-width:1200px; margin:0 auto; }
.work-stories-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.2rem; margin-top:1rem; }
.work-story-card { border-radius:8px; padding:2rem; }
.work-story-quote { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:1rem; color:#3D3D3A; line-height:1.7; margin-bottom:1.2rem; }
.work-story-author { font-family:Mulish,sans-serif; font-weight:400; font-size:0.65rem; letter-spacing:0.1em; text-transform:uppercase; color:#3D3D3A; }

.work-free { background:#E9EBF6; padding:2rem; text-align:center; margin:1rem 3rem; border-radius:8px; }
.work-download-btn { background:#6E3A5A; color:#fff; border:1px solid #6E3A5A; font-family:Mulish,sans-serif; font-weight:500; font-size:0.6rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.7rem 1.8rem; border-radius:3px; transition:all 0.3s; display:inline-block; text-decoration:none; }
.work-download-btn:hover { background:#5A2E4A; }

@media (max-width:900px) {
  .work-ways-inner { grid-template-columns:1fr; gap:1.5rem; }
  .work-sessions-grid { grid-template-columns:1fr; }
  .work-stories-grid { grid-template-columns:1fr; }
  .work-header, .work-ways, .work-sessions, .work-stories { padding-left:1.2rem; padding-right:1.2rem; }
  .work-free { margin:1rem 1.2rem; }
}
`;
