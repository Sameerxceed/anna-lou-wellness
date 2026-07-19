import { Metadata } from 'next';
import Link from 'next/link';
import { getCoachingSessions, getFAQs, getWorkWithAnnaPage } from '@/lib/cms';
import { ServiceSchema, BreadcrumbSchema } from '@/components/StructuredData';
import FAQAccordion from '@/components/FAQAccordion';
import UpsellBlockForSingleton from '@/components/UpsellBlockForSingleton';

export const metadata: Metadata = {
  title: 'Work with Anna',
  description: 'Somatic coaching with Anna Lou. The Signal Method, 1:1 sessions, founder reset, dating reset, nervous system reset.',
  alternates: { canonical: '/the-work' },
  openGraph: {
    title: 'Work with Anna — Anna Lou Wellness',
    description: 'Somatic coaching with Anna Lou. The Signal Method and 1:1 sessions.',
    url: '/the-work',
  },
};

// Hardcoded fallback used only if the CMS singleton is unreachable. Anna
// edits the live content via Quick Edit > Work with Anna.
const pageFallback = {
  kicker: 'Work with Anna',
  kickerColour: '#F280AA',
  title: 'Your inner world already knows.',
  intro: 'Most people arrive here after trying everything else. The therapy. The journalling. The courses. The spiritual work. Getting all the way to the insight, and then hitting the same wall. This work meets you in the body, where the patterns actually live.',
  waysSectionTitle: 'Ways to Work With Me',
  waysSectionBody: 'The Signal Method™ is the umbrella for all the coaching work here. Underneath it sit the programmes, each designed for a different stage of the journey. Whether you are just beginning to notice the patterns, or you are ready to rewire them completely, there is a way in.',
  waysSectionCtaLabel: 'What do you need right now?',
  waysSectionCtaUrl: '/the-work/quiz',
  programmesKicker: 'Programmes',
  programmesTitle: 'Four ways to begin.',
};

