import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Community',
  description: 'The Returning Circle, membership, events calendar, and resource library. Come and sit with us. Anna Lou Wellness.',
  openGraph: {
    title: 'Community — Anna Lou Wellness',
    description: 'The Returning Circle, membership, events, and resources.',
  },
};

export default function CommunityPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: comStyles }} />

      {/* Header */}
      <section className="com-header">
        <div className="com-header-inner reveal">
          <p className="com-kicker">Community</p>
          <h1 className="com-title">Come and sit with us.</h1>
          <p className="com-intro">Connection is not a concept. It is biological. Every space here is designed to bring you into the room with people who are actually honest, actually present, and actually doing the work.</p>
        </div>
      </section>

      {/* The Returning Circle */}
      <section className="com-section">
        <div className="com-section-inner">
          <div className="com-section-image reveal" style={{ background: 'linear-gradient(160deg,#dcc8c0,#c8b0a8)' }} />
          <div className="reveal rd1">
            <h2 className="com-section-title">The Returning Circle</h2>
            <p className="com-body">Every Tuesday I hold a circle at The Hare and the Moon, Twickenham. Donation-based. No agenda except being in the room together.</p>
            <p className="com-body">The Returning Circle runs every week without exception. No waitlist needed. Come on Tuesday.</p>
            <Link href="/community/the-returning-circle" className="com-link">Join the circle <span>&rarr;</span></Link>
          </div>
        </div>
      </section>

      {/* Membership */}
      <section className="com-section com-section-alt">
        <div className="com-section-inner com-section-reverse">
          <div className="reveal rd1">
            <h2 className="com-section-title">The Reset Room</h2>
            <p className="com-body">Monthly live group calls, workshop replay library, Signal Method&#8482; workbook, founder reset audio, full resource library, community space, and early retreat booking.</p>
            <p className="com-body">A deeper container for the work. Everything you need to keep the momentum going between sessions.</p>
            <Link href="/community/membership" className="com-link">Learn more <span>&rarr;</span></Link>
          </div>
          <div className="com-section-image reveal" style={{ background: 'linear-gradient(160deg,#e0d4c8,#d2c4b6)' }} />
        </div>
      </section>

      {/* Events + Resources grid */}
      <section className="com-grid-section">
        <div className="com-grid">
          <Link href="/community/events" className="com-card reveal">
            <h3>Events Calendar</h3>
            <p>Upcoming retreats, live dates, guest experts, and member-only events. All in one place.</p>
            <span className="com-card-link">View calendar <span>&rarr;</span></span>
          </Link>
          <Link href="/community/resources" className="com-card reveal rd1">
            <h3>Resource Library</h3>
            <p>Guides, tools, workshop replays, and member-only content. Everything you need for the journey.</p>
            <span className="com-card-link">Browse resources <span>&rarr;</span></span>
          </Link>
        </div>
      </section>
    </>
  );
}

const comStyles = `
.com-header { background:#fff; padding:2.5rem 3rem 1.5rem; text-align:center; }
.com-header-inner { max-width:700px; margin:0 auto; }
.com-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:#231F20; margin-bottom:0.5rem; }
.com-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:300; font-size:clamp(2rem,5vw,3.2rem); color:#231F20; letter-spacing:0.05em; line-height:1.1; margin-bottom:1rem; }
.com-intro { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; color:#3D3D3A; line-height:1.85; max-width:600px; margin:0 auto; }

.com-section { background:#fff; padding:2rem 3rem; }
.com-section-alt { background:#F5F3EF; }
.com-section-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:2.5rem; align-items:center; }
.com-section-reverse { direction:rtl; }
.com-section-reverse > * { direction:ltr; }
.com-section-image { aspect-ratio:4/3; border-radius:6px; overflow:hidden; max-height:320px; position:relative; }
.com-section-image::after { content:'Photo placeholder'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-family:Mulish,sans-serif; font-size:0.45rem; letter-spacing:0.1em; text-transform:uppercase; color:rgba(0,0,0,0.1); }
.com-section-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:400; font-size:clamp(1.4rem,2.5vw,1.8rem); color:#231F20; line-height:1.2; margin-bottom:1rem; }
.com-body { font-family:'EB Garamond',Georgia,serif; font-size:1.02rem; line-height:1.85; color:#3D3D3A; margin-bottom:1rem; }
.com-link { font-family:Mulish,sans-serif; font-weight:400; font-size:0.65rem; letter-spacing:0.14em; text-transform:uppercase; color:#231F20; border-bottom:1px solid #231F20; padding-bottom:2px; transition:all 0.3s; display:inline-flex; align-items:center; gap:0.4rem; text-decoration:none; }
.com-link:hover { gap:0.7rem; }

.com-grid-section { background:#fff; padding:2rem 3rem; }
.com-grid { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:repeat(2,1fr); gap:1rem; }
.com-card { background:#F5F3EF; border-radius:8px; padding:2rem; transition:all 0.3s; text-decoration:none; display:block; border-left:3px solid #231F20; }
.com-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.06); }
.com-card h3 { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:400; font-size:1rem; color:#231F20; margin-bottom:0.5rem; }
.com-card p { font-family:'EB Garamond',Georgia,serif; font-size:0.9rem; color:#3D3D3A; line-height:1.6; margin-bottom:1rem; }
.com-card-link { font-family:Mulish,sans-serif; font-weight:400; font-size:0.6rem; letter-spacing:0.12em; text-transform:uppercase; color:#231F20; display:inline-flex; align-items:center; gap:0.3rem; }

@media (max-width:900px) {
  .com-section-inner { grid-template-columns:1fr; gap:1.5rem; }
  .com-section-reverse { direction:ltr; }
  .com-grid { grid-template-columns:1fr; }
  .com-header, .com-section, .com-grid-section { padding-left:1.2rem; padding-right:1.2rem; }
}
`;
