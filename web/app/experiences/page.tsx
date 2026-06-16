import { Metadata } from 'next';
import { getExperiences, getExperiencesLandingPage } from '@/lib/cms';
import ExperiencesGrid, { type ExperienceCard } from '@/components/ExperiencesGrid';
import UpsellBlockForSingleton from '@/components/UpsellBlockForSingleton';

export const revalidate = 3600;

// Hardcoded fallback used only if the CMS singleton is unreachable.
// Anna edits the actual content via Quick Edit > Experiences · Landing.
const landingFallback = {
  kicker: 'Experiences',
  kickerColour: '#7BAFDD',
  title: 'Workshops, retreats, and reset days.',
  intro: 'Group sessions held on the houseboat at Taggs Island, online, and in corporate spaces. A few times a year, a small group comes to the island for a full reset day. Water outside, no agenda, just space to come back to yourself.',
  categories: [],
  upcomingKicker: 'Upcoming',
  upcomingTitle: 'Next on the calendar.',
};

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getExperiencesLandingPage(landingFallback);
  return {
    title: cms.title,
    description: cms.intro,
    openGraph: { title: `${cms.title} — Anna Lou Wellness`, description: cms.intro },
  };
}

export default async function ExperiencesPage() {
  const [cmsExperiences, cms] = await Promise.all([
    getExperiences(),
    getExperiencesLandingPage(landingFallback),
  ]);

  // Map the CMS Experience shape to the ExperienceCard shape the grid expects.
  // Only includes active items (the CMS query already filters is_active:true).
  const items: ExperienceCard[] = cmsExperiences.map((e) => ({
    id: e.id,
    name: e.name,
    slug: e.slug,
    type: e.type,
    date: e.date,
    location: e.location,
    priceLabel: e.priceLabel,
    heroImage: e.heroImage,
    bookingUrl: e.bookingUrl,
  }));

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: expStyles }} />

      {/* Header — kicker + title + intro, CMS-driven */}
      <section className="exp-header">
        <div className="exp-header-inner reveal">
          <p className="exp-kicker" style={{ color: cms.kickerColour }}>{cms.kicker}</p>
          <h1 className="exp-title">{cms.title}</h1>
          <p className="exp-intro">{cms.intro}</p>
        </div>
      </section>

      {/* One-page visual grid of every Experience with filter pills */}
      <ExperiencesGrid items={items} />
    <UpsellBlockForSingleton endpoint="/experiences-landing-page" />
    </>
  );
}

const expStyles = `
.exp-header { background:#fff; padding:2.5rem 3rem 1.5rem; text-align:center; }
.exp-header-inner { max-width:900px; margin:0 auto; }
.exp-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:#7BAFDD; margin-bottom:0.5rem; }
.exp-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:300; font-size:clamp(2rem,5vw,3.2rem); color:#231F20; letter-spacing:0.05em; line-height:1.1; margin-bottom:1rem; }
.exp-intro { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; color:#3D3D3A; line-height:1.85; max-width:800px; margin:0 auto; }

@media (max-width:900px) {
  .exp-header { padding-left:1.2rem; padding-right:1.2rem; }
}
`;
