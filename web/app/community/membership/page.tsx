import { Metadata } from 'next';
import Link from 'next/link';
import JoinResetRoomButton from '@/components/JoinResetRoomButton';
import FAQAccordion from '@/components/FAQAccordion';
import { getMembershipPage, getFAQs } from '@/lib/cms';
import UpsellBlockForSingleton from '@/components/UpsellBlockForSingleton';
import BlocksRenderer from '@/components/BlocksRenderer';

export const metadata: Metadata = {
  title: 'The Reset Room',
  description: 'Monthly membership: live group calls, workshop replays, Signal Method workbook, community. £25/month.',
};

// Hardcoded fallback used only if CMS singleton is missing/unreachable. Anna
// edits the live copy via Quick Edit > Pages > /community/membership.
const fallback = {
  kicker: 'Community',
  title: 'The Reset Room',
  paragraphsBlocks: null,
  paragraphs: [
    'The Reset Room is the monthly membership for people who want ongoing access to the work without the commitment of a full programme.',
    'For £25 per month you get: one live group session per month (90 minutes, hosted on Zoom, recorded for those who cannot attend live), full access to the resource library including the Signal Method™ workbook and all past workshop recordings, a monthly Signal Check delivered to your inbox, and the Reset Room community.',
    'It is for people who have done some work and want to keep going. For people who are not ready for 1:1 but know they need more than occasional workshops. For people who want community as part of their practice.',
    'It is also the most natural next step after a workshop. You came to Signal Reset Day. Something shifted. You want to keep that aliveness going. This is where you come.',
    'Cancel any time. First month free for anyone who has attended a paid workshop in the last three months.',
  ],
  priceLabel: '£25 per month',
  includesLabel: 'Live group session, replay library, workbook, community',
  commitmentLabel: 'Cancel any time',
  trialLabel: 'First month free after paid workshop',
  ctaLabel: 'Join the Reset Room',
};

export default async function MembershipPage() {
  const [page, faqs] = await Promise.all([
    getMembershipPage(fallback),
    getFAQs({ page: 'membership' }),
  ]);
  const details = [
    { label: 'Price', value: page.priceLabel },
    { label: 'Includes', value: page.includesLabel },
    { label: 'Commitment', value: page.commitmentLabel },
    { label: 'Trial', value: page.trialLabel },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <article className="mem-page">
        <div className="mem-inner">
          <p className="mem-kicker">{page.kicker}</p>
          <h1 className="mem-title">{page.title}</h1>
          <div className="mem-content mem-content-blocks">
            {page.paragraphsBlocks ? (
              <BlocksRenderer content={page.paragraphsBlocks} />
            ) : (
              page.paragraphs.map((p, i) => <p key={i}>{p}</p>)
            )}
          </div>
          <div className="mem-details">
            {details.map((d, i) => (
              <div key={i} className="mem-detail-row">
                <span className="mem-detail-label">{d.label}</span>
                <span className="mem-detail-value">{d.value}</span>
              </div>
            ))}
          </div>
          <div className="mem-cta">
            <JoinResetRoomButton label={page.ctaLabel} className="mem-cta-btn" />
          </div>
          <Link href="/community" className="mem-back">&larr; Back to Community</Link>
        </div>
      </article>
      <FAQAccordion faqs={faqs} accentColour="#6E3A5A" background="#F5F3EF" />
    <UpsellBlockForSingleton endpoint="/membership-page" />
    </>
  );
}

const styles = `
.mem-page { background:#fff; padding:2rem 3rem 3rem; }
.mem-inner { max-width:900px; margin:0 auto; }
.mem-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.18em; text-transform:uppercase; margin-bottom:0.5rem; text-align:center; color:#6E3A5A; }
.mem-title { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:clamp(1.8rem,4vw,2.6rem); color:#231F20; line-height:1.3; margin-bottom:2rem; text-align:center; }
.mem-content { font-family:'EB Garamond',Georgia,serif; font-size:1.1rem; color:#3D3D3A; line-height:1.9; margin-bottom:2.5rem; }
.mem-content p { margin-bottom:1.2rem; }
.mem-content-blocks a { color:#6E3A5A; text-decoration:underline; text-decoration-thickness:1px; text-underline-offset:3px; }
.mem-content-blocks a:hover { color:#5A2E4A; text-decoration-thickness:2px; }
.mem-content-blocks strong { font-weight:600; color:#231F20; }
.mem-content-blocks em { font-style:italic; }
.mem-content-blocks h2, .mem-content-blocks h3 { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:400; color:#231F20; margin:1.2rem 0 0.6rem; line-height:1.3; }
.mem-content-blocks ul, .mem-content-blocks ol { padding-left:1.5rem; margin-bottom:1rem; }
.mem-content-blocks li { margin-bottom:0.3rem; }
.mem-content-blocks blockquote { border-left:3px solid #6E3A5A; padding-left:1rem; margin:1rem 0; font-style:italic; color:#5A5A54; }
.mem-details { margin-bottom:2rem; border-top:1px solid rgba(0,0,0,0.06); padding-top:1rem; }
.mem-detail-row { display:flex; justify-content:space-between; align-items:baseline; padding:0.5rem 0; border-bottom:1px solid rgba(0,0,0,0.04); }
.mem-detail-label { font-family:Mulish,sans-serif; font-weight:500; font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase; color:#8C8880; }
.mem-detail-value { font-family:'EB Garamond',Georgia,serif; font-size:1rem; color:#231F20; }
.mem-cta { text-align:center; margin-bottom:2rem; }
.mem-cta-btn { background:#6E3A5A; color:#fff; font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.85rem 2.2rem; border-radius:3px; border:1px solid #6E3A5A; cursor:pointer; transition:all 0.3s; display:inline-flex; align-items:center; gap:0.4rem; }
.mem-cta-btn:hover:not(:disabled) { opacity:0.9; }
.mem-back { font-family:Mulish,sans-serif; font-weight:400; font-size:0.65rem; letter-spacing:0.14em; text-transform:uppercase; color:#6E3A5A; border-bottom:1px solid #6E3A5A; padding-bottom:2px; text-decoration:none; display:inline-flex; align-items:center; gap:0.4rem; transition:gap 0.3s; }
.mem-back:hover { gap:0.7rem; }
@media (max-width:900px) { .mem-page { padding:1.5rem 1.2rem 2rem; } }
`;
