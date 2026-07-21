import { Metadata } from 'next';
import Link from 'next/link';
import { getCommunityPage } from '@/lib/cms';
import UpsellBlockForSingleton from '@/components/UpsellBlockForSingleton';
import BlocksRenderer from '@/components/BlocksRenderer';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasContent(v: any[] | string | null | undefined): boolean {
  if (!v) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (Array.isArray(v)) return v.some((b) => Array.isArray(b?.children) && b.children.some((c: { text?: string }) => (c?.text || '').trim()));
  return false;
}

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

const defaultKicker = 'Community';
const defaultTitle = 'Come and sit with us.';
const defaultCircleTitle = 'The Returning Circle';
const defaultResetRoomTitle = 'The Reset Room';
const defaultResetRoomPrice = '£25 per month';
const defaultEventsTitle = 'Events Calendar';
const defaultResourcesTitle = 'Resource Library';
const defaultEventsDescription = 'Upcoming retreats, live dates, guest experts, and member-only events. All in one place.';
const defaultResourcesDescription = 'Guides, tools, workshop replays, and member-only content. Everything you need for the journey.';

export default async function CommunityPage() {
  const page = await getCommunityPage();

  // Anna 14 Jul (STRONGER): if a section has nothing in CMS, hide it entirely.
  // Fallbacks kept above only as reference copy Anna can paste back into CMS.
  const kicker = page.kicker;
  const title = page.title;
  const intro = page.intro;
  const circleTitle = page.circleTitle;
  const circleDesc = page.circleDescription;
  const resetRoomTitle = page.resetRoomTitle;
  const resetRoomDesc = page.resetRoomDescription;
  const resetRoomPrice = page.resetRoomPrice;
  const resetRoomFeatures = page.resetRoomFeatures;
  const eventsTitle = page.eventsTitle;
  const eventsDesc = page.eventsDescription;
  const resourcesTitle = page.resourcesTitle;
  const resourcesDesc = page.resourcesDescription;
  void defaultIntro; void defaultCircleDescription;
  void defaultResetRoomDescription; void defaultResetRoomFeatures;
  void defaultKicker; void defaultTitle; void defaultCircleTitle;
  void defaultResetRoomTitle; void defaultResetRoomPrice;
  void defaultEventsTitle; void defaultResourcesTitle;
  void defaultEventsDescription; void defaultResourcesDescription;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: comStyles }} />

      {/* Header — each field hides if empty */}
      {(kicker || title || hasContent(intro)) && (
        <section className="com-header">
          <div className="com-header-inner reveal">
            {kicker && <p className="com-kicker">{kicker}</p>}
            {title && <h1 className="com-title">{title}</h1>}
            {hasContent(intro) && (
              <div className="com-intro com-body-blocks"><BlocksRenderer content={intro} /></div>
            )}
          </div>
        </section>
      )}

      {/* The Returning Circle */}
      {(circleTitle || hasContent(circleDesc)) && (
        <section className="com-section">
          <div className="com-section-inner">
            <div className="com-section-image reveal" style={{ background: 'linear-gradient(160deg,#dcc8c0,#c8b0a8)' }} />
            <div className="reveal rd1">
              {circleTitle && <h2 className="com-section-title">{circleTitle}</h2>}
              {hasContent(circleDesc) && (
                <div className="com-body com-body-blocks"><BlocksRenderer content={circleDesc} /></div>
              )}
              <Link href="/community/the-returning-circle" className="com-link">Come when you&rsquo;re ready <span>&rarr;</span></Link>
            </div>
          </div>
        </section>
      )}

      {/* The Reset Room */}
      {(resetRoomTitle || hasContent(resetRoomDesc) || resetRoomPrice || resetRoomFeatures.length > 0) && (
        <section className="com-section com-section-alt">
          <div className="com-section-inner com-section-reverse">
            <div className="reveal rd1">
              {resetRoomTitle && <h2 className="com-section-title">{resetRoomTitle}</h2>}
              {hasContent(resetRoomDesc) && (
                <div className="com-body com-body-blocks"><BlocksRenderer content={resetRoomDesc} /></div>
              )}
              {resetRoomPrice && <p className="com-price">{resetRoomPrice}</p>}
              {resetRoomFeatures.length > 0 && (
                <ul className="com-features">
                  {resetRoomFeatures.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              )}
              <Link href="/community/membership" className="com-link">Join the Reset Room <span>&rarr;</span></Link>
            </div>
            <div className="com-section-image reveal" style={{ background: 'linear-gradient(160deg,#e0d4c8,#d2c4b6)' }} />
          </div>
        </section>
      )}

      {/* Events + Resources grid — hides individual cards if empty */}
      {((eventsTitle || eventsDesc) || (resourcesTitle || resourcesDesc)) && (
        <section className="com-grid-section">
          <div className="com-grid">
            {(eventsTitle || eventsDesc) && (
              <Link href="/community/events" className="com-card reveal">
                {eventsTitle && <h3>{eventsTitle}</h3>}
                {eventsDesc && <p>{eventsDesc}</p>}
                <span className="com-card-link">View calendar <span>&rarr;</span></span>
              </Link>
            )}
            {(resourcesTitle || resourcesDesc) && (
              <Link href="/community/resources" className="com-card reveal rd1">
                {resourcesTitle && <h3>{resourcesTitle}</h3>}
                {resourcesDesc && <p>{resourcesDesc}</p>}
                <span className="com-card-link">Browse resources <span>&rarr;</span></span>
              </Link>
            )}
          </div>
        </section>
      )}
    <UpsellBlockForSingleton endpoint="/community-page" />
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
.com-body-blocks p { margin-bottom:0.8rem; }
.com-body-blocks a { color:#6E3A5A; text-decoration:underline; text-decoration-thickness:1px; text-underline-offset:3px; }
.com-body-blocks a:hover { color:#5A2E4A; text-decoration-thickness:2px; }
.com-body-blocks strong { font-weight:600; color:#231F20; }
.com-body-blocks em { font-style:italic; }
.com-body-blocks h2, .com-body-blocks h3 { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:400; color:#231F20; margin:1.2rem 0 0.6rem; line-height:1.3; }
.com-body-blocks ul, .com-body-blocks ol { padding-left:1.5rem; margin-bottom:0.8rem; }
.com-body-blocks li { margin-bottom:0.3rem; }
.com-body-blocks blockquote { border-left:3px solid #6E3A5A; padding-left:1rem; margin:0.8rem 0; font-style:italic; color:#5A5A54; }
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