export default async function TheWorkPage() {
  const [sessions, hubFaqs, legacyFaqs, page] = await Promise.all([
    getCoachingSessions(),
    getFAQs({ page: 'the-work' }),
    getFAQs('coaching'),
    getWorkWithAnnaPage(pageFallback),
  ]);
  const faqs = hubFaqs.length > 0 ? hubFaqs : legacyFaqs;

  // All-or-nothing per section (Anna 14 Jul policy).
  const hasHeader = !!(page.kicker || page.title || page.intro);
  const kicker = hasHeader ? page.kicker : pageFallback.kicker;
  const kickerColour = hasHeader ? (page.kickerColour || pageFallback.kickerColour) : pageFallback.kickerColour;
  const title = hasHeader ? page.title : pageFallback.title;
  const intro = hasHeader ? page.intro : pageFallback.intro;

  const hasWays = !!(page.waysSectionTitle || page.waysSectionBody || page.waysSectionCtaLabel || page.waysSectionCtaUrl);
  const waysSectionTitle = hasWays ? page.waysSectionTitle : pageFallback.waysSectionTitle;
  const waysSectionBody = hasWays ? page.waysSectionBody : pageFallback.waysSectionBody;
  const waysSectionCtaLabel = hasWays ? page.waysSectionCtaLabel : pageFallback.waysSectionCtaLabel;
  const waysSectionCtaUrl = hasWays ? page.waysSectionCtaUrl : pageFallback.waysSectionCtaUrl;

  const hasProgrammesLabels = !!(page.programmesKicker || page.programmesTitle);
  const programmesKicker = hasProgrammesLabels ? page.programmesKicker : pageFallback.programmesKicker;
  const programmesTitle = hasProgrammesLabels ? page.programmesTitle : pageFallback.programmesTitle;

  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Work with Anna', href: '/the-work' }]} />
      <ServiceSchema name="Somatic Coaching with Anna Lou" description="1:1 coaching sessions using The Signal Method. Nervous system regulation, emotional healing, and personal transformation." url="/the-work" />
      <style dangerouslySetInnerHTML={{ __html: workStyles }} />

      {/* Header — each field hides if empty */}
      {(kicker || title || intro) && (
        <section className="work-header">
          <div className="work-header-inner reveal">
            {kicker && <p className="work-kicker" style={{ color: kickerColour }}>{kicker}</p>}
            {title && <h1 className="work-title">{title}</h1>}
            {intro && <p className="work-intro">{intro}</p>}
          </div>
        </section>
      )}

      {/* Ways to work — hides entire section when empty */}
      {(waysSectionTitle || waysSectionBody || waysSectionCtaLabel) && (
        <section className="work-ways">
          <div className="work-ways-inner">
            <div className="reveal">
              {waysSectionTitle && <h2 className="work-section-title">{waysSectionTitle}</h2>}
              {waysSectionBody && <p className="work-body">{waysSectionBody}</p>}
              <div className="work-cta-group">
                {waysSectionCtaLabel && waysSectionCtaUrl && (
                  <Link href={waysSectionCtaUrl} className="work-cta-primary">{waysSectionCtaLabel} <span>&rarr;</span></Link>
                )}
                <Link href="/ask-anna" className="work-cta-primary">Ask Anna for a recommendation <span>&rarr;</span></Link>
              </div>
            </div>
            <div className="work-image reveal rd1" />
          </div>
        </section>
      )}

      {/* 1:1 Sessions — kicker/title from CMS, cards from Coaching Session collection */}
      <section className="work-sessions">
        <div className="work-sessions-inner">
          {programmesKicker && <p className="work-kicker reveal">{programmesKicker}</p>}
          {programmesTitle && <h2 className="work-section-title reveal rd1">{programmesTitle}</h2>}
          <div className="work-sessions-grid">
            {sessions.length > 0 ? sessions.map((session, i) => {
              // Anna 14 Jul feedback: all Learn More links used to point at
              // /the-work/sessions. Now each card links to its own programme
              // page — /the-work/the-reset, /the-work/signal, etc. Falls
              // back to the sessions hub if the slug isn't wired to a page.
              const cardHref = session.slug
                ? `/the-work/${session.slug}`
                : '/the-work/sessions';
              return (
                <div key={session.slug} className={`work-session-card reveal${i > 0 ? ` rd${i}` : ''}`}>
                  <h3>{session.name}</h3>
                  <p>{session.description.split('\n\n')[0].slice(0, 150)}...</p>
                  {session.priceLabel && <p className="work-card-price">{session.priceLabel}{session.duration ? ` · ${session.duration}` : ''}</p>}
                  <Link href={cardHref} className="work-card-link">Learn more <span>&rarr;</span></Link>
                </div>
              );
            }) : (
            <>
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
            </>
            )}
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

      <FAQAccordion faqs={faqs} accentColour="#F280AA" background="#fff" />

      {/* Decoder quiz CTA */}
      <section className="work-free reveal">
        <p className="work-kicker">Start here</p>
        <h2 className="work-section-title">The Nervous System Decoder</h2>
        <p className="work-body" style={{ maxWidth: '550px', margin: '0 auto 1.5rem', textAlign: 'center' }}>Five short questions to read where your inner guidance system is right now — and a practice you can use today.</p>
        <Link href="/free/nervous-system-decoder" className="work-download-btn">Begin the Decoder <span>&rarr;</span></Link>
      </section>
    <UpsellBlockForSingleton endpoint="/work-with-anna-page" />
    </>
  );
}

const workStyles = `
.work-header { background:#fff; padding:2.5rem 3rem 1.5rem; text-align:center; }
.work-header-inner { max-width:900px; margin:0 auto; }
.work-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:#F280AA; margin-bottom:0.5rem; }
.work-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:300; font-size:clamp(2rem,5vw,3.2rem); color:#231F20; letter-spacing:0.05em; line-height:1.1; margin-bottom:1rem; }
.work-intro { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; color:#3D3D3A; line-height:1.85; max-width:800px; margin:0 auto; }
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

.work-faqs { background:#fff; padding:2rem 3rem; }
.work-faqs-inner { max-width:800px; margin:0 auto; text-align:center; }
.work-faq-list { text-align:left; margin-top:1.5rem; }
.work-faq-item { border-bottom:1px solid rgba(0,0,0,0.06); }
.work-faq-q { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:400; font-size:0.95rem; color:#231F20; padding:1rem 0; cursor:pointer; list-style:none; display:flex; justify-content:space-between; align-items:center; }
.work-faq-q::after { content:'+'; font-size:1.2rem; color:#8C8880; transition:transform 0.3s; }
details[open] .work-faq-q::after { content:'−'; }
.work-faq-a { font-family:'EB Garamond',Georgia,serif; font-size:0.95rem; color:#3D3D3A; line-height:1.8; padding:0 0 1rem; }

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
