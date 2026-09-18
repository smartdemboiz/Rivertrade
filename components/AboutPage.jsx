import Link from "next/link";

const stats = [
  { value: "50,000", label: "users", detail: "27% growth" },
  { value: "100+", label: "pairs", detail: "15 new this month" },
  { value: "24/7", label: "support", detail: "10 min avg. response" },
  { value: "99.9%", label: "uptime", detail: "Enterprise security" },
];

const journey = [
  {
    title: "Foundation — 2021",
    text: "Founded by a team of traders and engineers with the goal of simplifying access to markets.",
  },
  {
    title: "Growth — 2022",
    text: "Reached early traction, grew user base and expanded team across continents.",
  },
  {
    title: "Innovation — 2023",
    text: "Launched AI-powered trading tools and expanded market coverage to 100+ pairs.",
  },
];

const experts = [
  {
    initials: "JD",
    name: "James Donovan",
    role: "CEO & Founder",
    bio: "Former hedge fund manager with extensive trading experience.",
  },
  {
    initials: "MP",
    name: "Maria Patel",
    role: "CTO",
    bio: "Tech leader focused on platform reliability and innovation.",
  },
  {
    initials: "TW",
    name: "Thomas Eric",
    role: "Head of Security",
    bio: "Cybersecurity expert dedicated to protecting user assets.",
  },
  {
    initials: "SL",
    name: "Sarah Lee",
    role: "Customer Success",
    bio: "Helping users onboard and get value from the platform.",
  },
];

const testimonials = [
  {
    quote: "River Trade Investment has transformed my trading — intuitive, powerful, reliable.",
    author: "James Miller — Day Trader, London",
  },
  {
    quote: "The AI trading bots helped me automate strategies with solid risk controls.",
    author: "Sarah Chen — Investor, Singapore",
  },
  {
    quote: "Educational resources and community support made my first trades easy.",
    author: "Robert Garcia — New Trader, Toronto",
  },
];

export default function AboutPage() {
  return (
    <main className="about-legacy-page">
      <section className="about-legacy-top">
        <div className="about-legacy-copy">
          <h1>
            <span className="accent">Our</span> Mission &amp; Vision
          </h1>

          <p className="about-intro">
            Empowering traders with cutting-edge technology and innovative solutions. We focus on
            security, UX, and broad market access — delivering tools that make trading accessible to
            everyone.
          </p>

          <div className="about-feature-box mission-box">
            <h2>Our Mission</h2>
            <p>
              To democratize trading by providing accessible, powerful tools that empower individuals to
              participate in financial markets with confidence and security.
            </p>
          </div>

          <div className="about-feature-box vision-box">
            <h2>Our Vision</h2>
            <p>
              To become the world&apos;s leading platform for digital asset trading, known for innovation,
              security, and exceptional user experience.
            </p>
          </div>

          <div className="about-company-box">
            <h3>About the company</h3>
            <p>
              River Trade Investment was founded in 2021 with a mission to provide best-in-class trading
              products and a secure, reliable platform. We continually invest in security and engineering to
              scale globally.
            </p>
          </div>

          <p className="about-focus">
            Focus areas: institutional-grade security, advanced algos, multi-asset market access, and
            community-led product improvements. Strategic ambitions include expanding private market offerings
            and maintaining the highest data-protection standards globally.
          </p>
        </div>

        <aside className="about-stats-panel">
          <div className="stats-header">
            <h3>Company Stats</h3>
            <span>2023 Data</span>
          </div>
          <div className="stats-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-box">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
                <small>{stat.detail}</small>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="about-journey">
            <h2>Our Journey</h2>
            <p>From foundation to global expansion — milestones that shaped our platform.</p>
            <div className="journey-grid">
              {journey.map((item) => (
                <article key={item.title} className="journey-card">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
      </section>

      <section className="about-experts">
            <h2>Meet Our Experts</h2>
            <p>The leadership and builders behind River Trade.</p>
            <div className="experts-grid">
              {experts.map((person) => (
                <article key={person.name} className="expert-card">
                  <div className="expert-badge">{person.initials}</div>
                  <h3>{person.name}</h3>
                  <span>{person.role}</span>
                  <p>{person.bio}</p>
                </article>
              ))}
            </div>
      </section>

      <section className="about-testimonials">
            <h2>Trader Testimonials</h2>
            <p>Hear from the community.</p>
            <div className="testimonials-grid">
              {testimonials.map((item) => (
                <article key={item.author} className="testimonial-card">
                  <blockquote>“{item.quote}”</blockquote>
                  <p>{item.author}</p>
                </article>
              ))}
            </div>
      </section>

      <section className="community-cta">
            <div>
              <h2>Join Our Community</h2>
              <p>Become part of a growing community of traders shaping the future of finance.</p>
            </div>
            <div className="cta-actions">
              <Link href="/auth?mode=register" className="primary-btn">Create Account</Link>
              <Link href="/contact" className="secondary-btn">Contact Us</Link>
            </div>
      </section>
    </main>
  );
}
