export default function Sustainability() {
  return (
    <main className="max-w-[860px] mx-auto pt-10 px-8 pb-20 max-sm:pt-8 max-sm:px-4 max-sm:pb-[60px]">
      <div className="mb-12 border-b border-line pb-9 max-sm:mb-8 max-sm:pb-6">
        <span className="hero-eyebrow">Our Commitment</span>
        <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-medium mt-2.5 mb-3.5 tracking-[-0.5px] leading-[1.1]">Sustainability</h1>
        <p className="text-base text-ink-soft leading-relaxed m-0 max-w-[600px]">We're not perfect, but we're working on it. Here's an honest look at how we think about our environmental footprint.</p>
      </div>

      <div className="flex flex-col gap-10">
        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">Materials</h2>
          <p className="text-[15px] text-ink-soft leading-[1.7] m-0 mb-2.5">We prioritise materials that are built to last, because a bag that lasts five years is always better for the planet than one that falls apart in six months. Our current material choices include:</p>
          <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold">Recycled polyester linings where possible, reducing virgin plastic use</li>
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold">Vegetable-tanned leather sourced from tanneries with certified water treatment processes</li>
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold">Canvas fabrics from Indian mills that comply with OEKO-TEX Standard 100</li>
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold">YKK and equivalent zippers rated for 10,000+ open-close cycles</li>
          </ul>
        </div>

        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">Packaging</h2>
          <p className="text-[15px] text-ink-soft leading-[1.7] m-0 mb-2.5">We eliminated single-use plastic from our packaging in 2023. Every SR Bagz Zone order now ships in:</p>
          <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold">Kraft paper mailers — recyclable and biodegradable</li>
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold">Tissue wrap made from FSC-certified paper</li>
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold">Cardboard inserts that double as gift boxes</li>
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold">Soy-based inks for all printed materials</li>
          </ul>
        </div>

        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">Local Manufacturing</h2>
          <p className="text-[15px] text-ink-soft leading-[1.7] m-0 mb-2.5">Keeping production in India isn't just good for local employment — it significantly reduces the carbon footprint of transporting goods across continents. Our workshop in Hanumangarh is within 200 km of our primary raw material suppliers, keeping our supply chain tight.</p>
        </div>

        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">Repairability</h2>
          <p className="text-[15px] text-ink-soft leading-[1.7] m-0 mb-2.5">We believe in extending the life of products rather than replacing them. All SR Bagz Zone bags are designed with standard fittings, and our team can source replacement zippers, buckles, and straps for most models up to 3 years after purchase. Reach out through our contact form to inquire about repairs.</p>
        </div>

        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">What We're Still Working On</h2>
          <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold">Transitioning our full lining range to recycled materials by end of 2026</li>
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold">Carbon-neutral shipping options for all order values</li>
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold">A take-back programme for end-of-life bags</li>
          </ul>
        </div>

        <div className="bg-accent-soft border-l-[3px] border-accent rounded-r-sm px-5 py-4 text-sm text-ink-soft leading-[1.55]">
          <strong>We're honest about where we are.</strong> Sustainability is a journey, not a checkbox. We'll keep updating this page as we make progress — and we'll only claim what we can actually back up.
        </div>
      </div>
    </main>
  )
}
