import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

const disclosures = [
  {
    title: "Privacy",
    documents: [
      ["RiverTrade Financial Privacy Notice", "Privacy information for RiverTrade account and financial services users."],
      ["RiverTrade Digital Asset Privacy Notice", "Privacy practices for digital asset and portfolio services."],
      ["RiverTrade Children and Young Users Notice", "Additional privacy information for younger visitors and users."],
    ],
  },
  {
    title: "Risk And Trading",
    documents: [
      ["Digital Asset Risk Disclosure", "Important risks connected with cryptocurrency and digital asset markets."],
      ["Market Volatility Disclosure", "How price volatility, liquidity, and market conditions may affect investments."],
      ["Investment Plan Disclosure", "General information about plan terms, returns, timing, and performance risk."],
      ["Managed Account Risk Disclosure", "Risks and responsibilities related to managed portfolio services."],
    ],
  },
  {
    title: "Account And Service Notices",
    documents: [
      ["Electronic Communications Agreement", "Consent and delivery terms for electronic account communications."],
      ["Customer Identification Notice", "Identity verification and anti-money-laundering information."],
      ["Fees And Availability Disclosure", "General notice about fees, processing times, and service availability."],
      ["Business Continuity Summary", "How RiverTrade plans to maintain essential services during disruptions."],
    ],
  },
];

function DisclosureFooter() {
  return <footer className="disclosure-footer"><div><strong>RiverTrade</strong><span>Clear information for informed decisions.</span></div><nav><Link href="/">Home</Link><Link href="/about">About</Link><Link href="/contact">Support</Link><Link href="/auth?mode=register">Open an account</Link></nav><small>© {new Date().getFullYear()} RiverTrade. Review all disclosures carefully before using financial services.</small></footer>;
}

export default function DisclosuresPage() {
  return <><SiteHeader /><main className="disclosure-page"><div className="disclosure-hero"><p className="eyebrow">RiverTrade legal center</p><h1>Disclosure Library</h1><p>Important information about privacy, digital assets, investment services, account responsibilities, and operational risks.</p></div><div className="disclosure-list">{disclosures.map(group => <section key={group.title}><div className="disclosure-section-heading"><span>Library</span><h2>{group.title}</h2></div><div className="disclosure-grid">{group.documents.map(([title, description]) => <article key={title}><div><h3>{title}</h3><p>{description}</p></div><a href="/contact">Request document <span aria-hidden="true">↗</span></a></article>)}</div></section>)}</div></main><DisclosureFooter /></>;
}