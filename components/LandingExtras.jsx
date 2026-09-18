const features = [
  ["reg.png", "CREATE YOUR ACCOUNT", "Sign up to access your secure investor dashboard."],
  ["invest.png", "CHOOSE AN INVESTMENT PLAN", "Browse our curated crypto investment options."],
  ["earn.png", "FUND & EARN", "Deposit using crypto and watch your investment grow."],
  ["hibernate.png", "REGULATED & COMPLIANT", "We operate with full regulatory compliance, ensuring your funds are protected", true],
  ["tracking.png", "REAL-TIME TRACKING", "Monitor your investments live with our intuitive dashboard"],
  ["support.png", "24/7 EXPERT SUPPORT", "Round-the-clock assistance from our crypto professionals"],
  ["payment.png", "PAYMENT OPTIONS", "Popular methods: Bitcoin, Ethereum, bank transfer, cryptocurrency"],
  ["globe.png", "WORLD COVERAGE", "Providing services in 99% countries around all the globe"],
  ["secure.png", "STRONG SECURITY", "Protection against DDoS attacks, full data encryption"],
];

export default function LandingExtras() {
  return (
    <>
      <section className="landing-features bg-black px-5 py-14 text-white sm:px-10 lg:px-12">
        <div className="mx-auto grid max-w-[1800px] grid-cols-2 gap-x-5 gap-y-16 sm:grid-cols-3 lg:grid-cols-5">
          {features.map(([image, title, description]) => (
            <article className="landing-feature-card group min-h-61.25 bg-transparent px-4 py-5 text-center transition duration-300 hover:bg-black hover:shadow-[0_0_18px_rgba(96,37,37,0.8)]" key={title}>
              <img className="mx-auto mb-5 h-24 w-24 object-contain" src={`/icoinred/${image}`} alt="" />
              <h3 className="text-base font-semibold leading-7 tracking-wide text-white transition-colors duration-300 group-hover:text-[#602525]">{title}</h3>
              <p className="mx-auto mt-3 max-w-70 text-sm leading-6 text-white">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="bg-[#602525] px-5 pb-16 pt-5 text-black sm:px-10 lg:px-12">
        <div className="mx-auto max-w-375">
          <div className="flex flex-col gap-6 border-b border-black/15 pb-7 md:flex-row md:items-center md:justify-between">
            <img className="h-10 w-auto" src="/icoinred/river_black.svg" alt="Company Logo" />
            <div className="flex items-center gap-5 text-sm">
              <span>Follow us on</span>
              <div className="flex gap-4 text-lg" aria-label="Social media links">
                <a href="#" aria-label="X">X</a>
                <a href="#" aria-label="Instagram">◎</a>
                <a href="#" aria-label="LinkedIn">in</a>
                <a href="#" aria-label="TikTok">♪</a>
                <a href="#" aria-label="YouTube">▶</a>
              </div>
            </div>
          </div>
          <div className="grid gap-8 pt-8 sm:grid-cols-2 lg:grid-cols-[0.8fr_1fr_1.2fr_2fr]">
            <div>
              <h3 className="text-base font-bold">Product</h3>
              <a className="mt-4 block text-sm hover:underline" href="/auth?mode=register">Invest</a>
            </div>
            <div>
              <h3 className="text-base font-bold">Company</h3>
              <a className="mt-4 block text-sm hover:underline" href="/about">About us</a>
              <a className="mt-3 block text-sm hover:underline" href="/contact">Support</a>
            </div>
            <div>
              <h3 className="text-base font-bold">Legal &amp; Regulatory</h3>
              <a className="mt-4 block text-sm hover:underline" href="/pdf%20docum/Terms%20and%20Conditions.pdf" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</a>
              <a className="mt-3 block text-sm hover:underline" href="/disclosures">Disclosures</a>
              <a className="mt-3 block text-sm hover:underline" href="/pdf%20docum/Law-Enforcement-Request.pdf" target="_blank" rel="noopener noreferrer">Law Enforcement Requests</a>
            </div>
            <div className="max-w-xl">
              <h3 className="text-base font-bold">Secure &amp; Fast Transactions.</h3>
              <p className="mt-4 text-sm leading-6"><strong>Brokerage services</strong> are offered through River Financial LLC (“RHF”), a registered broker dealer...</p>
              <p className="mt-3 text-sm leading-6"><strong>Portfolio Management</strong> offered through Rivertrade Asset Management LLC (“RAM”)...</p>
              <p className="mt-3 text-sm leading-6"><strong>Futures and cleared trading</strong> is offered by River Derivatives, LLC (“RHD”)...</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
