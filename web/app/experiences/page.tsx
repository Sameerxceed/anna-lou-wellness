import { Metadata } from 'next';
import Link from 'next/link';
import { getExperiences } from '@/lib/cms';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Experiences',
  description: 'Retreats, workshops, corporate wellbeing, and speaking. Group sessions on the houseboat at Taggs Island, online, and in corporate spaces.',
  openGraph: {
    title: 'Experiences — Anna Lou Wellness',
    description: 'Retreats, workshops, corporate wellbeing, and speaking.',
  },
};

const categories = [
  { title: 'Retreats', href: '/experiences/retreats', desc: 'A few times a year, a small group comes to Taggs Island, Hampton for a full reset day. Six people maximum. No phones, no fixed agenda. We work with whatever the group needs — breathwork, somatic practice, Signal Method, honest conversation. People arrive wound tight and leave softer.', colour: '#7BAFDD' },
  { title: 'Workshops', href: '/experiences/workshops', desc: 'Group sessions held on the houseboat at Taggs Island, online, and in corporate spaces. Every workshop includes full access or a recording and summary. Crystal healing, breathwork, jewellery-making, and restorative practices.', colour: '#7BAFDD' },
  { title: 'Corporate Wellbeing', href: '/experiences/corporate-wellbeing', desc: 'Bespoke formats for teams and organisations. Workshops, keynotes, and ongoing wellbeing programmes. The Signal Method adapted for corporate environments. Available in person or online.', colour: '#7BAFDD' },
  { title: 'Speaking', href: '/experiences/speaking', desc: 'Anna speaks on somatic coaching, the founder journey, nervous system regulation, and building a business from the body up. Available for conferences, panels, podcasts, and private events.', colour: '#7BAFDD' },
];

const fallbackUpcoming = [
  { name: 'Autumn Reset Day', date: 'September 2026', location: 'Taggs Island, Hampton', type: 'retreat' as const, href: '/experiences/retreats', sub: 'The Signal Method™' },
  { name: 'Surrendering and Raising Your Vibration', date: 'October 2026', location: 'Online', type: 'workshop' as const, href: '/experiences/workshops' },
  { name: 'Crystal Clear Business Vortex', date: 'November 2026', location: 'Taggs Island, Hampton', type: 'workshop' as const, href: '/experiences/workshops', sub: 'A journey to success' },
  { name: 'FREE Crystal Healing: Surrender & Sparkle', date: 'Ongoing', location: 'Online', type: 'workshop' as const, href: '/experiences/workshops', sub: 'Free entry' },
  { name: 'Corporate Wellbeing', date: 'Flexible', location: 'Your workplace or online', type: 'corporate' as const, href: '/experiences/corporate-wellbeing', sub: 'Bespoke formats' },
];

export default async function ExperiencesPage() {
  const cmsExperiences = await getExperiences();
  const upcoming = cmsExperiences.length > 0
    ? cmsExperiences.map(e => ({ name: e.name, date: e.date, location: e.location, type: e.type, href: `/experiences/${e.type === 'retreat' ? 'retreats' : e.type === 'workshop' ? 'workshops' : e.type === 'corporate' ? 'corporate-wellbeing' : 'speaking'}`, sub: e.priceLabel || undefined }))
    : fallbackUpcoming;

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
          {categories.map((cat, i) => (
            <Link key={cat.title} href={cat.href} className={`exp-card reveal${i > 0 ? ` rd${i}` : ''}`} style={{ borderLeft: `3px solid ${cat.colour}` }}>
              <h2 className="exp-card-title">{cat.title}</h2>
              <p className="exp-card-desc">{cat.desc}</p>
              <span className="exp-card-link">{cat.title === 'Corporate Wellbeing' || cat.title === 'Speaking' ? 'Enquire' : `View ${cat.title.toLowerCase()}`} <span>&rarr;</span></span>
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming */}
      <section className="exp-upcoming">
        <div className="exp-upcoming-inner">
          <p className="exp-kicker reveal">Upcoming</p>
          <h2 className="exp-section-title reveal rd1">Next on the calendar.</h2>
          <div className="exp-upcoming-grid">
            {upcoming.map((event, i) => (
              <div key={event.name} className={`exp-upcoming-card reveal${i > 0 ? ` rd${i}` : ''}`}>
                <p className="exp-date">{event.date} &middot; {event.location}</p>
                <h3 className="exp-event-name">{event.name}</h3>
                {event.sub && <p className="exp-event-sub">{event.sub}</p>}
                <Link href={event.href} className="exp-card-link">Details <span>&rarr;</span></Link>
              </div>
            ))}
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
