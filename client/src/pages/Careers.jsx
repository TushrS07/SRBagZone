export default function Careers() {
  return (
    <main className="max-w-[860px] mx-auto pt-10 px-8 pb-20 max-sm:pt-8 max-sm:px-4 max-sm:pb-[60px]">
      <div className="mb-12 border-b border-line pb-9 max-sm:mb-8 max-sm:pb-6">
        <span className="hero-eyebrow">Join the Team</span>
        <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-medium mt-2.5 mb-3.5 tracking-[-0.5px] leading-[1.1]">Careers</h1>
        <p className="text-base text-ink-soft leading-relaxed m-0 max-w-[600px]">We're a small, focused team that cares deeply about what we make. If that sounds like your kind of place, we'd love to hear from you.</p>
      </div>

      <div className="flex flex-col gap-10">
        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">Life at SR Bagz Zone</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mt-1.5">
            <div className="bg-surface border border-line rounded-md p-[22px] px-5">
              <div className="text-[26px] mb-2.5">🤝</div>
              <h3 className="font-serif text-[18px] font-medium m-0 mb-1.5">Small Team, Big Ownership</h3>
              <p className="text-sm text-muted m-0 leading-[1.5]">Everyone here wears multiple hats and has a real say in what gets built.</p>
            </div>
            <div className="bg-surface border border-line rounded-md p-[22px] px-5">
              <div className="text-[26px] mb-2.5">📍</div>
              <h3 className="font-serif text-[18px] font-medium m-0 mb-1.5">Based in Jaipur</h3>
              <p className="text-sm text-muted m-0 leading-[1.5]">Our office and workshop are in Jaipur — we work in-person and value that.</p>
            </div>
            <div className="bg-surface border border-line rounded-md p-[22px] px-5">
              <div className="text-[26px] mb-2.5">📈</div>
              <h3 className="font-serif text-[18px] font-medium m-0 mb-1.5">Room to Grow</h3>
              <p className="text-sm text-muted m-0 leading-[1.5]">We're growing fast. The people who join now will help shape where we go next.</p>
            </div>
          </div>
        </div>

        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">Open Positions</h2>
          <p className="text-[15px] text-ink-soft leading-[1.7] m-0 mb-2.5">We don't have any open roles listed right now, but we're always interested in talking to sharp, motivated people.</p>
          <p className="text-[15px] text-ink-soft leading-[1.7] m-0 mb-2.5">If you're passionate about product, design, operations, or customer experience — send us a note and tell us how you'd add value. We read every message.</p>
        </div>

        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">What We Look For</h2>
          <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold">People who take pride in their work and hold themselves to a high standard</li>
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold">Clear, direct communicators who don't hide behind jargon</li>
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold">Those who can operate with autonomy and ask for help when they need it</li>
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold">A genuine interest in physical products, retail, or the brand we're building</li>
          </ul>
        </div>

        <div className="bg-accent-soft border-l-[3px] border-accent rounded-r-sm px-5 py-4 text-sm text-ink-soft leading-[1.55]">
          <strong>Get in touch:</strong> Email your CV and a short note about yourself to <a href="mailto:careers@srbagzzone.com" className="text-accent-deep font-semibold">careers@srbagzzone.com</a> — or use our <a href="/contact" className="text-accent-deep font-semibold">contact form</a>.
        </div>
      </div>
    </main>
  )
}
