import { Metadata } from 'next';
import { getPractitioners, getPractitionersPage, getFAQs, type Practitioner } from '@/lib/cms';
import FAQAccordion from '@/components/FAQAccordion';
import PractitionerEnquiryButton from '@/components/PractitionerEnquiryButton';
import UpsellBlock, { type UpsellItem } from '@/components/UpsellBlock';
import { BreadcrumbSchema } from '@/components/StructuredData';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPractitionersPage();
  return {
    title: page.title,
    description: page.tagline,
    alternates: { canonical: '/practitioners' },
    openGraph: {
      title: page.title,
      description: page.tagline,
      url: '/practitioners',
    },
  };
}

/**
 * /practitioners — Anna's trusted-circle directory page.
 *
 * Mirrors the /testimonials layout: 3-column grid of practitioner cards,
 * with "banner" entries (display_style='banner') interspersed as
 * full-width dark sections between every group of 6 cards. Card clicks
 * go to each practitioner's external website.
 *
 * Each card adapts to what's filled on the entry:
 *  - Portrait uploaded → portrait card with photo + bio
 *  - No portrait → text-only card
 *  - Always shows: name, role, bio, location, optional Instagram link
 */
export default async function PractitionersPage() {
  const [page, all, faqs] = await Promise.all([
    getPractitionersPage(),
    getPractitioners(),
    getFAQs({ page: 'practitioners' }).catch(() => []),
  ]);

  const cards = all.filter((p) => p.displayStyle !== 'banner');
  const banners = all.filter((p) => p.displayStyle === 'banner');

  // Interleave: every 6 cards, drop a banner. Trim banners if too few.
  const rows: Array<{ type: 'cards'; items: Practitioner[] } | { type: 'banner'; item: Practitioner }> = [];
  let bannerIdx = 0;
  for (let i = 0; i < cards.length; i += 6) {
    rows.push({ type: 'cards', items: cards.slice(i, i + 6) });
    if (bannerIdx < banners.length && i + 6 < cards.length) {
      rows.push({ type: 'banner', item: banners[bannerIdx++] });
    }
  }
  while (bannerIdx < banners.length) {
    rows.push({ type: 'banner', item: banners[bannerIdx++] });
  }

  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Practitioners', href: '/practitioners' }]} />
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <section className="pr-hero">
        <div className="pr-hero-inner">
          <p className="pr-kicker" style={{ color: page.kickerColour }}>{page.kicker}</p>
          <h1 className="pr-title">{page.title}</h1>
          {page.tagline && <p className="pr-tagline">{page.tagline}</p>}
        </div>
      </section>

      {all.length === 0 ? (
        <section className="pr-empty">
          <p>Practitioner directory coming soon. Anna is building this circle.</p>
        </section>
      ) : (
        <section className="pr-body">
          {rows.map((row, ri) => row.type === 'cards' ? (
            <div key={`r-${ri}`} className="pr-grid">
              {row.items.map((p) => <PractitionerCard key={p.id} p={p} />)}
            </div>
          ) : (
            <BannerPractitioner key={`b-${ri}`} p={row.item} />
          ))}
        </section>
      )}

      <PractitionerEnquiryButton accentColour="#6E3A5A" />
      <FAQAccordion faqs={faqs} accentColour="#6E3A5A" background="#fff" />
      <UpsellBlock items={page.upsells as unknown as UpsellItem[]} title="Where next." kicker="Continue exploring" />
    </>
  );
}

function PractitionerCard({ p }: { p: Practitioner }) {
  const card = (
    <>
      {p.portraitUrl ? (
        <div className="pr-card-photo" style={{ backgroundImage: `url('${p.portraitUrl}')` }} />
      ) : null}
      <div className="pr-card-body">
        <p className="pr-card-name">{p.name}</p>
        {p.role && <p className="pr-card-role">{p.role}</p>}
        {p.bio && <p className="pr-card-bio">{p.bio}</p>}
        {(p.location || p.instagramHandle) && (
          <p className="pr-card-meta">
            {p.location && <span>{p.location}</span>}
            {p.location && p.instagramHandle && <span className="pr-card-dot"> · </span>}
            {p.instagramHandle && <span>@{p.instagramHandle}</span>}
          </p>
        )}
        {p.websiteUrl && <span className="pr-card-link">Visit website &rarr;</span>}
      </div>
    </>
  );

  if (p.websiteUrl) {
    return (
      <a className="pr-card pr-card-link-wrap" href={p.websiteUrl} target="_blank" rel="noopener">
        {card}
      </a>
    );
  }
  return <article className="pr-card">{card}</article>;
}

function BannerPractitioner({ p }: { p: Practitioner }) {
  const body = (
    <>
      <div className="pr-banner-media">
        {p.portraitUrl ? (
          <div className="pr-banner-photo" style={{ backgroundImage: `url('${p.portraitUrl}')` }} />
        ) : (
          <div className="pr-banner-quotemark">&ldquo;</div>
        )}
      </div>
      <div className="pr-banner-text">
        <p className="pr-banner-name">{p.name}</p>
        {p.role && <p className="pr-banner-role">{p.role}</p>}
        {p.bio && <p className="pr-banner-bio">{p.bio}</p>}
        {(p.location || p.instagramHandle) && (
          <p className="pr-banner-meta">
            {p.location && <span>{p.location}</span>}
            {p.location && p.instagramHandle && <span> · </span>}
            {p.instagramHandle && <span>@{p.instagramHandle}</span>}
          </p>
        )}
        {p.websiteUrl && <span className="pr-banner-link">Visit {p.name.split(' ')[0]}&rsquo;s website &rarr;</span>}
      </div>
    </>
  );

  if (p.websiteUrl) {
    return (
      <a className="pr-banner pr-banner-link-wrap" href={p.websiteUrl} target="_blank" rel="noopener">
        <div className="pr-banner-inner">{body}</div>
      </a>
    );
  }
  return (
    <aside className="pr-banner">
      <div className="pr-banner-inner">{body}</div>
    </aside>
  );
}

