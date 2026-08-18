import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../landing.css";

const SIGNATURE_MEDICINES = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    pharmacy: "Kaldi's Pharmacy",
    distance: "0.4 km",
    price: "120 ETB",
    tag: "In stock",
    tagClass: "",
    image: "https://images.pexels.com/photos/3683103/pexels-photo-3683103.jpeg?auto=compress&cs=tinysrgb&w=400",
    slug: "paracetamol",
  },
  {
    id: 2,
    name: "Ibuprofen 400mg",
    pharmacy: "Bole Meds",
    distance: "0.8 km",
    price: "145 ETB",
    tag: "In stock",
    tagClass: "",
    image: "https://images.pexels.com/photos/143654/pexels-photo-143654.jpeg?auto=compress&cs=tinysrgb&w=400",
    slug: "ibuprofen-400mg",
  },
  {
    id: 3,
    name: "Amoxicillin 250mg",
    pharmacy: "Piassa Central",
    distance: "1.2 km",
    price: "210 ETB",
    tag: "Low stock",
    tagClass: "low",
    image: "https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=400",
    slug: "amoxicillin-250mg",
  },
  {
    id: 4,
    name: "ORS Rehydration",
    pharmacy: "Megenagna Pharmacy",
    distance: "1.5 km",
    price: "65 ETB",
    tag: "In stock",
    tagClass: "",
    image: "https://images.pexels.com/photos/9902135/pexels-photo-9902135.jpeg?auto=compress&cs=tinysrgb&w=400",
    slug: "ors-rehydration",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "I searched for my mother's blood pressure medicine at 11pm and found a pharmacy still open, two blocks away. That alone sold me.",
    author: "Selam M.",
    role: "Patient, Addis Ababa",
    initials: "SM",
    avatarBg: "var(--coral)",
  },
  {
    quote:
      "The refill reminder for my vitamins is oddly the feature I use the most. It just texts me right when I'm about to run out.",
    author: "Daniel K.",
    role: "Patient, Nairobi",
    initials: "DK",
    avatarBg: "var(--teal)",
  },
  {
    quote:
      "We listed our full inventory in one afternoon. Going verified and listing real stock paid for itself in the first week of extra foot traffic.",
    author: "Hanna P.",
    role: "Owner, Piassa Central Pharmacy",
    initials: "HP",
    avatarBg: "var(--violet)",
  },
  {
    quote:
      "Price comparison saved me real money on a monthly prescription I'd been buying at the same place for years out of habit.",
    author: "Amara R.",
    role: "Patient, Lagos",
    initials: "AR",
    avatarBg: "var(--pink)",
  },
];

