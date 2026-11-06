import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
} from "motion/react";
import {
  ArrowUpRight,
  ArrowUp,
  Plus,
  Minus,
  Menu,
  X,
  Check,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Globe2,
} from "lucide-react";
import { content, type Language } from "../lib/content";
import ScrollPresentation from "../components/scroll-presentation";

const image = (name: string) => `/images/${name}`;
const photos = [
  "ZDJECIE-NR-4-1024x683.jpg",
  "d8749c46-ebe8-4397-ab30-86e420214e43-1-scaled.jpg",
  "AdobeStock_236168004-scaled.jpg",
  "AdobeStock_169334489-scaled.jpg",
  "AdobeStock_294382576-scaled.jpg",
  "e484a68b-8f5c-4281-bdc1-f208534bb5f2-1-1024x683.jpg",
];
const categories = [3, 1, 2, 3, 2, 1];
const ids = ["services", "about", "gallery", "contact"];

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function Budmir() {
  const [lang, setLang] = useState<Language>(() => {
    const l = localStorage.getItem("budmir-language");
    return l === "de" ? l : "pl";
  });
  const [menu, setMenu] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [draft, setDraft] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const c = content[lang];
  const reduced = useReducedMotion();
  const pageScroll = useScroll();
  const visiblePhotos = useMemo(
    () =>
      photos
        .map((_, i) => i)
        .filter((i) => filter === 0 || categories[i] === filter),
    [filter],
  );
  const galleryButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    localStorage.setItem("budmir-language", lang);
    document.documentElement.lang = lang;
    document.title =
      lang === "pl"
        ? "Budmir — Usługi budowlane i stolarskie"
        : "Budmir — Bauleistungen & Tischlerei";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", c.intro + " " + c.region);
  }, [lang, c]);

  useEffect(() => {
    if (lightbox === null) return;
    const oldOverflow = document.body.style.overflow;
    const galleryButton = galleryButtons.current[lightbox];
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const step = e.key === "ArrowRight" ? 1 : -1;
        setLightbox(
          visiblePhotos[
            (visiblePhotos.indexOf(lightbox) + step + visiblePhotos.length) %
              visiblePhotos.length
          ],
        );
      }
      if (e.key === "Tab") {
        const buttons = [
          ...document.querySelectorAll<HTMLButtonElement>(".lightbox button"),
        ];
        const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
        e.preventDefault();
        buttons[
          (at + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length
        ]?.focus();
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", key);
      galleryButton?.focus({ preventScroll: true });
    };
  }, [lightbox, visiblePhotos]);

  const changeLang = (l: Language) => {
    setLang(l);
    setDraft(false);
  };
  const emailDraft = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = `Budmir — ${c.services[Number(selectedService)]?.title ?? c.contactLabel}`;
    const body = `${c.name}: ${data.get("name")}\n${c.emailField}: ${data.get("email")}\n${c.serviceField}: ${c.services[Number(selectedService)]?.title ?? "-"}\n\n${data.get("message")}`;
    window.location.href = `mailto:biuro.budmir@wp.pl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setDraft(true);
  };
  const stepPhoto = (step: number) => {
    if (lightbox !== null)
      setLightbox(
        visiblePhotos[
          (visiblePhotos.indexOf(lightbox) + step + visiblePhotos.length) %
            visiblePhotos.length
        ],
      );
  };

  return (
    <>
      <motion.div
        className="scroll-progress"
        style={{ scaleX: pageScroll.scrollYProgress }}
      />
      <a className="skip-link" href="#services">
        {c.discover}
      </a>
      <header className="site-header">
        <a href="#home" className="brand" aria-label="Budmir">
          <img src={image("budmir_logo.png")} alt="Budmir" />
        </a>
        <nav className="desktop-nav" aria-label={c.menu}>
          {c.nav.map((n, i) => (
            <a href={`#${ids[i]}`} key={n}>
              {n}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <div className="languages" aria-label={c.lang}>
            <Globe2 size={15} />
            {(["pl", "de"] as Language[]).map((l) => (
              <button
                key={l}
                lang={l}
                aria-label={{ pl: "Polski", de: "Deutsch" }[l]}
                aria-pressed={lang === l}
                onClick={() => changeLang(l)}
                className={lang === l ? "active" : ""}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <a href="#contact" className="header-cta">
            {c.quote}
            <ArrowUpRight size={18} />
          </a>
          <button
            className="menu-toggle"
            aria-label={menu ? c.close : c.menu}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <AnimatePresence>
        {menu && (
          <motion.nav
            className="mobile-nav"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            {c.nav.map((n, i) => (
              <a href={`#${ids[i]}`} key={n} onClick={() => setMenu(false)}>
                <span>0{i + 1}</span>
                {n}
                <ArrowUpRight />
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>

      <main>
        <ScrollPresentation lang={lang} />

        <section className="trust-strip" aria-label={c.since}>
          <div className="trust-item">
            <span className="trust-number">
              20<span>+</span>
            </span>
            <div>
              {c.years}
              <small>{c.since}</small>
            </div>
          </div>
          <div className="trust-item">
            <Globe2 strokeWidth={1} size={32} />
            <div>
              {c.markets}
              <small>{c.region.split(" · ")[0]}</small>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-symbol">
              <Check size={23} strokeWidth={1.5} />
            </span>
            <div>
              {c.care}
              <small>BUDMIR</small>
            </div>
          </div>
        </section>

        <section id="services" className="section services-section">
          <Reveal>
            <p className="eyebrow muted-label">{c.serviceLabel}</p>
          </Reveal>
          <div className="section-heading">
            <Reveal>
              <h2>{c.serviceTitle}</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p>{c.serviceIntro}</p>
            </Reveal>
          </div>
          <div className="services-grid">
            {c.services.map((s, i) => (
              <Reveal className="service-card" key={i} delay={i * 0.1}>
                <div className="service-image">
                  <img
                    src={image([photos[1], photos[2], photos[0]][i])}
                    alt={s.title}
                    loading="lazy"
                  />
                  <span className="image-number">0{i + 1}</span>
                  <a
                    href="#contact"
                    className="image-arrow"
                    aria-label={`${c.quote}: ${s.title}`}
                    onClick={() => setSelectedService(String(i))}
                  >
                    <ArrowUpRight />
                  </a>
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="service-tags">{s.tags}</div>
                <button
                  className="service-expand"
                  aria-expanded={expanded === i}
                  aria-controls={`service-detail-${i}`}
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  {expanded === i ? c.less : c.more}
                  {expanded === i ? <Minus size={18} /> : <Plus size={18} />}
                </button>
                <AnimatePresence>
                  {expanded === i && (
                    <motion.div
                      id={`service-detail-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="service-details"
                    >
                      <p>{s.details}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="about" className="about-section">
          <div className="about-photo">
            <img
              src={image("AdobeStock_281520047-scaled.jpg")}
              loading="lazy"
              alt={c.services[0].title}
            />
            <div className="since-block">
              <span>2005</span>
              <small>{c.since}</small>
            </div>
          </div>
          <div className="about-content">
            <Reveal>
              <p className="eyebrow yellow-text">{c.aboutLabel}</p>
              <h2>{c.aboutTitle}</h2>
              <p>{c.aboutText}</p>
              <p>{c.aboutText2}</p>
              <div className="values">
                {c.values.map((v) => (
                  <div key={v}>
                    <Check size={17} />
                    {v}
                  </div>
                ))}
              </div>
              <a href="#contact" className="text-link">
                {c.aboutCta}
                <ArrowUpRight size={21} />
              </a>
            </Reveal>
          </div>
        </section>

        <section id="gallery" className="section gallery-section">
          <Reveal>
            <p className="eyebrow muted-label">{c.galleryLabel}</p>
          </Reveal>
          <div className="section-heading">
            <Reveal>
              <h2>{c.galleryTitle}</h2>
            </Reveal>
            <Reveal>
              <p>{c.galleryIntro}</p>
            </Reveal>
          </div>
          <div className="gallery-filters" aria-label={c.nav[2]}>
            {c.filters.map((f, i) => (
              <button
                className={filter === i ? "active" : ""}
                key={i}
                onClick={() => setFilter(i)}
                aria-pressed={filter === i}
              >
                {f}
                <span>{i === 0 ? "06" : "02"}</span>
              </button>
            ))}
          </div>
          <motion.div layout className="gallery-grid">
            <AnimatePresence mode="popLayout">
              {visiblePhotos.map((i) => (
                <motion.button
                  ref={(el) => {
                    galleryButtons.current[i] = el;
                  }}
                  layout
                  key={i}
                  className="gallery-item"
                  onClick={() => setLightbox(i)}
                  aria-label={`${c.view}: ${c.galleryNames[i]}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: reduced ? 0 : 0.35 }}
                >
                  <img
                    src={image(photos[i])}
                    alt={c.galleryNames[i]}
                    loading="lazy"
                  />
                  <div className="gallery-caption">
                    <span>{c.galleryNames[i]}</span>
                    <ArrowUpRight size={22} />
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
          <p className="gallery-note">{c.galleryNote}</p>
        </section>

        <section id="contact" className="contact-section">
          <div className="contact-intro">
            <Reveal>
              <p className="eyebrow">{c.contactLabel}</p>
              <h2>{c.contactTitle}</h2>
              <p>{c.contactIntro}</p>
            </Reveal>
            <div className="contact-details">
              <div>
                <Phone size={19} />
                <div>
                  <small>{c.phone}</small>
                  <a href="tel:+48604418078">+48 604 41 80 78</a>
                  <a href="tel:+4915752745423">+49 157 527 454 23</a>
                </div>
              </div>
              <div>
                <Mail size={19} />
                <div>
                  <small>{c.email}</small>
                  <a href="mailto:biuro.budmir@wp.pl">biuro.budmir@wp.pl</a>
                </div>
              </div>
              <div>
                <MapPin size={19} />
                <div>
                  <small>{c.address}</small>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=M%C5%82y%C5%84ska+9a+Krosno+Odrza%C5%84skie"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Budmir Mirosław Wojdyła
                    <br />
                    ul. Młyńska 9a
                    <br />
                    66-600 Krosno Odrzańskie
                  </a>
                </div>
              </div>
            </div>
          </div>
          <Reveal className="contact-form-wrap">
            <form onSubmit={emailDraft}>
              <div className="form-row">
                <label>
                  {c.name}
                  <input
                    aria-label={c.name}
                    name="name"
                    autoComplete="name"
                    required
                    placeholder={
                      lang === "pl"
                        ? "Jan Kowalski"
                        : lang === "de"
                          ? "Max Mustermann"
                          : "Alex Smith"
                    }
                  />
                </label>
                <label>
                  {c.emailField}
                  <input
                    aria-label={c.emailField}
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="name@example.com"
                  />
                </label>
              </div>
              <label>
                {c.serviceField}
                <select
                  aria-label={c.serviceField}
                  name="service"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    {c.choose}
                  </option>
                  {c.services.map((s, i) => (
                    <option value={i} key={i}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {c.message}
                <textarea
                  aria-label={c.message}
                  name="message"
                  rows={4}
                  required
                  placeholder={c.contactIntro}
                />
              </label>
              <button type="submit" className="button dark-button">
                {c.send}
                <ArrowUpRight size={21} />
              </button>
              <p className="form-note">{c.formNote}</p>
              {draft && (
                <output className="draft-status">
                  <Check size={19} />
                  {c.draft}
                </output>
              )}
            </form>
          </Reveal>
        </section>
      </main>
      <footer>
        <div className="footer-top">
          <a href="#home" className="footer-brand">
            <img src={image("budmir_logo.png")} alt="Budmir" />
          </a>
          <p>{c.footer}</p>
          <a href="#home" className="top-button" aria-label={c.back}>
            <ArrowUp size={20} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Budmir Mirosław Wojdyła. {c.rights}
          </span>
          <span>{c.region}</span>
        </div>
      </footer>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.dialog
            className="lightbox"
            open
            aria-modal="true"
            aria-label={c.galleryNames[lightbox]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setLightbox(null);
            }}
          >
            <button
              ref={closeRef}
              className="lightbox-close"
              aria-label={c.close}
              onClick={() => setLightbox(null)}
            >
              <X />
            </button>
            <button
              className="lightbox-prev"
              aria-label={c.prev}
              onClick={(e) => {
                e.stopPropagation();
                stepPhoto(-1);
              }}
            >
              <ChevronLeft />
            </button>
            <figure>
              <img
                src={image(photos[lightbox])}
                alt={c.galleryNames[lightbox]}
              />
              <figcaption>
                {c.galleryNames[lightbox]}
                <span>
                  {visiblePhotos.indexOf(lightbox) + 1} / {visiblePhotos.length}
                </span>
              </figcaption>
            </figure>
            <button
              className="lightbox-next"
              aria-label={c.next}
              onClick={(e) => {
                e.stopPropagation();
                stepPhoto(1);
              }}
            >
              <ChevronRight />
            </button>
          </motion.dialog>
        )}
      </AnimatePresence>
    </>
  );
}
