export default function OurStory() {
  return (
    <main className="max-w-[860px] mx-auto pt-10 px-8 pb-20 max-sm:pt-8 max-sm:px-4 max-sm:pb-[60px]">
      <div className="mb-12 border-b border-line pb-9 max-sm:mb-8 max-sm:pb-6">
        <span className="hero-eyebrow">Who We Are</span>
        <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-medium mt-2.5 mb-3.5 tracking-[-0.5px] leading-[1.1]">Our Story</h1>
        <p className="text-base text-ink-soft leading-relaxed m-0 max-w-[600px]">SR Bagz Zone started with one simple belief — a good bag should work as hard as you do.</p>
      </div>

      <div className="flex flex-col gap-10">
        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">Where It Began</h2>
          <p className="text-[15px] text-ink-soft leading-[1.7] m-0 mb-2.5">SR Bagz Zone was founded in Jaipur with a small workshop and a clear mission: make bags that balance quality craftsmanship with everyday practicality. What started as a single product line for school students quickly grew into a full collection spanning handbags, backpacks, and travel accessories.</p>
          <p className="text-[15px] text-ink-soft leading-[1.7] m-0 mb-2.5">We noticed a gap in the Indian market — bags were either mass-produced and flimsy, or luxury-priced and impractical. We set out to build something in between: well-made, thoughtfully designed, and priced honestly.</p>
        </div>

        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">What We Stand For</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mt-1.5">
            <div className="bg-surface border border-line rounded-md p-[22px] px-5">
              <div className="text-[26px] mb-2.5">✦</div>
              <h3 className="font-serif text-[18px] font-medium m-0 mb-1.5">Quality First</h3>
              <p className="text-sm text-muted m-0 leading-[1.5]">Every bag is stress-tested on zippers, stitching, and hardware before it ships.</p>
            </div>
            <div className="bg-surface border border-line rounded-md p-[22px] px-5">
              <div className="text-[26px] mb-2.5">◈</div>
              <h3 className="font-serif text-[18px] font-medium m-0 mb-1.5">Honest Pricing</h3>
              <p className="text-sm text-muted m-0 leading-[1.5]">No inflated MRPs or fake discounts — just fair prices for what you get.</p>
            </div>
            <div className="bg-surface border border-line rounded-md p-[22px] px-5">
              <div className="text-[26px] mb-2.5">⬡</div>
              <h3 className="font-serif text-[18px] font-medium m-0 mb-1.5">Practical Design</h3>
              <p className="text-sm text-muted m-0 leading-[1.5]">Form follows function. Every pocket, strap, and clasp is there for a reason.</p>
            </div>
          </div>
        </div>

        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">Made in India</h2>
          <p className="text-[15px] text-ink-soft leading-[1.7] m-0 mb-2.5">All our products are designed and manufactured in India. We work with skilled artisans and local suppliers, keeping our supply chain short, transparent, and accountable. Supporting Indian craftsmanship isn't just a talking point for us — it's baked into how we operate.</p>
        </div>

        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">Today</h2>
          <p className="text-[15px] text-ink-soft leading-[1.7] m-0 mb-2.5">SR Bagz Zone now serves customers across India, with a growing wholesale network and a loyal community of students, working professionals, and travellers. We ship thousands of bags each month, and every single one still gets the same care and quality check as our very first order.</p>
          <p className="text-[15px] text-ink-soft leading-[1.7] m-0 mb-2.5">We're a small team that takes bags seriously. We hope you love what we make.</p>
        </div>
      </div>
    </main>
  )
}
