export default function Shipping() {
  return (
    <main className="max-w-[860px] mx-auto pt-10 px-8 pb-20 max-sm:pt-8 max-sm:px-4 max-sm:pb-[60px]">
      <div className="mb-12 border-b border-line pb-9 max-sm:mb-8 max-sm:pb-6">
        <span className="hero-eyebrow">Delivery Information</span>
        <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-medium mt-2.5 mb-3.5 tracking-[-0.5px] leading-[1.1]">Shipping Policy</h1>
        <p className="text-base text-ink-soft leading-relaxed m-0 max-w-[600px]">We deliver across India. Here's everything you need to know about how and when your order arrives.</p>
      </div>

      <div className="flex flex-col gap-10">
        <div className="info-block">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mt-1.5">
            <div className="bg-surface border border-line rounded-md p-[22px] px-5">
              <div className="text-[26px] mb-2.5">⛟</div>
              <h3 className="font-serif text-[18px] font-medium m-0 mb-1.5">Free Shipping</h3>
              <p className="text-sm text-muted m-0 leading-[1.5]">On all orders over ₹2,000 — no code needed.</p>
            </div>
            <div className="bg-surface border border-line rounded-md p-[22px] px-5">
              <div className="text-[26px] mb-2.5">📦</div>
              <h3 className="font-serif text-[18px] font-medium m-0 mb-1.5">Standard Delivery</h3>
              <p className="text-sm text-muted m-0 leading-[1.5]">4–7 business days across most of India.</p>
            </div>
            <div className="bg-surface border border-line rounded-md p-[22px] px-5">
              <div className="text-[26px] mb-2.5">⚡</div>
              <h3 className="font-serif text-[18px] font-medium m-0 mb-1.5">Express Delivery</h3>
              <p className="text-sm text-muted m-0 leading-[1.5]">2–3 business days available at checkout.</p>
            </div>
            <div className="bg-surface border border-line rounded-md p-[22px] px-5">
              <div className="text-[26px] mb-2.5">🔍</div>
              <h3 className="font-serif text-[18px] font-medium m-0 mb-1.5">Order Tracking</h3>
              <p className="text-sm text-muted m-0 leading-[1.5]">Track your shipment via the link in your confirmation email.</p>
            </div>
          </div>
        </div>

        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">Shipping Rates</h2>
          <table className="w-full border-collapse border border-line rounded-md overflow-hidden text-sm mt-1.5">
            <thead>
              <tr>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Order Value</th>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Standard (4–7 days)</th>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Express (2–3 days)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top font-semibold text-ink">Below ₹2,000</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">₹79</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">₹149</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top font-semibold text-ink">₹2,000 – ₹4,999</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">Free</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">₹99</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top font-semibold text-ink">₹5,000 and above</td>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top">Free</td>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top">Free</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">Delivery Timeline</h2>
          <p className="text-[15px] text-ink-soft leading-[1.7] m-0 mb-2.5">Orders placed before 2 PM on a business day are dispatched the same day. Orders placed after 2 PM or on weekends/holidays are dispatched the next business day.</p>
          <p className="text-[15px] text-ink-soft leading-[1.7] m-0 mb-2.5">Delivery estimates begin from the dispatch date, not the order date. Remote areas (pin codes flagged by our courier partners) may require an additional 1–2 days.</p>
        </div>

        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">Courier Partners</h2>
          <p className="text-[15px] text-ink-soft leading-[1.7] m-0 mb-2.5">We ship with trusted logistics partners including Delhivery, Blue Dart, and Shiprocket. Your tracking number will indicate which carrier handles your shipment.</p>
        </div>

        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">Packaging</h2>
          <p className="text-[15px] text-ink-soft leading-[1.7] m-0 mb-2.5">Every order is packed in our signature kraft paper packaging with tissue wrap and a branded thank-you card. Bulk or corporate orders are packed in a single outer carton to reduce material waste.</p>
        </div>

        <div className="bg-accent-soft border-l-[3px] border-accent rounded-r-sm px-5 py-4 text-sm text-ink-soft leading-[1.55]">
          <strong>Important:</strong> We currently ship within India only. International shipping is not available at this time. For bulk or wholesale enquiries, please <a href="/contact" className="text-accent-deep font-semibold">contact us</a>.
        </div>
      </div>
    </main>
  )
}
