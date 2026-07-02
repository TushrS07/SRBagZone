export default function SizeGuide() {
  return (
    <main className="max-w-[860px] mx-auto pt-10 px-8 pb-20 max-sm:pt-8 max-sm:px-4 max-sm:pb-[60px]">
      <div className="mb-12 border-b border-line pb-9 max-sm:mb-8 max-sm:pb-6">
        <span className="hero-eyebrow">Find Your Fit</span>
        <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-medium mt-2.5 mb-3.5 tracking-[-0.5px] leading-[1.1]">Size Guide</h1>
        <p className="text-base text-ink-soft leading-relaxed m-0 max-w-[600px]">All dimensions are measured flat. Actual capacity may vary slightly by model due to pockets and compartments.</p>
      </div>

      <div className="flex flex-col gap-10">
        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">Handbags</h2>
          <table className="w-full border-collapse border border-line rounded-md overflow-hidden text-sm mt-1.5">
            <thead>
              <tr>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Size</th>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Width</th>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Height</th>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Depth</th>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Best for</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top font-semibold text-ink">Mini</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">20 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">15 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">8 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">Evenings, essentials only</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top font-semibold text-ink">Small</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">26 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">20 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">10 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">Daily errands, light carry</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top font-semibold text-ink">Medium</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">32 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">25 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">12 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">Work, college, all-day use</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top font-semibold text-ink">Large</td>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top">40 cm</td>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top">30 cm</td>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top">15 cm</td>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top">Overnight, heavy carry</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">Backpacks</h2>
          <table className="w-full border-collapse border border-line rounded-md overflow-hidden text-sm mt-1.5">
            <thead>
              <tr>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Size</th>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Width</th>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Height</th>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Depth</th>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Capacity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top font-semibold text-ink">Compact (15L)</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">28 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">38 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">14 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">Day trips, light carry</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top font-semibold text-ink">Standard (20L)</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">30 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">44 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">16 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">Work, college daily use</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top font-semibold text-ink">Large (30L)</td>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top">34 cm</td>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top">50 cm</td>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top">20 cm</td>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top">Weekend travel, hiking</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">School Bags</h2>
          <table className="w-full border-collapse border border-line rounded-md overflow-hidden text-sm mt-1.5">
            <thead>
              <tr>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Size</th>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Width</th>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Height</th>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Depth</th>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Suitable for</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top font-semibold text-ink">Junior (12L)</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">24 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">34 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">12 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">Classes 1–5</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top font-semibold text-ink">Mid (18L)</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">28 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">40 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">15 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">Classes 6–10</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top font-semibold text-ink">Senior (22L)</td>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top">32 cm</td>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top">46 cm</td>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top">17 cm</td>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top">Classes 11–12, college</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">Travel Bags</h2>
          <table className="w-full border-collapse border border-line rounded-md overflow-hidden text-sm mt-1.5">
            <thead>
              <tr>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Size</th>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Width</th>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Height</th>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Depth</th>
                <th className="bg-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.6px] text-ink-soft border-b border-line">Trip length</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top font-semibold text-ink">Weekender (35L)</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">50 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">30 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">25 cm</td>
                <td className="px-4 py-3.5 border-b border-line text-ink-soft align-top">1–3 nights</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top font-semibold text-ink">Duffle (50L)</td>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top">60 cm</td>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top">34 cm</td>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top">28 cm</td>
                <td className="px-4 py-3.5 border-b-0 text-ink-soft align-top">4–7 nights</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="info-block">
          <h2 className="font-serif text-2xl font-medium m-0 mb-4 tracking-[-0.3px] text-ink max-sm:text-xl">How to Measure</h2>
          <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold"><strong>Width</strong> — measured across the widest point of the bag, front to front</li>
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold"><strong>Height</strong> — measured from the base to the top of the body (excluding handles or straps)</li>
            <li className="text-[15px] text-ink-soft leading-[1.55] pl-5 relative before:content-['–'] before:absolute before:left-0 before:text-accent before:font-semibold"><strong>Depth</strong> — measured from the front panel to the back panel at the widest point</li>
          </ul>
        </div>

        <div className="bg-accent-soft border-l-[3px] border-accent rounded-r-sm px-5 py-4 text-sm text-ink-soft leading-[1.55]">
          <strong>Tip:</strong> If you're between sizes, go one size up — a slightly larger bag is always easier to use than one that's too small.
        </div>
      </div>
    </main>
  )
}
