import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ArrowDown, ArrowUpRight, RotateCcw } from "lucide-react";
import { content, type Language } from "../lib/content";

const images = [
  "AdobeStock_5309810-scaled.jpg",
  "ZDJECIE-NR-4-1024x683.jpg",
  "d8749c46-ebe8-4397-ab30-86e420214e43-1-scaled.jpg",
  "AdobeStock_169334489-scaled.jpg",
];
const chapters = {
  pl: {
    labels: ["Przestrzeń", "Kuchnia", "Wykończenia", "Na wymiar"],
    titles: [
      "",
      "TWOJA KUCHNIA.\nTWÓJ STYL.",
      "PIĘKNO TKWI\nW DETALACH.",
      "DOPASOWANE\nDO TWOJEGO ŻYCIA.",
    ],
    descriptions: [
      "",
      "Meble na wymiar, które łączą codzienną wygodę z ponadczasową estetyką.",
      "Starannie wykończone wnętrza. Od pierwszej płytki po ostatni detal.",
      "Przemyślana stolarka i zabudowy, które wykorzystują potencjał Twojej przestrzeni.",
    ],
    scroll: "PRZEWIJAJ, ABY PRZEJŚĆ DALEJ",
    skip: "Przejdź do usług",
    replay: "Zobacz od początku",
    jump: "Przejdź do slajdu",
    nav: "Slajdy prezentacji",
  },
  de: {
    labels: ["Raum", "Küche", "Innenausbau", "Nach Maß"],
    titles: [
      "",
      "IHRE KÜCHE.\nIHR STIL.",
      "SCHÖNHEIT LIEGT\nIM DETAIL.",
      "PASSEND\nZU IHREM LEBEN.",
    ],
    descriptions: [
      "",
      "Möbel nach Maß, die Alltagstauglichkeit und zeitlose Ästhetik verbinden.",
      "Sorgfältig gestaltete Räume. Von der ersten Fliese bis zum letzten Detail.",
      "Durchdachte Tischlerarbeiten und Einbauten, die das Potenzial Ihrer Räume nutzen.",
    ],
    scroll: "WEITERSCROLLEN UND ENTDECKEN",
    skip: "Zu den Leistungen",
    replay: "Von vorne ansehen",
    jump: "Zum nächsten Bild",
    nav: "Präsentationsbilder",
  },
};

function ChapterLine({
  index,
  progress,
}: {
  index: number;
  progress: MotionValue<number>;
}) {
  const fill = useTransform(progress, [index / 4, (index + 1) / 4], [0, 1]);
  return (
    <span className="chapter-line">
      <motion.span style={{ scaleX: fill }} />
    </span>
  );
}

