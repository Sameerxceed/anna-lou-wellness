import { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import { getContactInfo } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Anna Lou Wellness. Email, location, and enquiry form.',
};

export default async function ContactPage() {
  const siteConfig = await getContactInfo();

  return (
    <>
      <PageHero label="Say Hello" title="Contact" bgClass="hero-contact" />

      <section className="py-24 px-8">
        <div className="max-w-[1000px] mx-auto grid grid-cols-2 gap-16 max-md:grid-cols-1">
          <div className="reveal">
            <p className="section-label">Get in Touch</p>
            <h2 className="section-heading">We&apos;d Love to Hear From You</h2>
            <p className="section-body">Whether you&apos;re interested in coaching, have a question about the shop, or simply want to connect &mdash; reach out anytime.</p>
            <div className="mt-10 space-y-6">
              <div>
                <p className="font-sans font-light text-[0.55rem] tracking-[0.22em] uppercase text-mid-grey mb-1">Email</p>
                <p className="font-body text-dark-grey"><a href="mailto:hello@annalouwellness.com" className="text-ink hover:text-mid-grey transition-colors">hello@annalouwellness.com</a></p>
              </div>
              <div>
                <p className="font-sans font-light text-[0.55rem] tracking-[0.22em] uppercase text-mid-grey mb-1">Location</p>
                <p className="font-body text-dark-grey">London, UK</p>
              </div>
            </div>
          </div>

          <div className="reveal reveal-delay-2">
            <p className="section-label">Send a Message</p>
            <div className="space-y-6">
              <div>
                <label className="block font-sans font-light text-[0.55rem] tracking-[0.18em] uppercase text-dark-grey mb-2">Your Name</label>
                <input type="text" className="w-full font-body text-[0.92rem] text-ink bg-transparent border-b border-mid-grey/30 py-3 outline-none focus:border-ink transition-colors" placeholder="Full name" />
              </div>
              <div>
                <label className="block font-sans font-light text-[0.55rem] tracking-[0.18em] uppercase text-dark-grey mb-2">Email</label>
                <input type="email" className="w-full font-body text-[0.92rem] text-ink bg-transparent border-b border-mid-grey/30 py-3 outline-none focus:border-ink transition-colors" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block font-sans font-light text-[0.55rem] tracking-[0.18em] uppercase text-dark-grey mb-2">Subject</label>
                <select className="w-full font-body text-[0.92rem] text-ink bg-transparent border-b border-mid-grey/30 py-3 outline-none focus:border-ink appearance-none cursor-pointer">
                  <option value="">Select subject</option>
                  <option value="coaching">Coaching Enquiry</option>
                  <option value="shop">Shop / Orders</option>
                  <option value="collaboration">Collaboration</option>
                  <option value="other">General Enquiry</option>
                </select>
              </div>
              <div>
                <label className="block font-sans font-light text-[0.55rem] tracking-[0.18em] uppercase text-dark-grey mb-2">Message</label>
                <textarea className="w-full font-body text-[0.92rem] text-ink bg-transparent border border-mid-grey/30 p-4 outline-none focus:border-ink min-h-[120px] resize-y transition-colors" placeholder="Your message..." />
              </div>
              <button className="btn btn-outline w-full text-center">Send Message</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
