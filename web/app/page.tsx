import Link from 'next/link';
import { getFeaturedArticles, getArticles, getHomepage } from '@/lib/cms';
import { getStockImage, stockCategoryForSection } from '@/data/stock-images';
import { mediaUrl } from '@/lib/strapi';

// Section mapping for article links
const sectionPaths: Record<string, string> = {
  'reset-stories': '/reset-stories',
  'life': '/life',
  'love-and-relationships': '/love-and-relationships',
  'work-and-money': '/work-and-money',
};

// Pull a string field from Strapi homepage with fallback. Empty/null/undefined → fallback.
const f = (cms: Record<string, unknown> | null, key: string, fallback: string): string => {
  const v = cms?.[key];
  return typeof v === 'string' && v.trim() ? v : fallback;
};

export default async function HomePage() {
  const [featuredArticles, recentArticles, homepage] = await Promise.all([
    getFeaturedArticles(1),
    getArticles(),
    getHomepage(),
  ]);

  const featured = featuredArticles[0] || null;
  const gridArticles = recentArticles.filter(a => !a.isFeatured).slice(0, 3);
  const cms = (homepage as Record<string, unknown> | null) ?? null;
  const heroImageUrl = mediaUrl(cms?.heroImage as { url?: string } | undefined);
  // Resolve the actual URL the hero will use, so we can preload it with
  // fetchpriority=high. Lighthouse flagged this as the missing piece for LCP.
  const heroImageActualUrl = heroImageUrl || getStockImage('hero', 'home-hero', 'portrait');
  const workImageUrl = mediaUrl(cms?.workImage as { url?: string } | undefined);
  const communityImageUrl = mediaUrl(cms?.communityImage as { url?: string } | undefined);
  const portraitImageUrl = mediaUrl(cms?.portraitImage as { url?: string } | undefined);

  return (
    <>
      {/* Preload the LCP hero image with fetchpriority=high so the browser
          starts downloading it before parsing the rest of the page. Next.js
          15 hoists <link> elements into <head> automatically. */}
      <link
        rel="preload"
        as="image"
        href={heroImageActualUrl}
        // @ts-expect-error — fetchPriority is valid HTML but missing from older React types
        fetchPriority="high"
      />

      {/* ═══ EDITORIAL FRAMING ═══ */}
      <div className="editorial-frame reveal">
        <p className="editorial-issue">{f(cms, 'issueLine', 'Issue No. 01 · Summer 2026')}</p>
        <p className="editorial-inside">{f(cms, 'insideThisIssueLine', 'Inside this issue')}</p>
      </div>

      {/* ═══ HERO ═══
           No .reveal here. Hero is above the fold = it's the LCP element,
           and .reveal hides content with opacity:0 until JS adds .visible
           (5.5s render delay per Lighthouse). The hero must paint
           immediately on first render. Below-the-fold sections keep
           .reveal for the scroll-in effect. */}
      <section className="hp-hero">
        <div className="hp-hero-inner">
          <div
            className="hp-hero-image has-image"
            style={{ backgroundImage: `url(${heroImageUrl || getStockImage('hero', 'home-hero', 'portrait')})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <div>
            <p className="hp-hero-tag">{f(cms, 'heroKicker', 'Reset Stories')}</p>
            <h1 className="hp-hero-title">{f(cms, 'heroTitle', 'Come back to yourself.')}</h1>
            <p className="hp-hero-body">{f(cms, 'heroBody', 'What does it actually feel like to live in full alignment with who you are? Not the managed version. Not the performing one. The whole one. We are exploring that here, through honest stories, real practices, and a life beautifully lived.')}</p>
            <div className="hp-hero-ctas">
              <Link href={f(cms, 'heroCtaPrimaryUrl', '/reset-stories')} className="cta-link cta-plum">{f(cms, 'heroCtaPrimaryLabel', 'Read the Reset Stories')} <span>&rarr;</span></Link>
              <Link href={f(cms, 'heroCtaSecondaryUrl', '/the-work')} className="cta-link cta-pink">{f(cms, 'heroCtaSecondaryLabel', 'Work with Anna')} <span>&rarr;</span></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURED RESET STORY ═══ */}
      <section className="hp-featured">
        <div className="hp-featured-inner">
          <div className="reveal">
            <div className="hp-featured-label">Featured Reset Story</div>
            <h2 className="hp-featured-title">{featured?.title || f(cms, 'featuredFallbackTitle', 'You are not overwhelmed. You are holding everything.')}</h2>
            <div className="hp-featured-meta">By {featured?.author || f(cms, 'featuredFallbackAuthor', 'Anna Lou')} &middot; {featured?.readingTime || f(cms, 'featuredFallbackReadingTime', '6 min read')}</div>
            <p className="hp-featured-excerpt"><span className="drop-cap">{(featured?.excerpt || f(cms, 'featuredFallbackExcerpt', 'T'))[0]}</span>{(featured?.excerpt || f(cms, 'featuredFallbackExcerpt', '')).slice(1)}</p>
            <Link href={featured ? `${sectionPaths[featured.category?.section || 'reset-stories'] || '/reset-stories'}/${featured.slug}` : '/reset-stories'} className="cta-link cta-plum">Continue reading <span>&rarr;</span></Link>
          </div>
          <div
            className="hp-featured-image has-image reveal rd1"
            style={{ backgroundImage: `url(${featured?.heroImage || getStockImage(stockCategoryForSection(featured?.category?.section || 'reset-stories'), featured?.slug || 'featured', 'hero')})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
        </div>
      </section>

      {/* ═══ ARTICLE GRID ═══ */}
      <section className="hp-articles">
        <div className="hp-articles-grid">
          {gridArticles.map((article, i) => {
            const section = article.category?.section || 'reset-stories';
            const sectionPath = sectionPaths[section] || '/reset-stories';
            return (
              <Link key={article.slug} href={`${sectionPath}/${article.slug}`} className={`article-card reveal${i > 0 ? ` rd${i}` : ''}`}>
                <div
                  className="article-card-img has-image"
                  style={{ backgroundImage: `url(${article.heroImage || getStockImage(stockCategoryForSection(article.category?.section || 'reset-stories'), article.slug)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
                <div className="article-card-body">
                  <p className="article-card-cat" style={{ color: article.category?.colour || '#6E3A5A' }}>{article.category?.name || 'Stories'}</p>
                  <h3 className="article-card-title">{article.title}</h3>
                  <p className="article-card-date">{article.readingTime}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══ MANTRA STRIP ═══ */}
      <section className="hp-mantras reveal">
        <p className="hp-mantra-text">{f(cms, 'mantra1', 'You don’t have to hold all of this. Come back to yourself.')}</p>
      </section>

      {/* ═══ QUOTE SLIDE #1 ═══ */}
      <section className="hp-quote reveal">
        <p className="hp-quote-text">&ldquo;{f(cms, 'quote1Text', 'Maybe the next level isn’t about managing everything more gracefully. Maybe it’s about not gripping so tightly in the first place.')}&rdquo;</p>
        <p className="hp-quote-attr">{f(cms, 'quote1Attribution', 'Anna Lou')}</p>
      </section>

      {/* ═══ THE WORK — magazine first, no pricing ═══ */}
      <section className="hp-work">
        <div className="hp-work-inner">
          <div className="reveal">
            <p className="hp-kicker" style={{ color: '#F280AA' }}>{f(cms, 'workKicker', 'Work with Anna')}</p>
            <h2 className="hp-section-title">{f(cms, 'workTitle', 'Your inner world already knows.')}</h2>
            <p className="hp-body">{f(cms, 'workBody1', 'Most people arrive here after trying everything else. The therapy. The journalling. The courses. The spiritual work. Getting all the way to the insight, and then hitting the same wall. This work meets you in the body, where the patterns actually live.')}</p>
            <p className="hp-body" style={{ marginBottom: '1.5rem' }}>{f(cms, 'workBody2', 'The Signal Method™ is the umbrella for all the coaching work here. Underneath it sit the programmes, each designed for a different stage of the journey.')}</p>
            <div className="hp-cta-group">
              <Link href={f(cms, 'workCtaPrimaryUrl', '/the-work')} className="cta-link cta-pink">{f(cms, 'workCtaPrimaryLabel', 'Start with the free Nervous System Decoder')} <span>&rarr;</span></Link>
              <Link href={f(cms, 'workCtaSecondaryUrl', '/the-work/ways-to-work-with-me')} className="cta-link cta-muted">{f(cms, 'workCtaSecondaryLabel', 'Explore all the ways to work')} <span>&rarr;</span></Link>
            </div>
          </div>
          <div
            className="hp-work-image has-image reveal rd2"
            style={{ backgroundImage: `url(${workImageUrl || getStockImage('programmes', 'work-section', 'portrait')})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
        </div>
      </section>

      {/* ═══ EDITORIAL SECTIONS: Life, Love, Work ═══ */}
      <section className="hp-editorial-sections">
        <div className="hp-editorial-header reveal">
          <p className="hp-kicker" style={{ color: '#FAA21B' }}>{f(cms, 'exploreKicker', 'Explore')}</p>
          <h2 className="hp-section-title">{f(cms, 'exploreTitle', 'Life, Love, and Work')}</h2>
        </div>
        <div className="hp-editorial-grid">
          <Link href="/life" className="hp-editorial-tile reveal" style={{ borderLeft: '3px solid #FAA21B' }}>
            <h3 style={{ color: '#FAA21B' }}>Life</h3>
            <p>{f(cms, 'exploreLifeBody', 'Rituals and energy, home and space, style and beauty, food and nourishment, weekend finds.')}</p>
          </Link>
          <Link href="/love-and-relationships" className="hp-editorial-tile reveal rd1" style={{ borderLeft: '3px solid #F280AA' }}>
            <h3 style={{ color: '#F280AA' }}>Love &amp; Relationships</h3>
            <p>{f(cms, 'exploreLoveBody', 'Dating and patterns, breakups and reset, friendship, motherhood, self worth and identity.')}</p>
          </Link>
          <Link href="/work-and-money" className="hp-editorial-tile reveal rd2" style={{ borderLeft: '3px solid #FFD07A' }}>
            <h3 style={{ color: '#FFD07A' }}>Work &amp; Money</h3>
            <p>{f(cms, 'exploreWorkBody', 'Founder reset, burnout and nervous system, Signal Method™, career and direction, money and worth.')}</p>
          </Link>
        </div>
      </section>

      {/* ═══ QUOTE SLIDE #2 ═══ */}
      <section className="hp-quote reveal">
        <p className="hp-quote-text">&ldquo;{f(cms, 'quote2Text', 'Your inner guidance system was never broken. It was waiting for you to stop overriding it.')}&rdquo;</p>
        <p className="hp-quote-attr">{f(cms, 'quote2Attribution', 'Anna Lou')}</p>
      </section>

      {/* ═══ EXPERIENCES — magazine first, no pricing ═══ */}
      <section className="hp-experiences">
        <div className="hp-experiences-inner">
          <div className="reveal">
            <p className="hp-kicker" style={{ color: '#7BAFDD' }}>{f(cms, 'experiencesKicker', 'Experiences')}</p>
            <h2 className="hp-section-title">{f(cms, 'experiencesTitle', 'Workshops, retreats, and reset days.')}</h2>
          </div>
          <p className="hp-body reveal">{f(cms, 'experiencesBody', 'Group sessions held on the houseboat at Taggs Island, online, and in corporate spaces. A few times a year, a small group comes to the island for a full reset day. Water outside, no agenda, just space to come back to yourself.')}</p>
          <Link href="/experiences" className="cta-link cta-blue reveal">{f(cms, 'experiencesCtaLabel', 'Browse all experiences')} <span>&rarr;</span></Link>
        </div>
      </section>

      {/* ═══ RESET LETTERS / SUBSTACK ═══ */}
      <section className="hp-newsletter reveal">
        <p className="hp-kicker" style={{ color: '#6E3A5A' }}>{f(cms, 'newsletterKicker', 'Reset Letters')}</p>
        <h2 className="hp-newsletter-title">{f(cms, 'newsletterTitle', 'A letter, every week, that feels like coming home.')}</h2>
        <p className="hp-newsletter-body">{f(cms, 'newsletterBody', 'Honest, beautiful writing about your inner world, jewellery with meaning, houseboat life, and what it actually feels like to return to yourself.')}</p>
        <div className="hp-newsletter-tiers">
          <div className="hp-newsletter-tier">
            <strong>{f(cms, 'newsletterFreeTierLabel', 'Free')}</strong>
            {f(cms, 'newsletterFreeTierBody', 'One letter a month. The last Friday digest with a personal note from Anna.')}
          </div>
          <div className="hp-newsletter-tier">
            <strong>{f(cms, 'newsletterPlusTierLabel', 'Plus')}</strong>
            {f(cms, 'newsletterPlusTierBody', 'Everything weekly. Full Sunday Cosmic Forecast, Wednesday Signal Check, Friday ESJ Drop, monthly Reset Story, full archive, early event access.')}
          </div>
        </div>
        <a href={f(cms, 'newsletterCtaUrl', 'https://annalouwellness.substack.com')} className="hp-btn-substack">{f(cms, 'newsletterCtaLabel', 'Join on Substack →')}</a>
        <p className="hp-newsletter-small" style={{ marginTop: '0.6rem' }}>
          <Link href="/cosmic-forecast" className="cta-link cta-plum" style={{ fontSize: '0.7rem' }}>Read this week&rsquo;s Cosmic Forecast summary &rarr;</Link>
        </p>
        <p className="hp-newsletter-small">{f(cms, 'newsletterMicrocopy', 'No spam. Honest writing. Cancel any time.')}</p>
      </section>

      {/* ═══ SHOP PREVIEW ═══ */}
      <section className="hp-shop">
        <div className="hp-shop-inner">
          <p className="hp-kicker reveal" style={{ color: '#5DCAA5' }}>{f(cms, 'shopKicker', 'Anna Lou of London')}</p>
          <h2 className="hp-section-title reveal rd1">{f(cms, 'shopTitle', 'Jewellery with meaning. Made to be worn.')}</h2>
          <p className="hp-body reveal rd2">{f(cms, 'shopBody', 'I have been designing jewellery for over twenty-five years. What I have learned, across all of that, is that the pieces that actually matter are not the most expensive ones. They are the ones you reach for in hard moments. The ones that remind you.')}</p>
          <div className="hp-shop-grid">
            <div className="product-card reveal">
              <div
                className="product-img has-image"
                style={{ backgroundImage: `url(${getStockImage('product', 'product-1', 'card')})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              />
              <div className="product-info">
                <p className="product-hook">{f(cms, 'shopProduct1Hook', 'I reach for this one when I need to remember what is underneath the noise')}</p>
                <p className="product-name">{f(cms, 'shopProduct1Name', 'Moonstone Necklace')}</p>
              </div>
            </div>
            <div className="product-card reveal rd1">
              <div
                className="product-img has-image"
                style={{ backgroundImage: `url(${getStockImage('product', 'product-2', 'card')})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              />
              <div className="product-info">
                <p className="product-hook">{f(cms, 'shopProduct2Hook', 'For the days my mind is doing too much and I need clarity not calm')}</p>
                <p className="product-name">{f(cms, 'shopProduct2Name', 'Clear Quartz Necklace')}</p>
              </div>
            </div>
            <div className="product-card reveal rd2">
              <div
                className="product-img has-image"
                style={{ backgroundImage: `url(${getStockImage('product', 'product-3', 'card')})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              />
              <div className="product-info">
                <p className="product-hook">{f(cms, 'shopProduct3Hook', 'The word you keep coming back to, worn close to your throat')}</p>
                <p className="product-name">{f(cms, 'shopProduct3Name', 'Personalised Phrase Necklace')}</p>
              </div>
            </div>
          </div>
          <Link href="/shop" className="btn btn-green reveal">{f(cms, 'shopCtaLabel', 'Browse all jewellery')} &rarr;</Link>
        </div>
      </section>

      {/* ═══ MEDIA HUB ═══ */}
      <section className="hp-media">
        <div className="hp-media-inner">
          <p className="hp-kicker reveal" style={{ color: '#FFD07A' }}>{f(cms, 'mediaKicker', 'Watch · Listen · Read')}</p>
          <h2 className="hp-section-title reveal rd1">{f(cms, 'mediaTitle', 'The Reset with Anna.')}</h2>
          <div className="hp-media-grid">
            <a href={f(cms, 'mediaTile1Url', '#')} className="hp-media-tile reveal">
              <p className="hp-media-label">{f(cms, 'mediaTile1Label', 'YouTube')}</p>
              <h3 className="hp-media-tile-title">{f(cms, 'mediaTile1Title', 'Come Back to Yourself — daily mantras and practices.')}</h3>
              <p className="hp-media-meta">{f(cms, 'mediaTile1Meta', 'Video series')}</p>
              <span className="hp-media-link">Watch <span>&rarr;</span></span>
            </a>
            <a href={f(cms, 'mediaTile2Url', '#')} className="hp-media-tile reveal rd1">
              <p className="hp-media-label">{f(cms, 'mediaTile2Label', 'Podcast')}</p>
              <h3 className="hp-media-tile-title">{f(cms, 'mediaTile2Title', 'The Reset with Anna Lou — honest conversations about the inner world.')}</h3>
              <p className="hp-media-meta">{f(cms, 'mediaTile2Meta', 'Coming soon')}</p>
              <span className="hp-media-link">Listen <span>&rarr;</span></span>
            </a>
            <a href={f(cms, 'mediaTile3Url', 'https://annalouwellness.substack.com')} className="hp-media-tile reveal rd2">
              <p className="hp-media-label">{f(cms, 'mediaTile3Label', 'Substack')}</p>
              <h3 className="hp-media-tile-title">{f(cms, 'mediaTile3Title', 'Reset Letters — weekly writing that feels like coming home.')}</h3>
              <p className="hp-media-meta">{f(cms, 'mediaTile3Meta', 'Weekly newsletter')}</p>
              <span className="hp-media-link">Read <span>&rarr;</span></span>
            </a>
          </div>
        </div>
      </section>

      {/* ═══ QUOTE SLIDE #3 ═══ */}
      <section className="hp-quote reveal">
        <p className="hp-quote-text">&ldquo;{f(cms, 'quote3Text', 'The feeling itself moves through in ninety seconds if you let it. Nine years of running from ninety seconds of feeling is an extraordinary amount of cardio.')}&rdquo;</p>
        <p className="hp-quote-attr">{f(cms, 'quote3Attribution', 'Anna Lou')}</p>
      </section>

      {/* ═══ COMMUNITY ═══ */}
      <section className="hp-community">
        <div className="hp-community-inner">
          <div
            className="hp-community-image has-image reveal"
            style={{ backgroundImage: `url(${communityImageUrl || getStockImage('community', 'community-section', 'hero')})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <div className="reveal rd1">
            <p className="hp-kicker">{f(cms, 'communityKicker', 'Community')}</p>
            <h2 className="hp-section-title">{f(cms, 'communityTitle', 'Come and sit with us.')}</h2>
            <p className="hp-body">{f(cms, 'communityBody1', 'Every Tuesday I hold a circle at The Hare and the Moon, Twickenham. Donation-based. No agenda except being in the room together. Connection is not a concept. It is biological.')}</p>
            <p className="hp-body">{f(cms, 'communityBody2', 'The Returning Circle runs every week without exception. No waitlist needed. Come on Tuesday.')}</p>
            <p className="hp-body" style={{ marginBottom: '1.5rem' }}>{f(cms, 'communityBody3', 'A few times a year, a small group comes to Taggs Island, Hampton for a full reset day. Water outside, no agenda, just space to come back to yourself.')}</p>
            <div className="hp-cta-group">
              <Link href={f(cms, 'communityCta1Url', '/community/the-returning-circle')} className="btn-dark">{f(cms, 'communityCta1Label', 'The Returning Circle')}</Link>
              <Link href={f(cms, 'communityCta2Url', '/community/reset-room')} className="btn-dark">{f(cms, 'communityCta2Label', 'The Reset Room')}</Link>
              <Link href={f(cms, 'communityCta3Url', '/experiences/retreats')} className="btn-outline-dark-sm">{f(cms, 'communityCta3Label', 'Retreat days')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PORTRAIT OF ANNA ═══ */}
      <section className="hp-portrait">
        <div className="hp-portrait-inner">
          <div
            className="hp-portrait-image has-image reveal"
            style={{ backgroundImage: `url(${portraitImageUrl || getStockImage('about', 'anna-portrait', 'portrait')})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <div className="reveal rd1">
            <p className="hp-kicker" style={{ color: '#3D3D3A' }}>{f(cms, 'portraitKicker', 'About')}</p>
            <h2 className="hp-portrait-heading">{f(cms, 'portraitTitle', 'Twenty-five years leaves a trail.')}</h2>
            <p className="hp-portrait-body"><span className="drop-cap">{f(cms, 'portraitBody', 'F').charAt(0)}</span>{f(cms, 'portraitBody', 'From the first piece about someone selling handmade jewellery on Portobello Road, to the Drapers feature when the brand hit Harrods, Selfridges, and Harvey Nichols simultaneously, to QVC Japan appearances, to trade press coverage across two decades. For most of those years the press was about the brand and the jewellery. More recently the coverage has shifted. The coaching, the houseboat, the pivot.').slice(1)}</p>
            <Link href={f(cms, 'portraitCtaUrl', '/about')} className="cta-link" style={{ color: '#231F20', borderColor: '#231F20' }}>{f(cms, 'portraitCtaLabel', 'Read Anna’s story')} <span>&rarr;</span></Link>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="hp-testimonials">
        <div className="hp-testimonials-inner">
          <p className="hp-kicker reveal" style={{ color: '#3D3D3A' }}>Client Stories</p>
          <h2 className="hp-section-title reveal rd1">What happens when you come home to yourself.</h2>
          <div className="hp-testi-grid">
            <div className="hp-testi-card reveal" style={{ background: '#FCE8EF' }}>
              <p className="hp-testi-quote">&ldquo;I came to Anna feeling like I had done all the work and still was not quite arriving. Within three sessions something shifted I had been trying to reach for years.&rdquo;</p>
              <p className="hp-testi-author">Claudine, Founder</p>
            </div>
            <div className="hp-testi-card reveal rd1" style={{ background: '#E1F5EE' }}>
              <p className="hp-testi-quote">&ldquo;The Returning Circle changed something in me I did not know needed changing. Being in a room with people who are actually honest. I had forgotten what that felt like.&rdquo;</p>
              <p className="hp-testi-author">Susan, Coach</p>
            </div>
            <div className="hp-testi-card reveal rd2" style={{ background: '#E9EBF6' }}>
              <p className="hp-testi-quote">&ldquo;I have worked with therapists, coaches, healers. Anna does something different. She meets you in the body, not the story. That is where the change actually lives.&rdquo;</p>
              <p className="hp-testi-author">Nicky, Creative Director</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRESS & CREDENTIALS ═══ */}
      <section className="hp-press">
        <div className="hp-press-inner">
          <p className="hp-press-label">As seen in</p>
          <div className="hp-press-row">
            <span className="press-logo" style={{ fontFamily: 'Georgia,serif', fontWeight: 400, fontSize: '1.1rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>Harrods</span>
            <span className="press-logo" style={{ fontFamily: "'Times New Roman',serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Selfridges</span>
            <span className="press-logo" style={{ fontFamily: 'Georgia,serif', fontWeight: 400, fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>Harvey Nichols</span>
            <span className="press-logo" style={{ fontFamily: "'Arial Narrow',sans-serif", fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>QVC Japan</span>
            <span className="press-logo" style={{ fontFamily: 'Georgia,serif', fontWeight: 400, fontStyle: 'italic', fontSize: '1.15rem', letterSpacing: '0.02em' }}>The Telegraph</span>
            <span className="press-logo" style={{ fontFamily: "'Helvetica Neue',sans-serif", fontWeight: 300, fontSize: '1rem', letterSpacing: '0.18em', textTransform: 'uppercase' as const }}>Stylist</span>
            <span className="press-logo" style={{ fontFamily: "'Helvetica Neue',sans-serif", fontWeight: 300, fontSize: '0.9rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>SheerLuxe</span>
          </div>
          <p className="hp-press-label">Certified</p>
          <div className="hp-press-row">
            <div className="cert-badge" style={{ borderColor: '#1a5276', color: '#1a5276' }}>ICF<br />Accredited</div>
            <div className="cert-badge" style={{ borderColor: '#c0392b', color: '#c0392b' }}>CPD<br />Certified</div>
            <div className="cert-badge" style={{ borderColor: '#27ae60', color: '#27ae60' }}>TRE&reg;<br />Provider</div>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: homepageStyles }} />
    </>
  );
}

const homepageStyles = `
/* ═══ EDITORIAL FRAME ═══ */
.editorial-frame { background:#fff; text-align:center; padding:0.7rem 2rem 0.25rem; border-bottom:1px solid rgba(0,0,0,0.04); }
.editorial-issue { font-family:Mulish,system-ui,sans-serif; font-weight:300; font-size:0.7rem; letter-spacing:0.25em; text-transform:uppercase; color:#3D3D3A; margin-bottom:0.3rem; }
.editorial-inside { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:0.75rem; color:#5D5A52; }

/* ═══ HERO ═══ */
.hp-hero { background:#fff; padding:1rem 3rem 1.5rem; }
.hp-hero-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1.1fr 1fr; gap:2rem; align-items:center; }
.hp-hero-image { aspect-ratio:4/5; border-radius:6px; overflow:hidden; max-height:560px; background:linear-gradient(160deg,#e8ddd0,#d4c5b3); position:relative; }
.hp-hero-image::after { content:'Atmospheric photo. Taggs Island, golden hour, Anna'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-family:Mulish,sans-serif; font-size:0.5rem; letter-spacing:0.1em; text-transform:uppercase; color:rgba(0,0,0,0.12); text-align:center; max-width:80%; }
.hp-hero-image.has-image::after, .hp-featured-image.has-image::after, .article-card-img.has-image::after, .hp-work-image.has-image::after, .hp-community-image.has-image::after, .hp-portrait-image.has-image::after, .product-img.has-image::after { display:none; }
.hp-hero-tag { font-family:Mulish,sans-serif; font-weight:500; font-size:0.7rem; letter-spacing:0.18em; text-transform:uppercase; color:#6E3A5A; margin-bottom:0.8rem; }
.hp-hero-title { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:clamp(1.8rem,3vw,2.6rem); color:#231F20; line-height:1.35; margin-bottom:1.2rem; }
.hp-hero-title em { font-style:italic; color:#6E3A5A; }
.hp-hero-body { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; line-height:1.85; color:#3D3D3A; margin-bottom:1.5rem; }
.hp-hero-ctas { display:flex; gap:1.2rem; flex-wrap:wrap; }

/* ═══ CTA LINKS ═══ */
.cta-link { font-family:Mulish,sans-serif; font-weight:400; font-size:0.65rem; letter-spacing:0.14em; text-transform:uppercase; border-bottom:1px solid currentColor; padding-bottom:2px; transition:all 0.3s; display:inline-flex; align-items:center; gap:0.4rem; text-decoration:none; }
.cta-link:hover { gap:0.7rem; }
.cta-plum { color:#6E3A5A; }
/* Pink CTA: #F280AA on white ~3.0:1 (fails AA). Deepened to #C44A7A
   which keeps the warm pink feel but passes AA (4.6:1) for body text. */
.cta-pink { color:#C44A7A; }
.cta-blue { color:#7BAFDD; border-color:#7BAFDD; }
.cta-muted { color:#8C8880; border-color:#8C8880; }

/* ═══ FEATURED STORY ═══ */
.hp-featured { background:#fff; padding:0.8rem 3rem; }
.hp-featured-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1.1fr 0.9fr; gap:2.5rem; align-items:center; }
.hp-featured-image { aspect-ratio:4/3; border-radius:6px; overflow:hidden; max-height:440px; background:linear-gradient(160deg,#e4d8cc,#d0c2b4); position:relative; }
.hp-featured-image::after { content:'Featured story image'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-family:Mulish,sans-serif; font-size:0.5rem; letter-spacing:0.1em; text-transform:uppercase; color:rgba(0,0,0,0.1); }
.hp-featured-label { font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.18em; text-transform:uppercase; color:#6E3A5A; margin-bottom:0.5rem; display:inline-block; position:relative; }
.hp-featured-label::after { content:''; display:block; width:30px; height:1.5px; background:#6E3A5A; margin-top:0.3rem; }
.hp-featured-title { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:clamp(1.3rem,2.2vw,1.7rem); color:#231F20; line-height:1.35; margin-bottom:0.8rem; }
.hp-featured-meta { font-family:Mulish,sans-serif; font-size:0.72rem; color:#3D3D3A; letter-spacing:0.05em; margin-bottom:0.8rem; }
.hp-featured-excerpt { font-family:'EB Garamond',Georgia,serif; font-size:1rem; color:#3D3D3A; line-height:1.8; margin-bottom:0.8rem; }
.drop-cap { float:left; font-size:3rem; line-height:0.8; color:#6E3A5A; font-family:'EB Garamond',Georgia,serif; font-weight:500; margin-right:0.12rem; margin-top:0.1rem; }

/* ═══ ARTICLE GRID ═══ */
.hp-articles { background:#fff; padding:0 3rem 1.5rem; }
.hp-articles-grid { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; }
.article-card { border-radius:6px; overflow:hidden; cursor:pointer; transition:all 0.3s; border:1px solid rgba(0,0,0,0.04); }
.article-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.06); }
.article-card-img { aspect-ratio:16/10; background:linear-gradient(160deg,#e2d6ca,#d4c6b8); position:relative; }
.article-card-img::after { content:'Article image'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-family:Mulish,sans-serif; font-size:0.45rem; letter-spacing:0.1em; text-transform:uppercase; color:rgba(0,0,0,0.1); }
.article-card-body { padding:0.8rem 1rem; }
.article-card-cat { font-family:Mulish,sans-serif; font-weight:500; font-size:0.55rem; letter-spacing:0.12em; text-transform:uppercase; margin-bottom:0.3rem; }
.article-card-title { font-family:'EB Garamond',Georgia,serif; font-weight:500; font-size:0.95rem; color:#231F20; line-height:1.3; margin-bottom:0.3rem; }
.article-card-date { font-family:Mulish,sans-serif; font-size:0.6rem; color:#8C8880; }

/* ═══ MANTRA STRIP ═══ */
.hp-mantras { background:#FFF0D2; padding:1.2rem 2rem; text-align:center; overflow:hidden; }
.hp-mantra-text { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:clamp(1.3rem,2.5vw,1.8rem); color:#3D3D3A; line-height:1.6; max-width:900px; margin:0 auto; opacity:0.5; text-wrap:pretty; }
.hp-mantra-note { font-family:Mulish,sans-serif; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; color:#8C8880; margin-top:0.8rem; }

/* ═══ QUOTE SLIDES ═══ */
.hp-quote { background:#6E3A5A; padding:1.8rem 2rem; text-align:center; }
.hp-quote-text { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:clamp(1.4rem,2.8vw,2rem); color:#fff; line-height:1.6; max-width:950px; margin:0 auto; text-wrap:pretty; }
.hp-quote-attr { font-family:Mulish,sans-serif; font-weight:300; font-size:0.7rem; letter-spacing:0.15em; text-transform:uppercase; color:rgba(255,255,255,0.7); margin-top:0.8rem; }

/* ═══ SHARED SECTION STYLES ═══ */
.hp-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:0.5rem; }
.hp-section-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:400; font-size:clamp(1.4rem,2.5vw,1.8rem); color:#231F20; line-height:1.2; margin-bottom:1rem; letter-spacing:0.02em; }
.hp-body { font-family:'EB Garamond',Georgia,serif; font-size:1.02rem; line-height:1.85; color:#3D3D3A; margin-bottom:1rem; }
.hp-cta-group { display:flex; gap:1.2rem; flex-wrap:wrap; }

/* ═══ THE WORK ═══ */
.hp-work { background:#FCE8EF; padding:2rem 3rem; }
.hp-work-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1fr 0.8fr; gap:2.5rem; align-items:center; }
.hp-work-image { aspect-ratio:4/5; border-radius:6px; overflow:hidden; max-height:380px; background:linear-gradient(160deg,#e0cfc0,#ccbaa8); position:relative; }
.hp-work-image::after { content:'Photo. Coaching session on the houseboat'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-family:Mulish,sans-serif; font-size:0.5rem; letter-spacing:0.1em; text-transform:uppercase; color:rgba(0,0,0,0.1); text-align:center; }

/* ═══ EDITORIAL SECTIONS ═══ */
.hp-editorial-sections { background:#FFF0D2; padding:1.5rem 2rem; }
.hp-editorial-header { max-width:1200px; margin:0 auto 1rem; }
.hp-editorial-grid { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; }
.hp-editorial-tile { background:rgba(255,255,255,0.7); backdrop-filter:blur(8px); border-radius:8px; padding:1.5rem; cursor:pointer; transition:all 0.3s; border:1px solid rgba(255,255,255,0.5); text-decoration:none; }
.hp-editorial-tile:hover { transform:translateY(-3px); box-shadow:0 8px 25px rgba(0,0,0,0.06); background:#fff; }
.hp-editorial-tile h3 { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:400; font-size:0.82rem; margin-bottom:0.4rem; }
.hp-editorial-tile p { font-family:'EB Garamond',Georgia,serif; font-size:0.85rem; color:#8C8880; line-height:1.5; }

/* ═══ EXPERIENCES ═══ */
.hp-experiences { background:#fff; padding:1.5rem 2rem; }
.hp-experiences-inner { max-width:1200px; margin:0 auto; }

/* ═══ NEWSLETTER ═══ */
.hp-newsletter { background:#E9EBF6; padding:1.5rem 2rem; text-align:center; }
.hp-newsletter-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:400; font-size:clamp(1.3rem,2.5vw,1.8rem); color:#231F20; margin-bottom:0.8rem; letter-spacing:0.02em; }
.hp-newsletter-body { font-family:'EB Garamond',Georgia,serif; font-size:1rem; color:#3D3D3A; line-height:1.75; max-width:550px; margin:0 auto 0.8rem; }
.hp-newsletter-tiers { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; margin-bottom:1.5rem; }
.hp-newsletter-tier { font-family:Mulish,sans-serif; font-size:0.7rem; letter-spacing:0.04em; color:#3D3D3A; background:#fff; border-radius:6px; padding:1rem 1.8rem; border:1px solid rgba(0,0,0,0.08); min-width:220px; text-align:center; }
.hp-newsletter-tier strong { display:block; font-weight:600; font-size:0.75rem; color:#231F20; margin-bottom:0.3rem; }
.hp-btn-substack { background:#6E3A5A; color:#fff; border:1px solid #6E3A5A; font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.85rem 2rem; border-radius:3px; cursor:pointer; transition:all 0.3s; display:inline-block; text-decoration:none; }
.hp-btn-substack:hover { background:#5A2E4A; }
.hp-newsletter-small { font-family:Mulish,sans-serif; font-size:0.72rem; color:#3D3D3A; margin-top:0.8rem; letter-spacing:0.05em; }

/* ═══ SHOP PREVIEW ═══ */
.hp-shop { background:#E1F5EE; padding:1.5rem 2rem; }
.hp-shop-inner { max-width:1200px; margin:0 auto; }
.hp-shop-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:1.2rem; margin-top:1rem; }
.product-card { background:#fff; border-radius:8px; overflow:hidden; cursor:pointer; transition:all 0.3s; }
.product-card:hover { transform:translateY(-3px); box-shadow:0 8px 25px rgba(0,0,0,0.06); }
.product-img { aspect-ratio:1; background:linear-gradient(180deg,#eae5dd,#ddd5ca); position:relative; }
.product-img::after { content:'Product photo'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-family:Mulish,sans-serif; font-size:0.45rem; letter-spacing:0.1em; text-transform:uppercase; color:rgba(0,0,0,0.1); }
.product-info { padding:1rem; }
.product-hook { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:0.82rem; color:#8C8880; margin-bottom:0.3rem; }
.product-name { font-family:'EB Garamond',Georgia,serif; font-weight:500; font-size:0.95rem; color:#231F20; }
.btn-green { background:#5DCAA5; color:#fff; border:1px solid #5DCAA5; font-family:Mulish,sans-serif; font-weight:400; font-size:0.62rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.75rem 1.5rem; border-radius:3px; cursor:pointer; transition:all 0.3s; display:inline-block; text-decoration:none; }
.btn-green:hover { background:#4db895; }

/* ═══ MEDIA HUB ═══ */
.hp-media { background:#FFF0D2; padding:1.5rem 2rem; }
.hp-media-inner { max-width:1200px; margin:0 auto; }
.hp-media-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.2rem; }
.hp-media-tile { background:#fff; border-radius:8px; padding:1.5rem; cursor:pointer; transition:all 0.3s; border:1px solid rgba(0,0,0,0.04); }
.hp-media-tile:hover { transform:translateY(-3px); box-shadow:0 8px 25px rgba(0,0,0,0.06); }
.hp-media-label { font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.12em; text-transform:uppercase; color:#FFD07A; margin-bottom:0.5rem; }
.hp-media-tile-title { font-family:'EB Garamond',Georgia,serif; font-weight:500; font-size:1rem; color:#231F20; margin-bottom:0.4rem; line-height:1.3; }
.hp-media-meta { font-family:Mulish,sans-serif; font-size:0.72rem; color:#3D3D3A; letter-spacing:0.05em; margin-bottom:0.6rem; }
.hp-media-link { font-family:Mulish,sans-serif; font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase; color:#FFD07A; display:inline-flex; align-items:center; gap:0.3rem; }

/* ═══ COMMUNITY ═══ */
.hp-community { background:#F5F3EF; padding:1.5rem 3rem; }
.hp-community-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:2.5rem; align-items:center; }
.hp-community-image { aspect-ratio:4/3; border-radius:6px; overflow:hidden; max-height:300px; background:linear-gradient(160deg,#dcc8c0,#c8b0a8); position:relative; }
.hp-community-image::after { content:'Photo. Circle gathering, warm, real'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-family:Mulish,sans-serif; font-size:0.45rem; letter-spacing:0.1em; text-transform:uppercase; color:rgba(0,0,0,0.1); text-align:center; }
.btn-dark { font-family:Mulish,sans-serif; font-weight:400; font-size:0.62rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.75rem 1.5rem; border-radius:3px; cursor:pointer; transition:all 0.3s; display:inline-block; text-decoration:none; background:#231F20; color:#F5F3EF; border:1px solid #231F20; }
.btn-dark:hover { background:#3D3D3A; }
.btn-outline-dark-sm { font-family:Mulish,sans-serif; font-weight:400; font-size:0.62rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.75rem 1.5rem; border-radius:3px; cursor:pointer; transition:all 0.3s; display:inline-block; text-decoration:none; background:transparent; color:#3D3D3A; border:1px solid rgba(0,0,0,0.12); }
.btn-outline-dark-sm:hover { background:#231F20; color:#fff; }

/* ═══ PORTRAIT ═══ */
.hp-portrait { background:#fff; padding:1.5rem 3rem; }
.hp-portrait-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:0.8fr 1.2fr; gap:2.5rem; align-items:center; }
.hp-portrait-image { aspect-ratio:3/4; border-radius:6px; overflow:hidden; max-height:350px; background:linear-gradient(160deg,#d8ccc0,#c4b4a8); position:relative; }
.hp-portrait-image::after { content:'Portrait of Anna. Real photo to be supplied'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-family:Mulish,sans-serif; font-size:0.5rem; letter-spacing:0.1em; text-transform:uppercase; color:rgba(0,0,0,0.1); text-align:center; max-width:80%; }
.hp-portrait-heading { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:clamp(1.4rem,2.5vw,2rem); color:#231F20; line-height:1.35; margin-bottom:1rem; }
.hp-portrait-body { font-family:'EB Garamond',Georgia,serif; font-size:1.02rem; color:#3D3D3A; line-height:1.85; margin-bottom:1.5rem; }

/* ═══ TESTIMONIALS ═══ */
.hp-testimonials { background:#fff; padding:1.5rem 2rem; }
.hp-testimonials-inner { max-width:1200px; margin:0 auto; }
.hp-testi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.2rem; margin-top:1rem; }
.hp-testi-card { border-radius:8px; padding:2rem; }
.hp-testi-quote { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:1rem; color:#3D3D3A; line-height:1.7; margin-bottom:1.2rem; }
.hp-testi-author { font-family:Mulish,sans-serif; font-weight:400; font-size:0.65rem; letter-spacing:0.1em; text-transform:uppercase; color:#3D3D3A; }

/* ═══ PRESS & CREDENTIALS ═══ */
.hp-press { background:#fff; padding:0.8rem 2rem 1rem; border-top:1px solid rgba(0,0,0,0.03); }
.hp-press-inner { max-width:1200px; margin:0 auto; text-align:center; }
.hp-press-label { font-family:Mulish,sans-serif; font-weight:300; font-size:0.65rem; letter-spacing:0.18em; text-transform:uppercase; color:#8C8880; margin-bottom:0.5rem; }
.hp-press-row { display:flex; align-items:center; justify-content:center; gap:1.5rem; flex-wrap:wrap; margin-bottom:0.8rem; }
.press-logo { color:#3D3D3A; opacity:0.5; transition:opacity 0.3s; }
.press-logo:hover { opacity:0.8; }
.cert-badge { width:100px; height:56px; border:2px solid; border-radius:4px; display:flex; align-items:center; justify-content:center; text-align:center; font-family:Mulish,sans-serif; font-weight:600; font-size:0.6rem; letter-spacing:0.04em; line-height:1.5; }

/* ═══ RESPONSIVE ═══ */
@media (max-width:900px) {
  .hp-hero-inner, .hp-featured-inner, .hp-work-inner, .hp-community-inner, .hp-portrait-inner { grid-template-columns:1fr; gap:1.5rem; }
  .hp-articles-grid, .hp-editorial-grid, .hp-shop-grid, .hp-media-grid, .hp-testi-grid { grid-template-columns:1fr; }
  .hp-hero, .hp-featured, .hp-work, .hp-community, .hp-portrait { padding-left:1.2rem !important; padding-right:1.2rem !important; }
  .hp-articles, .hp-editorial-sections, .hp-experiences, .hp-newsletter, .hp-shop, .hp-media, .hp-testimonials, .hp-press { padding-left:1rem !important; padding-right:1rem !important; }
  .hp-newsletter-tiers { flex-direction:column; align-items:center; }
  .hp-hero-ctas, .hp-cta-group { flex-direction:column; align-items:flex-start; }
}
@media (max-width:480px) {
  .hp-hero-image { max-height:300px; }
  .hp-press-row { gap:0.8rem; }
  .cert-badge { width:75px; height:45px; font-size:0.5rem; }
}

/* ═══ DESKTOP TIGHTENING ═══ */
@media (min-width:901px) {
  .hp-hero { padding:0.8rem 3rem; }
  .hp-featured { padding:0.5rem 3rem; }
  .hp-articles { padding:0 3rem 0.5rem; }
  .hp-mantras { padding:0.5rem 2rem; }
  .hp-quote { padding:1rem 2rem; }
  .hp-work { padding:1rem 3rem; }
  .hp-editorial-sections { padding:0.8rem 2rem; }
  .hp-experiences { padding:0.8rem 2rem; }
  .hp-newsletter { padding:0.8rem 2rem; }
  .hp-shop { padding:0.8rem 2rem; }
  .hp-media { padding:0.8rem 2rem; }
  .hp-community { padding:0.8rem 3rem; }
  .hp-portrait { padding:0.8rem 3rem; }
  .hp-testimonials { padding:0.8rem 2rem; }
  .hp-press { padding:0.5rem 2rem 0.8rem; }
}
`;