function Scene({
  index,
  progress,
  lang,
}: {
  index: number;
  progress: MotionValue<number>;
  lang: Language;
}) {
  const start = index === 0 ? 0 : index / 4 - 0.07;
  const end = (index + 1) / 4;
  const opacity = useTransform(
    progress,
    index === 0 ? [0, 0.2, 0.29] : [start, start + 0.1, end + 0.01, end + 0.09],
    index === 0 ? [1, 1, 0] : [0, 1, 1, 0],
  );
  const scale = useTransform(progress, [start, end + 0.09], [1.02, 1.38]);
  const x = useTransform(
    progress,
    [start, end + 0.09],
    index % 2 === 0 ? ["3%", "-7%"] : ["-3%", "5%"],
  );
  const y = useTransform(progress, [start, end + 0.09], ["2%", "-4%"]);
  const textOpacity = useTransform(
    progress,
    [start + 0.05, start + 0.12, end - 0.005, end + 0.045],
    [0, 1, 1, 0],
  );
  const textY = useTransform(
    progress,
    [start + 0.05, start + 0.12, end, end + 0.05],
    [45, 0, 0, -45],
  );
  const textBlur = useTransform(
    textOpacity,
    [0, 1],
    ["blur(7px)", "blur(0px)"],
  );
  const s = chapters[lang];
  return (
    <motion.div
      className="walkthrough-scene"
      style={{ opacity }}
      aria-hidden="true"
    >
      <motion.div className="walkthrough-camera" style={{ scale, x, y }}>
        <img
          src={`/images/${images[index]}`}
          alt=""
          fetchPriority={index === 0 ? "high" : "auto"}
        />
      </motion.div>
      <div
        className={
          index === 0 ? "walkthrough-shade intro-shade" : "walkthrough-shade"
        }
      />
      {index > 0 && (
        <motion.div
          className="walkthrough-copy"
          style={{ opacity: textOpacity, y: textY, filter: textBlur }}
        >
          <p className="eyebrow">
            <span className="yellow-dot" /> BUDMIR / 0{index + 1}
          </p>
          <h2>{s.titles[index]}</h2>
          <p>{s.descriptions[index]}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function ScrollPresentation({ lang }: { lang: Language }) {
  const c = content[lang];
  const s = chapters[lang];
  const reduced = useReducedMotion();
  const track = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(96);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({
    target: track,
    offset: [`start ${headerHeight}px`, "end end"],
  });
  const introOpacity = useTransform(scrollYProgress, [0, 0.1, 0.22], [1, 1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.22], [0, -85]);
  const introScale = useTransform(scrollYProgress, [0, 0.22], [1, 0.93]);
  useMotionValueEvent(scrollYProgress, "change", (p) =>
    setActive(Math.min(3, Math.floor((p + 0.005) * 4))),
  );

  useEffect(() => {
    const query = window.matchMedia("(max-width: 800px)");
    const update = () => setHeaderHeight(query.matches ? 80 : 96);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const goTo = (index: number) => {
    if (!track.current) return;
    const top =
      window.scrollY + track.current.getBoundingClientRect().top - headerHeight;
    const travel =
      track.current.offsetHeight - (window.innerHeight - headerHeight);
    window.scrollTo({
      top: top + travel * (index === 0 ? 0 : index / 4 + 0.065),
      behavior: reduced ? "auto" : "smooth",
    });
  };

  return (
    <section
      id="home"
      ref={track}
      className={`cinematic-track ${reduced ? "static-presentation" : ""}`}
      aria-label={s.nav}
    >
      <div
        className="hero walkthrough-viewport"
        data-chapter={reduced ? 0 : active}
      >
        {reduced ? (
          <div className="walkthrough-scene">
            <div className="walkthrough-camera">
              <img
                src={`/images/${images[0]}`}
                alt={c.services[1].title}
                fetchPriority="high"
              />
            </div>
            <div className="walkthrough-shade intro-shade" />
          </div>
        ) : (
          images.map((_, i) => (
            <Scene key={i} index={i} progress={scrollYProgress} lang={lang} />
          ))
        )}
        <div className="hero-grid" />
        <motion.div
          className="hero-content walkthrough-intro"
          style={
            reduced
              ? {}
              : { opacity: introOpacity, y: introY, scale: introScale }
          }
          inert={!reduced && active > 0}
        >
          <motion.p
            className="eyebrow hero-eyebrow"
            initial={reduced ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <span className="yellow-dot" />
            {c.region}
          </motion.p>
          <h1>
            {c.hero.map((line, i) => (
              <span className="title-mask" key={line}>
                <motion.span
                  initial={reduced ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.9,
                    delay: 0.25 + i * 0.13,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={i === 1 ? "yellow-text" : ""}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
          >
            <p className="hero-description">{c.intro}</p>
            <a href="#services" className="button yellow-button">
              {c.discover}
              <ArrowUpRight size={21} />
            </a>
          </motion.div>
        </motion.div>
        {!reduced && (
          <>
            <div className="walkthrough-topline">
              <span>BUDMIR — {s.labels[active].toUpperCase()}</span>
              <a href="#services">
                {s.skip}
                <ArrowUpRight size={14} />
              </a>
            </div>
            <nav className="chapter-navigation" aria-label={s.nav}>
              {s.labels.map((label, i) => (
                <button
                  key={i}
                  className={active === i ? "active" : ""}
                  aria-label={`${s.jump}: ${label}`}
                  aria-current={active === i ? "step" : undefined}
                  onClick={() => goTo(i)}
                >
                  <span className="chapter-number">0{i + 1}</span>
                  <span className="chapter-name">{label}</span>
                  <ChapterLine index={i} progress={scrollYProgress} />
                </button>
              ))}
            </nav>
            <p className="sr-only" aria-live="polite">
              {s.labels[active]}
            </p>
          </>
        )}
        <div className="hero-bottom walkthrough-bottom">
          <button
            className="scroll-link"
            onClick={() =>
              reduced
                ? document.getElementById("services")?.scrollIntoView()
                : goTo(active < 3 ? active + 1 : 0)
            }
          >
            <span className="circle-arrow">
              {active === 3 && !reduced ? (
                <RotateCcw size={16} />
              ) : (
                <ArrowDown size={16} />
              )}
            </span>
            {active === 3 && !reduced ? s.replay : s.scroll}
          </button>
          <span>{c.since}</span>
          <span className="hero-index">
            0{reduced ? 1 : active + 1} <span>/ 04</span>
          </span>
        </div>
        {!reduced && (
          <motion.div
            className="walkthrough-progress"
            style={{ scaleX: scrollYProgress }}
          />
        )}
      </div>
    </section>
  );
}
