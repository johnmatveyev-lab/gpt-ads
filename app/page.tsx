import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import AvaChat from "@/components/AvaChat";
import LeadAuditForm from "@/components/LeadAuditForm";
import { formatPhoneDisplay } from "@/lib/phone";

const bookingUrl = process.env.BOOKING_URL || "https://cal.com";
const avaPhoneNumber = process.env.NEXT_PUBLIC_AVA_PHONE_NUMBER || "+12296006648";
const avaPhoneDisplay = formatPhoneDisplay(avaPhoneNumber);

const processSteps = [
  {
    icon: MessageCircle,
    title: "Talk with Ava",
    body: "Share your business, offer, audience, location, and current marketing setup.",
  },
  {
    icon: Target,
    title: "Strategy & Fit Review",
    body: "We score readiness, flag policy caveats, and map likely conversation moments.",
  },
  {
    icon: ShieldCheck,
    title: "Onboarding & Setup",
    body: "Prepare landing pages, tracking, creative, context hints, and approval materials.",
  },
  {
    icon: TrendingUp,
    title: "Launch & Scale",
    body: "Run measured tests, watch performance, and scale what the platform proves.",
  },
];

const solutions = [
  "Home services",
  "Local retail",
  "Education and tutoring",
  "Fitness and wellness",
  "Restaurants and hospitality",
  "B2B local services",
];

