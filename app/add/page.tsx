import Link from "next/link";
import { Shell } from "@/components/Shell";
import { nextUpWhatsAppLink } from "@/lib/community";

type Plan = {
  name: string;
  price: string;
  label: string;
  description: string;
  features: string[];
  unavailable?: string[];
  featured?: boolean;
};

const plans: Plan[] = [
  {
    name: "Free",
    price: "₹0",
    label: "For getting started",
    description: "Explore the essentials and see what NextUp is about.",
    features: ["Limited access to live listings", "Basic headlines", "Community access"],
    unavailable: ["Premium content", "Advanced AI insights", "Personalized recommendations", "Offline reading"],
  },
  {
    name: "Basic",
    price: "₹49",
    label: "For curious minds",
    description: "More discovery, more context, and useful tools for staying ahead.",
    features: ["Access to latest news and discoveries", "Limited premium content", "Basic AI insights", "Community access", "Bookmarks and saved topics", "Weekly digest"],
  },
  {
    name: "Pro",
    price: "₹99",
    label: "For deep learners",
    description: "The complete NextUp experience for serious builders and enthusiasts.",
    features: ["Everything in Basic", "Unlimited premium content", "Advanced AI insights and analysis", "Personalized recommendations", "Early access to new features", "Offline reading", "Priority support", "Expert collections"],
    featured: true,
  },
];

function whatsappFor(plan: Plan) {
  return nextUpWhatsAppLink(`Hi NextUp, I want to ask about the ${plan.name} plan (${plan.price}/month). Please share the next steps.`);
}

export default function AddSubscriptionPage() {
  return (
    <Shell>
      <main className="main subscription-page">
        <header className="subscription-hero">
          <div>
            <p className="eyebrow subscription-eyebrow">NextUp · Add subscription</p>
            <h1>Go further with <span>NextUp</span></h1>
            <p className="subscription-lede">Choose the level of access that fits you. Start free, move to Basic for more signal, or unlock the complete Pro experience.</p>
          </div>
          <div className="subscription-orbit" aria-hidden="true"><span>✦</span><i /><i /><i /></div>
        </header>

        <section aria-labelledby="plans-title">
          <div className="subscription-section-heading">
            <div><p className="eyebrow">Simple plans</p><h2 id="plans-title">Choose your plan</h2></div>
            <p>Plain pricing. No hidden tiers.</p>
          </div>
          <div className="subscription-grid">
            {plans.map((plan) => (
              <article className={`subscription-card${plan.featured ? " featured" : ""}`} key={plan.name}>
                {plan.featured && <span className="subscription-badge">Most value</span>}
                {!plan.featured && plan.name === "Basic" && <span className="subscription-badge muted">Popular choice</span>}
                <div className="subscription-card-icon" aria-hidden="true">{plan.name === "Free" ? "◇" : plan.name === "Basic" ? "✦" : "♛"}</div>
                <h3>{plan.name}</h3>
                <p className="subscription-description">{plan.description}</p>
                <p className="subscription-price">{plan.price}<small>/month</small></p>
                <ul className="subscription-features">
                  {plan.features.map((feature) => <li key={feature}><span className="feature-check" aria-hidden="true">✓</span>{feature}</li>)}
                  {plan.unavailable?.map((feature) => <li className="unavailable" key={feature}><span className="feature-cross" aria-hidden="true">×</span>{feature}</li>)}
                </ul>
                {plan.name === "Free" ? <Link className="subscription-button secondary" href="/">Continue with Free <span>→</span></Link> : <a className="subscription-button" href={whatsappFor(plan)} target="_blank" rel="noreferrer">Ask about {plan.name} <span>→</span></a>}
              </article>
            ))}
          </div>
        </section>

        <section className="subscription-whatsapp" aria-labelledby="whatsapp-title">
          <div><p className="eyebrow">WhatsApp support</p><h2 id="whatsapp-title">Need help choosing or paying?</h2><p>Use the WhatsApp flow from the local NextUp app for plan questions, payment guidance, and event registration support.</p></div>
          <a className="subscription-button" href={nextUpWhatsAppLink("Hi NextUp, I need help choosing a plan or completing payment.")} target="_blank" rel="noreferrer">Message NextUp on WhatsApp <span>↗</span></a>
        </section>

        <section className="subscription-trust" aria-label="NextUp benefits">
          <div><strong>Latest discoveries</strong><span>From science to space</span></div>
          <div><strong>AI-powered insights</strong><span>Smarter, faster, deeper</span></div>
          <div><strong>Community access</strong><span>Find your next group</span></div>
          <div><strong>Human support</strong><span>WhatsApp when you need it</span></div>
        </section>
      </main>
    </Shell>
  );
}
