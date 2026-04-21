import { Metadata } from 'next';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'About — Anna Lou Wellness',
  description: 'The story of Anna Lou Sheridan — somatic trauma-informed coach, ICF-accredited, and founder of Anna Lou of London.',
};

export default function AboutPage() {
  return (
    <>
      <PageHero label="Our Story" title="About" bgClass="hero-about" />

      <section className="py-24 px-8">
        <div className="max-w-[800px] mx-auto text-center mb-20 reveal">
          <p className="section-label">Meet Anna</p>
          <h2 className="section-heading">Beautifully Whole</h2>
          <p className="section-body mx-auto text-center">Anna Lou Sheridan is a somatic trauma-informed coach and ICF-accredited practitioner dedicated to helping people reconnect with themselves. Her philosophy, &ldquo;Beautifully Whole&rdquo;, weaves together body-centred healing, intuitive wisdom, and practical tools for lasting transformation.</p>
        </div>

        <div className="max-w-[800px] mx-auto space-y-10 reveal">
          <div>
            <p className="font-editorial text-[1.15rem] text-ink leading-relaxed" style={{ lineHeight: '1.9' }}>Before stepping into the world of wellness coaching, Anna founded Anna Lou of London &mdash; a crystal jewellery and wellbeing brand stocked at Harrods, Selfridges, and Harvey Nichols. That journey gave her a deep appreciation for the transformative power of intention, beauty, and self-care.</p>
          </div>
          <div>
            <p className="font-editorial text-[1.15rem] text-ink leading-relaxed" style={{ lineHeight: '1.9' }}>Today, Anna Lou Wellness is the next chapter: a space where somatic coaching, crystal energy, and holistic guidance come together to help you feel whole &mdash; exactly as you are.</p>
          </div>
          <div>
            <p className="font-editorial text-[1.15rem] text-mid-grey leading-relaxed italic" style={{ lineHeight: '1.9' }}>&ldquo;Healing isn&rsquo;t about becoming someone new. It&rsquo;s about coming home to who you already are.&rdquo;</p>
          </div>
        </div>
      </section>
    </>
  );
}
