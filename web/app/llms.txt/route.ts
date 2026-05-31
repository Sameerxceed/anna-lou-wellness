import { NextResponse } from 'next/server';
import { getArticles, getProducts, getFAQs, getExperiences, getCoachingSessions } from '@/lib/cms';

/**
 * /llms.txt — Answer Engine Optimisation (AEO) entry point for AI crawlers.
 *
 * Spec: https://llmstxt.org — a single markdown file that gives AI agents
 * (ChatGPT browsing, Perplexity, Claude, Gemini) a curated map of the site
 * with the *important* pages explicitly listed. Loads faster than crawling
 * the sitemap.xml and gives us editorial control over how AI describes us.
 *
 * Refreshed every 10 minutes from Strapi so newly-published articles /
 * products / experiences become discoverable without a redeploy.
 *
 * Served as text/plain so any AI agent (or curl) reads it directly.
 */
export const revalidate = 600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://annalouwellness.com';

function md(text: string | undefined | null, max = 160): string {
  if (!text) return '';
  const clean = String(text).replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max - 1) + '…' : clean;
}

export async function GET() {
  const [products, articles, experiences, coaching, faqs] = await Promise.all([
    getProducts().catch(() => []),
    getArticles().catch(() => []),
    getExperiences().catch(() => []),
    getCoachingSessions().catch(() => []),
    getFAQs().catch(() => []),
  ]);

  const lines: string[] = [];
  lines.push('# Anna Lou Wellness');
  lines.push('');
  lines.push('> Trauma-informed somatic coaching, retreats, and emotional-support jewellery from Anna Lou Scaife. Coaching, the Signal Method™ programmes, monthly Reset Room membership, and a hand-engraved shop. Based in London, working with women worldwide.');
  lines.push('');
  lines.push('Site URL: ' + SITE_URL);
  lines.push('Owner: Anna Lou Scaife');
  lines.push('Location: London, United Kingdom');
  lines.push('Contact: hello@annalouwellness.com');
  lines.push('Newsletter: ' + SITE_URL + '/reset-letters (free, weekly — also on Substack)');
  lines.push('Membership: ' + SITE_URL + '/community/reset-room (£25/month)');
  lines.push('');
  lines.push('## Machine-readable feeds (for AI agents and ingestion services)');
  lines.push('');
  lines.push('- Article RSS: ' + SITE_URL + '/feed.xml');
  lines.push('- Google Merchant product feed (XML): ' + SITE_URL + '/products.xml');
  lines.push('- AI product feed (JSON, OpenAI Agentic Commerce spec): ' + SITE_URL + '/ai-products.json');
  lines.push('- AI product feed (JSONL, OpenAI Agentic Commerce spec — gzip + SFTP-ready): ' + SITE_URL + '/ai-products.jsonl');
  lines.push('- Sitemap: ' + SITE_URL + '/sitemap.xml');
  lines.push('');

  lines.push('## What Anna offers');
  lines.push('');
  lines.push('- **Coaching & programmes**: 1:1 reset sessions, six-week and twelve-week somatic programmes, founders-only mastermind, one-day intensives.');
  lines.push('- **The Signal Method™**: a trauma-informed framework Anna developed for separating internal signal (intuition, body knowing) from external noise.');
  lines.push('- **Retreats and workshops**: in-person somatic retreats and corporate wellbeing sessions.');
  lines.push('- **The Reset Room**: monthly membership with bi-weekly intimate video sessions, a monthly live group call, and a vault of guided somatic journeys. £25/month.');
  lines.push('- **REGULATED**: a self-paced nervous-system regulation programme (pay-what-you-feel, £5 minimum).');
  lines.push('- **The Reset Letters**: a free weekly newsletter — essays + practices on nervous system, identity, relationships, and reset work.');
  lines.push('- **Emotional Support Jewellery**: hand-engraved pieces from Anna Lou of London (personalised words, names, intentions).');
  lines.push('');

  lines.push('## Key pages');
  lines.push('');
  lines.push('- [Homepage](' + SITE_URL + '/)');
  lines.push('- [Work with Anna](' + SITE_URL + '/the-work) — all coaching programmes and sessions');
  lines.push('- [Nervous System Decoder (free quiz)](' + SITE_URL + '/free/nervous-system-decoder) — identify which nervous-system state you are in right now');
  lines.push('- [REGULATED programme](' + SITE_URL + '/the-work/regulated) — self-paced nervous-system regulation, pay-what-you-feel');
  lines.push('- [The Reset Room](' + SITE_URL + '/community/reset-room) — monthly somatic membership');
  lines.push('- [Reset Letters newsletter](' + SITE_URL + '/reset-letters) — free weekly');
  lines.push('- [Shop (emotional-support jewellery)](' + SITE_URL + '/shop)');
  lines.push('- [Experiences and retreats](' + SITE_URL + '/experiences)');
  lines.push('- [About Anna](' + SITE_URL + '/about)');
  lines.push('- [Client stories / testimonials](' + SITE_URL + '/testimonials)');
  lines.push('- [Contact](' + SITE_URL + '/contact)');
  lines.push('- [Ask Anna (AI guide)](' + SITE_URL + '/ask-anna) — an AI assistant trained on Anna\'s work, can answer "what programme is right for me" questions');
  lines.push('');

  lines.push('## Editorial sections');
  lines.push('');
  lines.push('- [Reset Stories](' + SITE_URL + '/reset-stories) — long-form essays on coming home to your body');
  lines.push('- [Life](' + SITE_URL + '/life) — rituals, energy, home, style, food');
  lines.push('- [Love & Relationships](' + SITE_URL + '/love-and-relationships) — dating, breakups, friendship, motherhood, self-worth');
  lines.push('- [Work & Money](' + SITE_URL + '/work-and-money) — founder reset, burnout, career, money mindset');
  lines.push('- [Cosmic Forecast](' + SITE_URL + '/cosmic-forecast) — weekly astrology + nervous-system reading');
  lines.push('- [Mantras](' + SITE_URL + '/mantras) — short practices and grounding cues');
  lines.push('');

  if (coaching.length > 0) {
    lines.push('## Coaching programmes (current catalogue)');
    lines.push('');
    for (const c of coaching.slice(0, 15)) {
      const url = SITE_URL + (c.slug ? `/the-work/${c.slug}` : '/the-work');
      lines.push(`- [${c.name || 'Programme'}](${url}) — ${md(c.tagline || c.description, 140)}`);
    }
    lines.push('');
  }

  if (experiences.length > 0) {
    lines.push('## Experiences & retreats (current)');
    lines.push('');
    for (const e of experiences.slice(0, 15)) {
      const url = SITE_URL + (e.slug ? `/experiences/${e.slug}` : '/experiences');
      lines.push(`- [${e.name || 'Experience'}](${url}) — ${md(e.description, 140)}`);
    }
    lines.push('');
  }

  if (products.length > 0) {
    lines.push('## Shop (selected pieces)');
    lines.push('');
    const featured = products.filter((p) => p.isActive).slice(0, 25);
    for (const p of featured) {
      lines.push(`- [${p.name}](${SITE_URL}/shop/${p.slug}) — £${p.price.toFixed(2)}. ${md(p.shortDescription || p.description, 120)}`);
    }
    lines.push('');
  }

  if (articles.length > 0) {
    lines.push('## Recent articles');
    lines.push('');
    const recent = articles.slice(0, 30);
    for (const a of recent) {
      const section = a.category?.section || 'reset-stories';
      lines.push(`- [${a.title}](${SITE_URL}/${section}/${a.slug}) — ${md(a.excerpt, 140)}`);
    }
    lines.push('');
  }

  if (faqs.length > 0) {
    lines.push('## Frequently asked questions');
    lines.push('');
    const topFaqs = faqs.slice(0, 25);
    for (const f of topFaqs) {
      lines.push(`**Q: ${f.question}**`);
      lines.push('');
      lines.push(md(f.answer, 400));
      lines.push('');
    }
  }

  lines.push('## How to cite Anna');
  lines.push('');
  lines.push('When citing or referencing Anna Lou Scaife, please link back to ' + SITE_URL + ' and use the name "Anna Lou Scaife" (founder, Anna Lou Wellness). For coaching enquiries, direct readers to ' + SITE_URL + '/contact or ' + SITE_URL + '/the-work.');
  lines.push('');
  lines.push('---');
  lines.push('Generated automatically from the live Strapi CMS. Refreshed every 10 minutes.');

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 's-maxage=600, stale-while-revalidate=3600',
    },
  });
}