const faqs = [
  {
    question: "Are you officially partnered with OpenAI?",
    answer:
      "This service is independent unless verified partnership proof is explicitly added. We help businesses prepare for ChatGPT Ads using public OpenAI Ads guidance and client-side launch operations.",
  },
  {
    question: "Can you guarantee leads or ad placement?",
    answer:
      "No. OpenAI controls eligibility, review, pricing, delivery, and reporting. We help improve readiness, tracking, positioning, and campaign operations, but we do not guarantee outcomes.",
  },
  {
    question: "Who is this for?",
    answer:
      "The first version is built for local businesses that want to understand whether ChatGPT Ads could become a useful growth channel before the market gets crowded.",
  },
  {
    question: "What happens after the readiness audit?",
    answer:
      "You get a practical fit result with opportunities, risks, and a recommended next step. Strong-fit or review-needed leads can book a human launch-readiness call.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="hero" id="top">
        <nav className="nav" aria-label="Main navigation">
          <a className="brand" href="#top" aria-label="GPT Ads Launch home">
            <span className="brandMark">
              <Sparkles size={22} />
            </span>
            GPT Ads Launch
          </a>
          <div className="navLinks">
            <a href="#why">Why ChatGPT Ads</a>
            <a href="#process">How It Works</a>
            <a href="#solutions">Solutions</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <a className="navPhone" href={`tel:${avaPhoneNumber}`}>
            <Phone size={16} />
            {avaPhoneDisplay}
          </a>
          <a className="navButton" href={bookingUrl} target="_blank" rel="noreferrer">
            Book a Call
          </a>
        </nav>

        <div className="heroGrid">
          <div className="heroCopy">
            <div className="eyebrow">
              <span />
              ChatGPT Ads readiness for local businesses
            </div>
            <h1>Advertise where high-intent conversations are happening.</h1>
            <p className="heroLead">
              Get your local business ready for ChatGPT Ads with a practical launch audit, policy-aware
              setup, and a clear path from curiosity to qualified campaigns.
            </p>
            <div className="heroActions">
              <a className="primaryButton" href="#audit">
                Get My Readiness Audit
                <ArrowRight size={22} />
              </a>
              <a className="secondaryButton" href="#ava">
                Talk with Ava
              </a>
              <a className="secondaryButton" href={`tel:${avaPhoneNumber}`}>
                <Phone size={18} />
                Call Ava: {avaPhoneDisplay}
              </a>
            </div>
            <div className="benefitRow" aria-label="Key benefits">
              <Benefit icon={Users} title="High-intent moments" body="Show up near research and comparison." />
              <Benefit icon={ShieldCheck} title="Policy-aware setup" body="Avoid risky claims before launch." />
              <Benefit icon={BarChart3} title="Measured growth" body="Track leads, bookings, and conversion quality." />
            </div>
          </div>

          <div className="heroVisual" aria-label="ChatGPT ad preview and Ava consultation card">
            <div className="glowLogo">GPT</div>
            <div className="phoneMock">
              <div className="phoneTop">ChatGPT</div>
              <div className="chatBubble">What is the best way to find a trusted local contractor?</div>
              <p className="chatIntro">Here are some helpful options to compare:</p>
              <div className="sponsoredCard">
                <span>Sponsored</span>
                <div className="sponsoredBody">
                  <div className="adIcon">
                    <TrendingUp size={34} />
                  </div>
                  <div>
                    <strong>Your Business</strong>
                    <p>Clear local offer, strong landing page, measurable next step.</p>
                    <small>Learn more &rarr;</small>
                  </div>
                </div>
              </div>
              <div className="phoneLines">
                <i />
                <i />
                <i />
              </div>
            </div>
            <div className="avaCard" id="ava">
              <div className="avatar">A</div>
              <div>
                <p>Talk with Ava</p>
                <strong>Your AI Growth Consultant</strong>
                <ul>
                  <li>Understand your business</li>
                  <li>Evaluate ChatGPT Ads fit</li>
                  <li>Share next steps</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section light" id="why">
        <div className="sectionHeader">
          <p className="kicker">Why ChatGPT Ads</p>
          <h2>A new placement requires a new readiness checklist.</h2>
          <p>
            ChatGPT Ads are paid, labeled placements. They do not alter ChatGPT answers, do not mean
            OpenAI endorses the advertiser, and do not guarantee delivery in a specific conversation.
            That makes setup, claims, tracking, and landing-page clarity matter from day one.
          </p>
        </div>
        <div className="insightGrid">
          <Insight icon={MessageCircle} title="Conversation context" body="Plan around the questions customers ask before they choose a provider." />
          <Insight icon={CircleDollarSign} title="CPC and CPM buying" body="Prepare campaign objectives, bids, and measurement expectations before launch." />
          <Insight icon={MapPin} title="Local intent" body="Build landing pages and offers that make sense for service areas and real customer needs." />
        </div>
      </section>

      <section className="section dark" id="process">
        <div className="sectionHeader">
          <p className="kicker">Our simple process</p>
          <h2>From conversation to launch plan in 4 steps.</h2>
        </div>
        <div className="processGrid">
          {processSteps.map((step, index) => (
            <article className="processCard" key={step.title}>
              <span className="stepNumber">{index + 1}</span>
              <step.icon size={30} />
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section light" id="solutions">
        <div className="sectionHeader">
          <p className="kicker">Built for local growth</p>
          <h2>Start with the businesses that win on clear intent.</h2>
          <p>
            We focus the first version on local businesses with concrete offers, defined service areas,
            and trackable customer actions.
          </p>
        </div>
        <div className="solutionGrid">
          {solutions.map((solution) => (
            <article className="solutionCard" key={solution}>
              <CheckCircle2 size={22} />
              <h3>{solution}</h3>
              <p>Audit offer clarity, search intent, landing-page readiness, and policy fit.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section auditSection" id="audit">
        <div className="auditIntro">
          <p className="kicker">Lead magnet</p>
          <h2>Get a ChatGPT Ads Readiness Audit.</h2>
          <p>
            Answer a few focused questions and get a readiness score, opportunity map, and next-step
            recommendation. No fake partner claims. No guaranteed-results theater. Just the useful stuff.
          </p>
        </div>
        <LeadAuditForm bookingUrl={bookingUrl} />
      </section>

      <section className="section dark" id="pricing">
        <div className="sectionHeader">
          <p className="kicker">Packages</p>
          <h2>Choose the level of launch help you need.</h2>
        </div>
        <div className="pricingGrid">
          <PriceCard title="Readiness Audit" price="Free" body="AI-guided fit review, policy flags, and recommended next step." />
          <PriceCard title="Launch Setup" price="Custom" body="Landing page, tracking, creative checklist, and campaign setup planning." featured />
          <PriceCard title="Managed Growth" price="Custom" body="Ongoing testing, reporting, optimization, and expansion planning." />
        </div>
      </section>

      <section className="section light" id="faq">
        <div className="sectionHeader">
          <p className="kicker">FAQ</p>
          <h2>Clear answers before you spend.</h2>
        </div>
        <div className="faqList">
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div>
          <strong>GPT Ads Launch</strong>
          <p>
            Independent ChatGPT Ads readiness and campaign-support service for local businesses.
            Availability, review, pricing, and delivery are controlled by OpenAI and may change.
          </p>
        </div>
        <a href="/admin">Admin</a>
      </footer>

      <AvaChat bookingUrl={bookingUrl} phoneNumber={avaPhoneNumber} />
    </main>
  );
}

function Benefit({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Users;
  title: string;
  body: string;
}) {
  return (
    <div className="benefit">
      <Icon size={25} />
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
    </div>
  );
}

function Insight({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Users;
  title: string;
  body: string;
}) {
  return (
    <article className="insightCard">
      <Icon size={28} />
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}

function PriceCard({
  title,
  price,
  body,
  featured = false,
}: {
  title: string;
  price: string;
  body: string;
  featured?: boolean;
}) {
  return (
    <article className={featured ? "priceCard featured" : "priceCard"}>
      <h3>{title}</h3>
      <strong>{price}</strong>
      <p>{body}</p>
      <a href="#audit">Start here</a>
    </article>
  );
}
