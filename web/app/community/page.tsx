import { Metadata } from 'next';
import Link from 'next/link';
import { getCommunityPage } from '@/lib/cms';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Community',
  description: 'The Returning Circle, membership, events calendar, and resource library. Come and sit with us. Anna Lou Wellness.',
  openGraph: {
    title: 'Community — Anna Lou Wellness',
    description: 'The Returning Circle, membership, events, and resources.',
  },
};

const defaultIntro = `Connection is not a concept. It is biological. Your nervous system needs co-regulation. It needs other regulated humans. That's not self-help language. That's neuroscience. Every space here is designed to bring you into the room with people who are actually honest, actually present, and actually doing the work.`;

const defaultCircleDescription = `Every Tuesday evening I hold a circle at The Hare and the Moon in Twickenham. Donation-based. Open to everyone. No booking required.\n\nWhat it is: a room. People who are honest. No advice. No fixing. No cross-talk. Just being in the presence of other humans who are willing to say what's actually going on.\n\nWhat it is not: therapy, a support group, a workshop, or anything with a curriculum. There is no programme. There is no progression. You come when you need to. You stop when you're done.\n\nMost people who come for the first time look nervous. By the end of the evening something in them has settled. Not because anything dramatic happened. Because they were in a room where they didn't have to perform. That sounds like nothing. It's actually everything.`;

const defaultResetRoomDescription = `The Reset Room is the monthly membership for people who want ongoing access to the work without the commitment of a full programme.\n\nIt is for people who have done some work and want to keep going. For people who are not ready for 1:1 but know they need more than occasional workshops. For people who want community as part of their practice.\n\nIt is also the most natural next step after a workshop. You came to Signal Reset Day. Something shifted. You want to keep that aliveness going. This is where you come.\n\nCancel any time. First month free for anyone who has attended a paid workshop in the last three months.`;

const defaultResetRoomFeatures = [
  'Monthly live group session (90 mins, Zoom, recorded)',
  'Full workshop replay library',
  'Signal Method™ workbook',
  'Monthly Signal Check practice',
  'Founder reset audio',
  'Reset Room community space',
  'Early retreat booking access',
];

export default async function CommunityPage() {
  const page = await getCommunityPage();

  const intro = page.intro || defaultIntro;
  const circleDesc = page.circleDescription || defaultCircleDescription;
  const resetRoomDesc = page.resetRoomDescription || defaultResetRoomDescription;
  const resetRoomFeatures = page.resetRoomFeatures.length > 0 ? page.resetRoomFeatures : defaultResetRoomFeatures;
  const eventsDesc = page.eventsDescription || 'Upcoming retreats, live dates, guest experts, and member-only events. All in one place.';
  const resourcesDesc = page.resourcesDescription || 'Guides, tools, workshop replays, and member-only content. Everything you need for the journey.';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: comStyles }} />

      {/* Header */}
      <section className="com-header">
        <div className="com-header-inner reveal">
          <p className="com-kicker">{page.kicker}</p>
          <h1 className="com-title">{page.title}</h1>
          <p className="com-intro">{intro}</p>
        </div>
      </section>

      {/* The Returning Circle */}
      <section className="com-section">
        <div className="com-section-inner">
          <div className="com-section-image reveal" style={{ background: 'linear-gradient(160deg,#dcc8c0,#c8b0a8)' }} />
          <div className="reveal rd1">
            <h2 className="com-section-title">{page.circleTitle}</h2>
            {circleDesc.split('\n\n').map((para, i) => (
              <p key={i} className="com-body">{para}</p>
            ))}
            <Link href="/community/the-returning-circle" className="com-link">Come when you&rsquo;re ready <span>&rarr;</span></Link>
          </div>
        </div>
      </section>

      {/* The Reset Room */}
      <section className="com-section com-section-alt">
        <div className="com-section-inner com-section-reverse">
          <div className="reveal rd1">
            <h2 className="com-section-title">{page.resetRoomTitle}</h2>
            {resetRoomDesc.split('\n\n').map((para, i) => (
              <p key={i} className="com-body">{para}</p>
            ))}
            <p className="com-price">{page.resetRoomPrice}</p>
            <ul className="com-features">
              {resetRoomFeatures.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
            <Link href="/community/membership" className="com-link">Join the Reset Room <span>&rarr;</span></Link>
          </div>
          <div className="com-section-image reveal" style={{ background: 'linear-gradient(160deg,#e0d4c8,#d2c4b6)' }} />
        </div>
      </section>

      {/* Events + Resources grid */}
      <section className="com-grid-section">
        <div className="com-grid">
          <Link href="/community/events" className="com-card reveal">
            <h3>{page.eventsTitle}</h3>
            <p>{eventsDesc}</p>
            <span className="com-card-link">View calendar <span>&rarr;</span></span>
          </Link>
          <Link href="/community/resources" className="com-card reveal rd1">
            <h3>{page.resourcesTitle}</h3>
            <p>{resourcesDesc}</p>
            <span className="com-card-link">Browse resources <span>&rarr;</span></span>
          </Link>
        </div>
      </section>
    </>
  );
}

const comStyles = `
.com-header { background:#fff; padding:2.5rem 3rem 1.5rem; text-align:center; }
.com-header-inner { max-width:900px; margin:0 auto; }
.com-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:#231F20; margin-bottom:0.5rem; }
.com-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:300; font-size:clamp(2rem,5vw,3.2rem); color:#231F20; letter-spacing:0.05em; line-height:1.1; margin-bottom:1rem; }
.com-intro { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; color:#3D3D3A; line-height:1.85; max-width:800px; margin:0 auto; }

.com-section { background:#fff; padding:2rem 3rem; }
.com-section-alt { background:#F5F3EF; }
.com-section-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:2.5rem; align-items:center; }
.com-section-reverse { direction:rtl; }
.com-section-reverse > * { direction:ltr; }
.com-section-image { aspect-ratio:4/3; border-radius:6px; overflow:hidden; max-height:320px; position:relative; }
.com-section-image::after { content:'Photo placeholder'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-family:Mulish,sans-serif; font-size:0.45rem; letter-spacing:0.1em; text-transform:uppercase; color:rgba(0,0,0,0.1); }
.com-section-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:400; font-size:clamp(1.4rem,2.5vw,1.8rem); color:#231F20; line-height:1.2; margin-bottom:1rem; }
.com-body { font-family:'EB Garamond',Georgia,serif; font-size:1.02rem; line-height:1.85; color:#3D3D3A; margin-bottom:0.8rem; }
.com-link { font-family:Mulish,sans-serif; font-weight:400; font-size:0.65rem; letter-spacing:0.14em; text-transform:uppercase; color:#231F20; border-bottom:1px solid #231F20; padding-bottom:2px; transition:all 0.3s; display:inline-flex; align-items:center; gap:0.4rem; text-decoration:none; margin-top:0.5rem; }
.com-link:hover { gap:0.7rem; }

.com-price { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:400; font-size:1.1rem; color:#6E3A5A; margin:0.8rem 0 0.5rem; }
.com-features { list-style:none; padding:0; margin:0 0 1rem; }
.com-features li { font-family:Mulish,sans-serif; font-size:0.8rem; color:#3D3D3A; line-height:1.8; padding-left:1rem; position:relative; }
.com-features li::before { content:'—'; position:absolute; left:0; color:#6E3A5A; }

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
