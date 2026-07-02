export default function Returns() {
  return (
    <main className="max-w-[860px] mx-auto pt-10 px-8 pb-20 max-sm:pt-8 max-sm:px-4 max-sm:pb-[60px]">
      <div className="mb-12 border-b border-line pb-9 max-sm:mb-8 max-sm:pb-6">
        <span className="hero-eyebrow">Hassle-Free Returns</span>
        <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-medium mt-2.5 mb-3.5 tracking-[-0.5px] leading-[1.1]">Returns &amp; Refunds</h1>
        <p className="text-base text-ink-soft leading-relaxed m-0 max-w-[600px]">Not happy with your purchase? We offer a 30-day return window with no awkward questions.</p>
      </div>

      <div className="flex flex-col gap-10">
        <div className="info-block">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mt-1.5">
            <div className="bg-surface border border-line rounded-md p-[22px] px-5">
              <div className="text-[26px] mb-2.5">↺</div>
              <h3 className="font-serif text-[18px] font-medium m-0 mb-1.5">30-Day Window</h3>
              <p className="text-sm text-muted m-0 leading-[1.5]">Return any item within 30 days of delivery.</p>
            </div>
            <div className="bg-surface border border-line rounded-md p-[22px] px-5">
              <div className="text-[26px] mb-2.5">✓</div>
              <h3 className="font-serif text-[18px] font-medium m-0 mb-1.5">Easy Process</h3>
              <p className="text-sm text-muted m-0 leading-[1.5]">Initiate your return online in under 2 minutes.</p>
            </div>
            <div className="bg-surface border border-line rounded-md p-[22px] px-5">
              <div className="text-[26px] mb-2.5">₹</div>
              <h3 className="font-serif text-[18px] font-medium m-0 mb-1.5">Full Refund</h3>
              <p className="text-sm text-muted m-0 leading-[1.5]">Refunded to your original payment method within 5–7 days.</p>
            </div>
          </div>
        </div>

        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">Return Eligibility</h2>
          <p className="text-[15px] text-ink-soft leading-[1.7] m-0 mb-2.5">Items are eligible for return if they meet all of the following:</p>
          <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold">Returned within 30 days of the delivery date</li>
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold">Unused, unwashed, and in original condition</li>
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold">All original tags and packaging intact</li>
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold">Not marked as "Final Sale" at the time of purchase</li>
          </ul>
        </div>

        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">Items Not Eligible for Return</h2>
          <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold">Items purchased on clearance or marked as Final Sale</li>
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold">Customised or personalised orders</li>
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold">Items that show signs of use, damage, or odour</li>
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold">Returns initiated after the 30-day window</li>
          </ul>
        </div>

        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">How to Return</h2>
          <table className="w-full border-collapse border border-line rounded-md overflow-hidden text-sm mt-1.5">
            <thead>
              <tr>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Step</th>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">What to do</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top font-semibold text-ink">1. Request</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">Go to My Orders, select the item, and click "Return Item".</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top font-semibold text-ink">2. Pack</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">Pack the item securely in its original packaging with all tags attached.</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top font-semibold text-ink">3. Drop off</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">Our courier will schedule a pickup or provide a drop-off location near you.</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top font-semibold text-ink">4. Refund</td>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top">Once we receive and inspect the item, your refund is processed within 5–7 business days.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">Exchanges</h2>
          <p className="text-[15px] text-ink-soft leading-[1.7] m-0 mb-2.5">We don't process direct exchanges at this time. To get a different colour or size, return your original item for a refund and place a new order.</p>
        </div>

        <div className="bg-accent-soft border-l-[3px] border-accent rounded-r-sm px-5 py-4 text-sm text-ink-soft leading-[1.55]">
          <strong>Need help?</strong> Reach us at <strong>+91 88903 08955</strong> or via our <a href="/contact" className="text-accent-deep font-semibold">contact form</a>. We typically respond within one business day.
        </div>
      </div>
    </main>
  )
}