const FAQS = [
  {
    question: "Is MedFinder free to use?",
    answer:
      "Searching, comparing prices, and finding nearby pharmacies is always free for patients. Verified community pharmacies can list and manage their shelf inventory directly.",
  },
  {
    question: "How are pharmacies verified?",
    answer:
      "Every pharmacy submits its licensing credentials and verification documents during sign-up, which our operations team verifies before the official verified badge is issued.",
  },
  {
    question: "What does MedFinder do for pharmacies?",
    answer:
      "MedFinder connects your live pharmacy shelves directly to nearby patients actively looking for specific medications, driving foot traffic and reducing wasted inquiries.",
  },
  {
    question: "Can I consult directly with a pharmacist?",
    answer:
      "Yes — MedFinder offers a direct live consultation channel allowing you to confirm current stock counts, verify dosage forms, and inquire before making a trip.",
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFaq, setActiveFaq] = useState(0);

  const sceneRef = useRef(null);
  const testiTrackRef = useRef(null);
  const statsRef = useRef(null);
  const [countersStarted, setCountersStarted] = useState(false);
  const [counts, setCounts] = useState({
    users: 0,
    pharmacies: 0,
    countries: 0,
    stockRate: 0,
  });

  // 1. Mouse-move Parallax Physics on Hero Scene
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const handleMouseMove = (e) => {
      const r = scene.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      const capsules = scene.querySelectorAll(".capsule");
      capsules.forEach((el, i) => {
        const depth = (i + 1) * 12;
        el.style.transform = `translate(${x * depth}px, ${y * depth}px) rotate(${x * 10}deg)`;
      });
    };

    const handleMouseLeave = () => {
      const capsules = scene.querySelectorAll(".capsule");
      capsules.forEach((el) => {
        el.style.transform = "";
      });
    };

    scene.addEventListener("mousemove", handleMouseMove);
    scene.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      scene.removeEventListener("mousemove", handleMouseMove);
      scene.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // 2. Animated Stat Counters with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !countersStarted) {
          setCountersStarted(true);
          const dur = 1400;
          const start = performance.now();

          const step = (now) => {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setCounts({
              users: Math.round(eased * 180000),
              pharmacies: Math.round(eased * 4200),
              countries: Math.round(eased * 41),
              stockRate: Math.round(eased * 97),
            });
            if (p < 1) requestAnimationFrame(step);
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [countersStarted]);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    } else {
      navigate("/search");
    }
  };

  const scrollTestimonials = (direction) => {
    if (!testiTrackRef.current) return;
    const offset = direction === "next" ? 340 : -340;
    testiTrackRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <div className="landing-page">
      {/* ── HERO SECTION ── */}
      <section className="landing-hero">
        <div className="landing-hero-glow" />
        <div>
          <div className="landing-eyebrow">
            <span className="pulse" />
            Live in 40+ cities · Verified Stock Network
          </div>
          <h1>
            Find the <span className="hl1">medicine</span> you need,
            <br />
            <span className="hl2">right nearby.</span>
          </h1>
          <p className="landing-lede">
            MedFinder checks live stock at pharmacies around you, compares prices,
            and confirms availability in real time — so you're never caught without.
          </p>

          <form onSubmit={handleHeroSearch} className="landing-hero-search">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#A9A390"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Try “ibuprofen 400mg”, “amoxicillin”, or “paracetamol”"
              aria-label="Search medicine availability"
            />
            <button type="submit">
              Search nearby
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          <div className="landing-hero-trust">
            <div>
              <span className="ic teal">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#087A5F" strokeWidth="2.2">
                  <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </span>
              Verified pharmacies
            </div>
            <div>
              <span className="ic violet">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5A4AD1" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
              </span>
              Live stock status
            </div>
            <div>
              <span className="ic sun">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8A317" strokeWidth="2.2">
                  <path d="M12 21c-4-4-7-7.5-7-11a7 7 0 0114 0c0 3.5-3 7-7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </span>
              Nearest-first
            </div>
          </div>
        </div>

        <div className="landing-scene" ref={sceneRef}>
          <div className="photo-blob p1 float">
            <img
              src="https://images.pexels.com/photos/3683041/pexels-photo-3683041.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Medicine capsules"
            />
          </div>
          <div className="photo-blob p2 float" style={{ animationDelay: "1.5s" }}>
            <img
              src="https://images.pexels.com/photos/9155926/pexels-photo-9155926.jpeg?auto=compress&cs=tinysrgb&w=400"
              alt="Pharmaceutical tablets"
            />
          </div>
          <div className="capsule c1">
            <div className="half" />
            <div className="half" />
          </div>
          <div className="capsule c2">
            <div className="half" />
            <div className="half" />
          </div>
          <div className="stat-chip float" style={{ animationDelay: "0.8s" }}>
            <div>
              <div className="n">2 min</div>
              <div className="l">avg. time to find stock</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HIGHLIGHT STRIP ── */}
      <div className="landing-strip">
        <div>
          <span className="dot" style={{ background: "var(--sun)" }} />
          Price comparison
        </div>
        <div>
          <span className="dot" style={{ background: "var(--coral)" }} />
          Open-now filter
        </div>
        <div>
          <span className="dot" style={{ background: "var(--teal)" }} />
          GPS Distance Ranking
        </div>
        <div>
          <span className="dot" style={{ background: "var(--violet)" }} />
          Live Pharmacist Chat
        </div>
        <div>
          <span className="dot" style={{ background: "var(--pink)" }} />
          Verified Shelf Inventory
        </div>
      </div>

      {/* ── STATS SECTION ── */}
      <section className="landing-stats-section" ref={statsRef}>
        <div className="landing-stats-grid">
          <div className="landing-stat-card">
            <div className="big">{counts.users.toLocaleString()}</div>
            <div className="lbl">people using MedFinder</div>
          </div>
          <div className="landing-stat-card">
            <div className="big">{counts.pharmacies.toLocaleString()}</div>
            <div className="lbl">verified pharmacies</div>
          </div>
          <div className="landing-stat-card">
            <div className="big">{counts.countries}</div>
            <div className="lbl">countries and regions</div>
          </div>
          <div className="landing-stat-card">
            <div className="big">{counts.stockRate}%</div>
            <div className="lbl">found medication in stock</div>
          </div>
        </div>
      </section>

      {/* ── SIGNATURE BLISTER MEDICINE SHOWCASE ── */}
      <section className="landing-section" id="medicines">
        <div className="landing-section-head">
          <div className="landing-eyebrow" style={{ margin: "0 auto 16px", display: "inline-flex" }}>
            Signature layout
          </div>
          <h2>Browse medicines like they sit on the shelf.</h2>
          <p>
            Find essential pharmaceuticals with up-to-date pricing and confirmed availability across
            licensed community pharmacies.
          </p>
        </div>

        <div className="landing-blister">
          {SIGNATURE_MEDICINES.map((med) => (
            <Link key={med.id} to={`/search?q=${encodeURIComponent(med.name)}`} className="landing-cell">
              <div className="thumb">
                <img src={med.image} alt={med.name} />
                <span className={`tag ${med.tagClass}`}>{med.tag}</span>
              </div>
              <div className="body">
                <h3>{med.name}</h3>
                <div className="meta">
                  {med.pharmacy} · {med.distance}
                </div>
                <div className="row">
                  <span className="price">{med.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── PHARMACIST ONBOARDING SPLIT ── */}
      <section className="landing-split" id="pharmacists">
        <div className="photo">
          <img
            src="/img/three.jpg"
            alt="Pharmacist managing shelf inventory in a modern drugstore"
          />
        </div>
        <div>
          <span className="tag-eyebrow">For pharmacists & store owners</span>
          <h2>Bring your pharmacy online in an afternoon.</h2>
          <p>
            Sign up, get verified, and list what's on your shelves. Nearby patients find you the
            moment they search for medications you stock.
          </p>
          <div className="landing-checklist">
            <div>
              <span className="tick">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              List medicines and live stock in minutes
            </div>
            <div>
              <span className="tick">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              Verified badge once your license is validated
            </div>
            <div>
              <span className="tick">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              Direct pharmacist consultation channel
              <span className="badge-pro">PRO</span>
            </div>
          </div>
          <div className="landing-cta-row">
            <Link to="/pharmacies/new" className="landing-btn-primary">
              Join as a pharmacy
            </Link>
            <Link to="/search" className="landing-btn-ghost">
              Search live stock
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      <section className="landing-testi-wrap" id="reviews">
        <div className="blob-glow" />
        <div className="landing-section-head">
          <div
            className="landing-eyebrow"
            style={{
              margin: "0 auto 16px",
              display: "inline-flex",
              background: "#1e2638",
              borderColor: "#2c3448",
              color: "var(--sun)",
            }}
          >
            What people are saying
          </div>
          <h2>Trusted by patients & pharmacists every day.</h2>
          <p>
            Real feedback from community members who rely on MedFinder to verify medications before
            traveling.
          </p>
        </div>

        <div className="landing-testi-track" ref={testiTrackRef}>
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="landing-t-card">
              <div className="stars">★★★★★</div>
              <p>&ldquo;{t.quote}&rdquo;</p>
              <div className="who">
                <div className="landing-avatar" style={{ background: t.avatarBg }}>
                  {t.initials}
                </div>
                <div>
                  <div className="name">{t.author}</div>
                  <div className="role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="landing-testi-nav">
          <button onClick={() => scrollTestimonials("prev")} aria-label="Previous testimonial">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button onClick={() => scrollTestimonials("next")} aria-label="Next testimonial">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section className="landing-section" id="faq">
        <div className="landing-section-head">
          <div className="landing-eyebrow" style={{ margin: "0 auto 16px", display: "inline-flex" }}>
            Good to know
          </div>
          <h2>Frequently asked questions</h2>
        </div>

        <div className="landing-faq-wrap">
          {FAQS.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div key={index} className={`landing-faq-item ${isOpen ? "open" : ""}`}>
                <div
                  className="landing-faq-q"
                  onClick={() => setActiveFaq(isOpen ? -1 : index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveFaq(isOpen ? -1 : index);
                    }
                  }}
                >
                  {faq.question}
                  <span className="plus">+</span>
                </div>
                <div className="landing-faq-a">{faq.answer}</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