const pageStyles = `
.pr-hero { background:#E8DAE4; padding:3rem 2rem 2rem; text-align:center; }
.pr-hero-inner { max-width:880px; margin:0 auto; }
.pr-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:0.5rem; }
.pr-title { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:clamp(2.2rem,5vw,3.4rem); color:#231F20; line-height:1.2; margin-bottom:0.8rem; font-style:italic; text-wrap:balance; }
.pr-tagline { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; color:#3D3D3A; line-height:1.7; max-width:680px; margin:0 auto; }

.pr-empty { background:#fff; padding:3rem 2rem; text-align:center; }
.pr-empty p { font-family:'EB Garamond',Georgia,serif; font-style:italic; color:#8C8880; }

.pr-body { background:#F9F6F1; padding:2rem 2rem 3rem; }
.pr-grid { max-width:1200px; margin:0 auto 1rem; display:grid; grid-template-columns:repeat(3,1fr); gap:1.2rem; }
@media (max-width:900px) { .pr-grid { grid-template-columns:repeat(2,1fr); } }
@media (max-width:640px) { .pr-grid { grid-template-columns:1fr; } }

.pr-card { background:#fff; border-radius:8px; overflow:hidden; padding:0; display:flex; flex-direction:column; box-shadow:0 1px 3px rgba(0,0,0,0.04); transition:transform 0.2s, box-shadow 0.2s; }
.pr-card-link-wrap { text-decoration:none; color:inherit; cursor:pointer; }
.pr-card-link-wrap:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.08); }
.pr-card-photo { aspect-ratio:1; background-size:cover; background-position:center; background-color:#EDE8DF; }
.pr-card-body { padding:1.2rem 1.3rem 1.4rem; display:flex; flex-direction:column; gap:0.5rem; flex:1; }
.pr-card-name { font-family:'EB Garamond',Georgia,serif; font-weight:500; font-size:1.2rem; color:#231F20; line-height:1.25; margin:0; }
.pr-card-role { font-family:Mulish,sans-serif; font-weight:600; font-size:0.6rem; letter-spacing:0.2em; text-transform:uppercase; color:#6E3A5A; margin:0; }
.pr-card-bio { font-family:'EB Garamond',Georgia,serif; font-size:0.95rem; color:#3D3D3A; line-height:1.65; margin:0; flex:1; }
.pr-card-meta { font-family:Mulish,sans-serif; font-size:0.65rem; letter-spacing:0.08em; color:#8C8880; margin:0; }
.pr-card-dot { color:rgba(0,0,0,0.25); }
.pr-card-link { font-family:Mulish,sans-serif; font-weight:600; font-size:0.65rem; letter-spacing:0.16em; text-transform:uppercase; color:#6E3A5A; margin-top:0.4rem; }
.pr-card:hover .pr-card-link { color:#231F20; }

.pr-banner { background:#231F20; color:#F5F3EF; padding:3rem 2rem; margin:1.5rem auto; border-radius:8px; max-width:1200px; display:block; text-decoration:none; transition:transform 0.2s; }
.pr-banner-link-wrap:hover { transform:translateY(-2px); }
.pr-banner-inner { display:grid; grid-template-columns:1fr 1.4fr; gap:2.5rem; align-items:center; max-width:1100px; margin:0 auto; }
.pr-banner-media { display:flex; justify-content:center; }
.pr-banner-photo { aspect-ratio:1; width:100%; max-width:340px; background-size:cover; background-position:center; border-radius:50%; box-shadow:0 12px 40px rgba(0,0,0,0.4); }
.pr-banner-quotemark { font-family:'EB Garamond',Georgia,serif; font-size:14rem; line-height:0.8; color:#6E3A5A; opacity:0.5; text-align:center; }
.pr-banner-name { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:1.8rem; color:#FAA21B; margin:0 0 0.3rem; font-style:italic; }
.pr-banner-role { font-family:Mulish,sans-serif; font-weight:600; font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:#E8DAE4; margin:0 0 1rem; }
.pr-banner-bio { font-family:'EB Garamond',Georgia,serif; font-size:1.1rem; line-height:1.7; color:#F5F3EF; margin:0 0 1rem; }
.pr-banner-meta { font-family:Mulish,sans-serif; font-size:0.7rem; letter-spacing:0.1em; color:rgba(245,243,239,0.65); margin:0 0 0.8rem; }
.pr-banner-link { font-family:Mulish,sans-serif; font-weight:600; font-size:0.75rem; letter-spacing:0.18em; text-transform:uppercase; color:#FAA21B; }
@media (max-width:700px) { .pr-banner-inner { grid-template-columns:1fr; gap:1.5rem; text-align:center; } .pr-banner-media { max-width:240px; margin:0 auto; } }
`;
