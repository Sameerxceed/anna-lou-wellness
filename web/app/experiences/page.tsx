import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Experiences',
  description: 'Retreats, workshops, corporate wellbeing, and speaking. Group sessions on the houseboat at Taggs Island, online, and in corporate spaces.',
  openGraph: {
    title: 'Experiences — Anna Lou Wellness',
    description: 'Retreats, workshops, corporate wellbeing, and speaking.',
  },
};

export default function ExperiencesPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: expStyles }} />

      {/* Header */}
      <section className="exp-header">
        <div className="exp-header-inner reveal">
          <p className="exp-kicker">Experiences</p>
          <h1 className="exp-title">Workshops, retreats, and reset days.</h1>
          <p className="exp-intro">Group sessions held on the houseboat at Taggs Island, online, and in corporate spaces. A few times a year, a small group comes to the island for a full reset day. Water outside, no agenda, just space to come back to yourself.</p>
        </div>
      </section>

      {/* Category cards */}
      <section className="exp-categories">
        <div className="exp-grid">
          <Link href="/experiences/retreats" className="exp-card reveal" style={{ borderLeft: '3px solid #7BAFDD' }}>
            <h2 className="exp-card-title">Retreats</h2>
            <p className="exp-card-desc">A few times a year, a small group comes to Taggs Island, Hampton for a full reset day. Water outside, no agenda, just space to come back to yourself.</p>
            <span className="exp-card-link">View retreats <span>&rarr;</span></span>
          </Link>
          <Link href="/experiences/workshops" className="exp-card reveal rd1" style={{ borderLeft: '3px solid #7BAFDD' }}>
            <h2 className="exp-card-title">Workshops</h2>
            <p className="exp-card-desc">Group sessions held on the houseboat at Taggs Island, online, and in corporate spaces. Every workshop includes full access or a recording and summary.</p>
            <span className="exp-card-link">View workshops <span>&rarr;</span></span>
          </Link>
          <Link href="/experiences/corporate-wellbeing" className="exp-card reveal rd2" style={{ borderLeft: '3px solid #7BAFDD' }}>
            <h2 className="exp-card-title">Corporate Wellbeing</h2>
            <p className="exp-card-desc">Bespoke formats for teams and organisations. Workshops, keynotes, and ongoing wellbeing programmes tailored to your workplace.</p>
            <span className="exp-card-link">Enquire <span>&rarr;</span></span>
          </Link>
          <Link href="/experiences/speaking" className="exp-card reveal rd3" style={{ borderLeft: '3px solid #7BAFDD' }}>
            <h2 className="exp-card-title">Speaking</h2>
            <p className="exp-card-desc">Anna speaks on somatic coaching, the founder journey, nervous system regulation, and building a business from the body up.</p>
            <span className="exp-card-link">Book Anna <span>&rarr;</span></span>
          </Link>
        </div>
      </section>

      {/* Upcoming (placeholder) */}
      <section className="exp-upcoming">
        <div className="exp-upcoming-inner">
          <p className="exp-kicker reveal">Upcoming</p>
          <h2 className="exp-section-title reveal rd1">Next on the calendar.</h2>
          <div className="exp-upcoming-grid">
            <div className="exp-upcoming-card reveal">
              <p className="exp-date">September 2026 &middot; Taggs Island, Hampton</p>
              <h3 className="exp-event-name">Autumn Reset Day</h3>
              <p className="exp-event-sub">The Signal Method&#8482;</p>
              <Link href="/experiences/retreats" className="exp-card-link">Details <span>&rarr;</span></Link>
            </div>
            <div className="exp-upcoming-card reveal rd1">
              <p className="exp-date">October 2026 &middot; Online</p>
              <h3 className="exp-event-name">Surrendering and Raising Your Vibration</h3>
              <Link href="/experiences/workshops" className="exp-card-link">Details <span>&rarr;</span></Link>
            </div>
            <div className="exp-upcoming-card reveal rd2">
              <p className="exp-date">Flexible &middot; Your workplace or online</p>
              <h3 className="exp-event-name">Corporate Wellbeing. Bespoke formats.</h3>
              <Link href="/experiences/corporate-wellbeing" className="exp-card-link">Enquire <span>&rarr;</span></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const expStyles = `
.exp-header { background:#fff; padding:2.5rem 3rem 1.5rem; text-align:center; }
.exp-header-inner { max-width:700px; margin:0 auto; }
.exp-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:#7BAFDD; margin-bottom:0.5rem; }
.exp-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:300; font-size:clamp(2rem,5vw,3.2rem); color:#231F20; letter-spacing:0.05em; line-height:1.1; margin-bottom:1rem; }
.exp-intro { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; color:#3D3D3A; line-height:1.85; max-width:600px; margin:0 auto; }
.exp-section-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:400; font-size:clamp(1.4rem,2.5vw,1.8rem); color:#231F20; line-height:1.2; margin-bottom:1rem; }

.exp-categories { background:#fff; padding:1rem 3rem 2rem; }
.exp-grid { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:repeat(2,1fr); gap:1rem; }
.exp-card { background:#F5F3EF; border-radius:8px; padding:2rem; transition:all 0.3s; text-decoration:none; display:block; }
.exp-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.06); }
.exp-card-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:400; font-size:1.1rem; color:#231F20; margin-bottom:0.5rem; }
.exp-card-desc { font-family:'EB Garamond',Georgia,serif; font-size:0.9rem; color:#3D3D3A; line-height:1.6; margin-bottom:1rem; }
.exp-card-link { font-family:Mulish,sans-serif; font-weight:400; font-size:0.6rem; letter-spacing:0.12em; text-transform:uppercase; color:#7BAFDD; display:inline-flex; align-items:center; gap:0.3rem; transition:gap 0.3s; }
.exp-card-link:hover { gap:0.6rem; }

.exp-upcoming { background:#F5F3EF; padding:2rem 3rem; }
.exp-upcoming-inner { max-width:1200px; margin:0 auto; }
.exp-upcoming-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-top:1rem; }
.exp-upcoming-card { background:#fff; border-radius:8px; padding:1.5rem; transition:all 0.3s; }
.exp-upcoming-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.06); }
.exp-date { font-family:Mulish,sans-serif; font-weight:400; font-size:0.65rem; letter-spacing:0.08em; text-transform:uppercase; color:#7BAFDD; margin-bottom:0.4rem; }
.exp-event-name { font-family:'EB Garamond',Georgia,serif; font-weight:500; font-size:1.05rem; color:#231F20; margin-bottom:0.5rem; line-height:1.3; }
.exp-event-sub { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:0.85rem; color:#8C8880; margin-bottom:0.8rem; }

@media (max-width:900px) {
  .exp-grid, .exp-upcoming-grid { grid-template-columns:1fr; }
  .exp-header, .exp-categories, .exp-upcoming { padding-left:1.2rem; padding-right:1.2rem; }
}
`;
