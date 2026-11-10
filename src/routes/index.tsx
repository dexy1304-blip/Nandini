import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Heart,
  Image as ImageIcon,
  Music2,
  Pause,
  Play,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { loveConfig } from "@/config/love-config";
import { addCaughtHeart, allPromisesSealed, HEART_GAME_GOAL } from "@/lib/love-rules";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: loveConfig.websiteTitle },
      {
        name: "description",
        content:
          "A heartfelt note from Sahil to Nandini, made with love and the hope of doing better.",
      },
      { property: "og:title", content: loveConfig.websiteTitle },
      {
        property: "og:description",
        content:
          "A heartfelt note from Sahil to Nandini, made with love and the hope of doing better.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ApologyPage,
});

const noMessages = [
  "Are you sure? 🥺",
  "Think again...",
  "Pretty please?",
  "I'll buy chocolates 🍫",
  "Don't do this to me.",
];
const heartPositions = [9, 28, 48, 69, 88, 18, 42, 62, 79, 35];
const noButtonPositions = [
  "no-place-one",
  "no-place-two",
  "no-place-three",
  "no-place-four",
  "no-place-five",
];

function ApologyPage() {
  const [entered, setEntered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Audio file not found or autoplay prevented:", err);
          setIsPlaying(false);
        });
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);

  const formatTime = (seconds: number) => {
    if (!seconds || Number.isNaN(seconds) || !Number.isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const [selectedMemory, setSelectedMemory] = useState<number | null>(null);
  const [flippedReasons, setFlippedReasons] = useState<number[]>([]);
  const [sealedPromises, setSealedPromises] = useState<number[]>([]);
  const [gameScore, setGameScore] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [noAttempts, setNoAttempts] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [easterEgg, setEasterEgg] = useState(false);
  const [trail, setTrail] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [celebration, setCelebration] = useState(false);
  const trailId = useRef(0);
  const touchStartX = useRef<number | null>(null);

  const anniversary = useMemo(() => {
    if (!loveConfig.anniversaryDate) return null;
    const date = new Date(`${loveConfig.anniversaryDate}T00:00:00`);
    return Number.isNaN(date.getTime()) || date.getTime() > now.getTime() ? null : date;
  }, [now]);
  const elapsed = anniversary ? Math.max(0, now.getTime() - anniversary.getTime()) : null;
  const elapsedDays = elapsed === null ? null : Math.floor(elapsed / 86_400_000);
  const elapsedHours = elapsed === null ? null : Math.floor((elapsed % 86_400_000) / 3_600_000);
  const elapsedMinutes = elapsed === null ? null : Math.floor((elapsed % 3_600_000) / 60_000);
  const promisesComplete = allPromisesSealed(sealedPromises.length, loveConfig.promises.length);
  const gameComplete = gameScore >= HEART_GAME_GOAL;

  useEffect(() => {
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollable <= 0 ? 0 : window.scrollY / scrollable);
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [entered]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedMemory && selectedMemory !== 0) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedMemory(null);
      if (event.key === "ArrowLeft")
        setSelectedMemory((current) =>
          current === null
            ? null
            : (current + loveConfig.memories.length - 1) % loveConfig.memories.length,
        );
      if (event.key === "ArrowRight")
        setSelectedMemory((current) =>
          current === null ? null : (current + 1) % loveConfig.memories.length,
        );
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedMemory]);

  useEffect(() => {
    if (trail.length === 0) return;
    const timer = window.setTimeout(() => setTrail((items) => items.slice(-2)), 800);
    return () => window.clearTimeout(timer);
  }, [trail]);

  const enterSite = useCallback(() => {
    setEntered(true);
    window.setTimeout(
      () => document.getElementById("home")?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  }, []);

  const catchHeart = useCallback(() => setGameScore((score) => addCaughtHeart(score)), []);

  const celebrate = useCallback(() => {
    setAccepted(true);
    setCelebration(true);
    window.setTimeout(() => setCelebration(false), 5200);
    window.setTimeout(
      () => document.getElementById("thank-you")?.scrollIntoView({ behavior: "smooth" }),
      500,
    );
  }, []);

  const trackPointer = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && trailId.current % 4 === 0) {
      const id = trailId.current++;
      setTrail((items) => [...items.slice(-7), { id, x: event.clientX, y: event.clientY }]);
    } else if (event.pointerType === "touch") {
      const id = trailId.current++;
      setTrail((items) => [...items.slice(-7), { id, x: event.clientX, y: event.clientY }]);
    } else {
      trailId.current += 1;
    }
  }, []);

  const changeMemory = useCallback((direction: number) => {
    setSelectedMemory((current) =>
      current === null
        ? null
        : (current + direction + loveConfig.memories.length) % loveConfig.memories.length,
    );
  }, []);

  const noLabel = noMessages[Math.min(Math.max(0, noAttempts - 1), noMessages.length - 1)];

  return (
    <div className="love-site" onPointerMove={trackPointer}>
      <audio
        ref={audioRef}
        src={loveConfig.audioFile}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      {trail.map((item) => (
        <span
          key={item.id}
          className="cursor-heart"
          style={{ left: item.x, top: item.y }}
          aria-hidden="true"
        >
          ♥
        </span>
      ))}

      {!entered && (
        <section className="envelope-screen" aria-label="A note for Nandini">
          <div className="envelope-scene">
            <span className="envelope-sparkle sparkle-a" aria-hidden="true">
              ✦
            </span>
            <span className="envelope-sparkle sparkle-b" aria-hidden="true">
              ✧
            </span>
            <span className="envelope-sparkle sparkle-c" aria-hidden="true">
              ✦
            </span>
            <div className="envelope-illustration" aria-hidden="true">
              <div className="letter-peek">
                <Heart fill="currentColor" size={22} />
              </div>
              <div className="envelope-body">
                <span className="envelope-flap" />
                <span className="envelope-seal">
                  <Heart fill="currentColor" size={22} />
                </span>
              </div>
            </div>
            <p className="eyebrow">A LITTLE NOTE, FROM ME TO YOU</p>
            <h1>
              A little something
              <br />
              for you,
              <br />
              <em className="envelope-recipient">{loveConfig.herName}</em>
            </h1>
            <p className="envelope-intro">
              Whenever you’re ready, there’s something I want to say.
            </p>
            <Button className="pill-button envelope-button" onClick={enterSite}>
              Open my heart <Heart size={16} fill="currentColor" />
            </Button>
            <span className="envelope-signature">with love, {loveConfig.myName}</span>
          </div>
        </section>
      )}

      <div
        className={entered ? "site-content" : "site-content site-content-locked"}
        aria-hidden={!entered}
      >
        <header className="progress-header">
          <a className="mini-brand" href="#home" aria-label="Back to the beginning">
            for {loveConfig.nickname} <Heart size={13} fill="currentColor" />
          </a>
          <div
            className="progress-hearts"
            aria-label={`${Math.round(scrollProgress * 100)} percent through the page`}
          >
            {[0, 1, 2, 3, 4].map((step) => (
              <Heart
                key={step}
                size={14}
                fill={scrollProgress >= step / 5 ? "currentColor" : "none"}
              />
            ))}
          </div>
          <span className="progress-caption">a note from {loveConfig.myName}</span>
        </header>

        <main>
          <section id="home" className="hero-section">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="eyebrow-rule" />A LETTER FOR YOU
                <span className="eyebrow-rule" />
              </p>
              <h1>
                Hey,
                <br />
                <span className="hero-recipient">{loveConfig.herName}</span>
                <br />
                <em>I’m really sorry.</em>
              </h1>
              <p className="hero-lede">
                Please read till the end. I made this little corner of the internet just for you.
              </p>
              <a href="#letter" className="scroll-cue">
                <span className="scroll-cue-icon">
                  <ArrowDown size={17} />
                </span>
                There’s something I want you to know
              </a>
            </div>
            <div className="hero-photo-wrap">
              <img
                className="hero-photo"
                src={loveConfig.memories[0].image}
                alt="Sahil and Nandini together"
                width={960}
                height={1280}
                fetchPriority="high"
              />
              <span className="hero-photo-caption">a little love, for you</span>
              <Heart className="hero-heart hero-heart-one" fill="currentColor" size={19} />
              <Heart className="hero-heart hero-heart-two" fill="currentColor" size={12} />
            </div>
            <div className="hero-number" aria-hidden="true">
              01 <span>/ 11</span>
            </div>
          </section>

          <section id="letter" className="section letter-section">
            <div className="section-heading">
              <p className="eyebrow">THE THINGS I SHOULD HAVE SAID</p>
              <h2>
                A note from <em>my heart</em>
              </h2>
            </div>
            <article className="apology-paper">
              <div className="paper-corner" aria-hidden="true">
                ✳
              </div>
              <div className="paper-content">
                {loveConfig.apologyMessage.map((paragraph, index) => (
                  <p
                    key={`${index}-${paragraph}`}
                    className={
                      index === 0
                        ? "paper-salutation"
                        : index === loveConfig.apologyMessage.length - 1
                          ? "paper-signoff"
                          : ""
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="paper-flower" aria-hidden="true">
                ✿
              </div>
            </article>
            <p className="letter-aside">
              No rush, no expectations. I just wanted to be honest with you.
            </p>
          </section>

          <section id="favourites" className="section favourites-section">
            <div className="section-heading section-heading-row">
              <div>
                <p className="eyebrow">THE LITTLE THINGS I NOTICE</p>
                <h2>
                  Things that feel <em>like you.</em>
                </h2>
              </div>
              <p className="heading-aside">
                A few favourites I’ve learned from you, and one thing I can’t help noticing.
              </p>
            </div>
            <div className="favourites-grid">
              {loveConfig.favouriteThings.map((thing, index) => (
                <article className="favourite-card" key={thing.label}>
                  <span className="favourite-number">0{index + 1}</span>
                  <p className="eyebrow">{thing.label}</p>
                  <h3>{thing.title}</h3>
                  <p>{thing.note}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="memories" className="section memories-section">
            <div className="section-heading section-heading-row">
              <div>
                <p className="eyebrow">LITTLE MOMENTS, BIG MEANING</p>
                <h2>
                  Us, in <em>little frames</em>
                </h2>
              </div>
              <p className="heading-aside">
                The good things aren’t just in the big moments. Sometimes, they’re in the little
                ones.
              </p>
            </div>
            <div className="memory-grid">
              {loveConfig.memories.map((memory, index) => (
                <button
                  key={`${memory.title}-${index}`}
                  type="button"
                  className={`polaroid polaroid-${index + 1}`}
                  onClick={() => setSelectedMemory(index)}
                  aria-label={`Open memory: ${memory.title}`}
                >
                  <span className="polaroid-image">
                    {memory.image ? (
                      <img
                        src={memory.image}
                        alt={`${memory.title}: Sahil and Nandini together`}
                        loading="lazy"
                      />
                    ) : (
                      <span className="memory-placeholder">
                        <ImageIcon size={25} strokeWidth={1.3} />
                        <span>your photo goes here</span>
                      </span>
                    )}
                    <span className="photo-count">0{index + 1} / 06</span>
                  </span>
                  <span className="polaroid-copy">
                    {memory.date && <span className="polaroid-date">{memory.date}</span>}
                    <span className="polaroid-caption">{memory.caption}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="memory-note">
              <span className="tiny-dash" />
              Six moments, kept close.
            </p>
          </section>

          <section id="days" className="days-section">
            <div className="days-inner">
              <div className="days-copy">
                <p className="eyebrow">EVER SINCE OUR BEGINNING</p>
                <h2>
                  Time with you
                  <br />
                  is time <em>well spent.</em>
                </h2>
                <p>Every one of these days with you matters to me.</p>
              </div>
              <div className="counter-wrap" aria-live="polite">
                <div className="counter-item">
                  <strong>{elapsedDays === null ? "—" : elapsedDays}</strong>
                  <span>days</span>
                </div>
                <span className="counter-divider">:</span>
                <div className="counter-item">
                  <strong>
                    {elapsedHours === null ? "—" : String(elapsedHours).padStart(2, "0")}
                  </strong>
                  <span>hours</span>
                </div>
                <span className="counter-divider">:</span>
                <div className="counter-item">
                  <strong>
                    {elapsedMinutes === null ? "—" : String(elapsedMinutes).padStart(2, "0")}
                  </strong>
                  <span>minutes</span>
                </div>
              </div>
              {!anniversary && (
                <p className="date-placeholder">
                  <Clock3 size={13} /> Add your anniversary in the personal details when you’re
                  ready.
                </p>
              )}
              <Heart
                className="days-outline-heart"
                size={94}
                strokeWidth={0.7}
                aria-hidden="true"
              />
            </div>
          </section>

          <section id="reasons" className="section reasons-section">
            <div className="section-heading">
              <p className="eyebrow">TEN THINGS, AND THEN SOME</p>
              <h2>
                In case you <em>forgot</em>
              </h2>
              <p className="section-description">
                A few of the many things I love about you, Nandini.
              </p>
            </div>
            <div className="reason-grid">
              {loveConfig.reasons.map((reason, index) => {
                const flipped = flippedReasons.includes(index);
                return (
                  <button
                    type="button"
                    key={`${index}-${reason}`}
                    className={`reason-card ${flipped ? "reason-flipped" : ""}`}
                    onClick={() =>
                      setFlippedReasons((items) =>
                        flipped ? items.filter((item) => item !== index) : [...items, index],
                      )
                    }
                    aria-label={`Reason ${index + 1}${flipped ? ": " + reason : ". Reveal reason"}`}
                    aria-pressed={flipped}
                  >
                    <span className="reason-card-inner">
                      <span className="reason-front">
                        <span className="reason-index">REASON 0{index + 1}</span>
                        <Heart size={24} strokeWidth={1.5} />
                        <span className="reason-prompt">tap to turn</span>
                      </span>
                      <span className="reason-back">
                        <span className="reason-index">A LITTLE THING I LOVE</span>
                        <span className="reason-text">{reason}</span>
                        <Sparkles size={17} />
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section id="promises" className="promise-section">
            <div className="section-heading">
              <p className="eyebrow">WORDS I WANT TO LIVE BY</p>
              <h2>
                Not just words.
                <br />
                <em>Promises, from me.</em>
              </h2>
              <p className="section-description">
                Tap a heart to open a promise. The only way to seal them is with time and action.
              </p>
            </div>
            <div className="promise-list">
              {loveConfig.promises.map((promise, index) => {
                const sealed = sealedPromises.includes(index);
                return (
                  <Button
                    key={`${index}-${promise}`}
                    variant="ghost"
                    className={`promise-row ${sealed ? "promise-sealed" : ""}`}
                    onClick={() =>
                      setSealedPromises((items) => (sealed ? items : [...items, index]))
                    }
                    aria-pressed={sealed}
                  >
                    <span className="promise-heart">
                      {sealed ? <Check size={18} /> : <Heart size={21} />}
                    </span>
                    <span className="promise-number">0{index + 1}</span>
                    <span className="promise-copy">
                      {sealed ? promise : "Tap to read a promise"}
                    </span>
                    <ArrowRight className="promise-arrow" size={17} />
                  </Button>
                );
              })}
            </div>
            {promisesComplete && (
              <p className="promise-complete" role="status">
                <Sparkles size={18} />
                Promises sealed 🤞❤️
              </p>
            )}
            <p className="promise-footnote">And I know a promise means nothing unless I keep it.</p>
          </section>

          <section id="game" className="game-section">
            <div className="game-copy">
              <p className="eyebrow">A LITTLE PAUSE</p>
              <h2>
                Catch a little
                <br />
                <em>bit of my heart.</em>
              </h2>
              <p>Tap a heart as it drifts by. There’s no rush.</p>
              <div className="game-score">
                <Heart size={17} fill="currentColor" />
                <strong>{gameScore}</strong>
                <span>/ {HEART_GAME_GOAL}</span>
              </div>
              {gameComplete && (
                <p className="game-success" role="status">
                  You’ve collected my whole heart ❤️
                </p>
              )}
            </div>
            <div
              className={`heart-garden ${gameComplete ? "garden-complete" : ""}`}
              aria-label="Tap the falling hearts to collect them"
            >
              <span className="garden-label">A LITTLE HEART FOR YOU</span>
              {heartPositions.map((position, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="icon"
                  className={`falling-heart falling-heart-${index + 1}`}
                  onClick={catchHeart}
                  aria-label="Collect a heart"
                  disabled={gameComplete}
                >
                  <Heart fill="currentColor" size={22 + (index % 3) * 3} />
                </Button>
              ))}
              <span className="garden-footer">
                {gameComplete ? "all of mine, for you" : "catch them if you like"}
              </span>
            </div>
          </section>

          <section id="song" className="section song-section">
            <div className="section-heading">
              <p className="eyebrow">A SONG FOR YOU</p>
              <h2>
                Press play, <em>on your time.</em>
              </h2>
            </div>
            <article className="song-poster">
              <div className="song-art">
                <span className={`song-orbit song-orbit-one ${isPlaying ? "orbit-active" : ""}`} />
                <span className={`song-orbit song-orbit-two ${isPlaying ? "orbit-active" : ""}`} />
                <button
                  type="button"
                  className={`song-record ${isPlaying ? "song-record-playing" : ""}`}
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause music" : "Play music"}
                  title={isPlaying ? "Pause music" : "Play music"}
                >
                  {isPlaying ? (
                    <Pause size={34} strokeWidth={1.5} />
                  ) : (
                    <Play size={34} strokeWidth={1.5} style={{ marginLeft: "3px" }} />
                  )}
                </button>
                <span className="song-art-label">
                  {isPlaying ? "playing Afterglow ♪" : "whenever you feel like listening"}
                </span>
                <span className="song-art-index">S · N</span>
              </div>
              <div className="song-details">
                <h3>Afterglow</h3>
                <p>Taylor Swift • Listen right here on our page whenever you want.</p>
                <div className="song-player-wrap">
                  <Button type="button" className="pill-button song-play-btn" onClick={togglePlay}>
                    {isPlaying ? (
                      <>
                        <Pause size={17} fill="currentColor" /> Pause Song
                      </>
                    ) : (
                      <>
                        <Play size={17} fill="currentColor" /> Play Song
                      </>
                    )}
                  </Button>
                  {duration > 0 && (
                    <div className="audio-seek-row">
                      <span className="audio-time">{formatTime(currentTime)}</span>
                      <input
                        type="range"
                        min={0}
                        max={duration}
                        value={currentTime}
                        onChange={handleSeek}
                        className="audio-slider"
                      />
                      <span className="audio-time">{formatTime(duration)}</span>
                    </div>
                  )}
                </div>
                <div className="song-link">
                  <a
                    href={loveConfig.favouriteSongUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="song-source-link"
                  >
                    Watch on YouTube <ArrowRight size={13} />
                  </a>
                </div>
              </div>
            </article>
          </section>

          <section className="love-letter-section">
            <div className="love-letter-image">
              <img
                src={loveConfig.memories[5].image}
                alt="Sahil and Nandini together beneath an open sky"
                width={960}
                height={1280}
                loading="lazy"
              />
              <span className="image-stamp">WITH ALL MY LOVE</span>
            </div>
            <article className="love-letter-card">
              <p className="eyebrow">ONE MORE THING I WANTED TO SAY</p>
              <h2>
                A little <em>love letter.</em>
              </h2>
              <div className="love-letter-copy">
                {loveConfig.loveLetter.map((line, index) => (
                  <p key={`${index}-${line}`}>{line}</p>
                ))}
              </div>
              <p className="love-letter-signature">— {loveConfig.myName}</p>
              <Heart className="love-letter-heart" size={19} fill="currentColor" />
            </article>
          </section>

          <section id="question" className="question-section">
            <div className="spotlight" aria-hidden="true" />
            <div className="question-content">
              <span className="question-flower" aria-hidden="true">
                ✿
              </span>
              <p className="eyebrow">AND SO, I HAVE ONE QUESTION</p>
              <h2>
                Will you forgive me,
                <br />
                <em className="question-recipient">{loveConfig.herName}?</em>
              </h2>
              <p className="question-subtitle">
                Only if and when you’re ready. I understand if you need time.
              </p>
              {!accepted ? (
                <div className="answer-area">
                  <div className="answer-buttons">
                    <Button
                      className={`yes-button yes-grow-${Math.min(noAttempts, 5)}`}
                      onClick={celebrate}
                    >
                      Yes <Heart size={18} fill="currentColor" />
                    </Button>
                    <Button
                      variant="outline"
                      className={`no-button ${noButtonPositions[Math.min(noAttempts, noButtonPositions.length - 1)]}`}
                      onClick={() => setNoAttempts((count) => count + 1)}
                    >
                      {noAttempts === 0 ? (
                        <>
                          No <Heart size={16} />
                        </>
                      ) : (
                        noLabel
                      )}
                    </Button>
                  </div>
                  {noAttempts > 0 && (
                    <p className="no-tease" role="status">
                      {noLabel}
                    </p>
                  )}
                </div>
              ) : (
                <span className="answer-sealed">
                  <Heart size={16} fill="currentColor" />
                  Thank you for hearing me out.
                </span>
              )}
            </div>
            <div className="question-bottom-mark">
              <span />
              THE NEXT CHAPTER IS YOURS TO CHOOSE
              <span />
            </div>
          </section>

          {accepted && (
            <section id="thank-you" className="thank-you-section">
              <span className="thank-you-sparkle">
                <Sparkles size={22} />
              </span>
              <p className="eyebrow">A MOMENT I’LL TREASURE</p>
              <h2>
                Thank you, <em>my love.</em> <Heart size={23} fill="currentColor" />
              </h2>
              <p className="thank-you-copy">
                I promise to keep choosing you, respecting you and making you feel loved.
              </p>
              <div className="next-plan">
                <p className="eyebrow">OUR NEXT PLAN ✨</p>
                <div className="plan-items">
                  <span>
                    <strong>WHEN</strong>
                    {loveConfig.nextDate}
                  </span>
                  <span>
                    <strong>TIME</strong>
                    {loveConfig.nextTime}
                  </span>
                  <span>
                    <strong>WHERE</strong>
                    {loveConfig.nextPlace}
                  </span>
                </div>
                <ul>
                  {loveConfig.dinnerPlan.map((item, index) => (
                    <li key={`${index}-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
              <p className="screenshot-note">
                Screenshot this and show me <span aria-hidden="true">☺</span>
              </p>
              <p className="no-pressure-note">
                No pressure to decide anything right now. I love you, either way.
              </p>
            </section>
          )}
        </main>

        <footer className="site-footer">
          <button
            type="button"
            className="footer-heart"
            aria-label="A little secret"
            onClick={() => setEasterEgg((visible) => !visible)}
          >
            <Heart size={17} fill="currentColor" />
          </button>
          <p>
            {easterEgg
              ? "I love you more than my code compiles 😂"
              : `Made with love (and a lot of code) by ${loveConfig.myName} 💻❤️`}
          </p>
          <a href="#home" className="back-to-top">
            Back to the beginning ↑
          </a>
        </footer>
        <Button
          type="button"
          className={`floating-music ${isPlaying ? "floating-music-playing" : ""}`}
          size="icon"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause song" : "Play our song"}
          title={isPlaying ? "Pause song" : "Play our song"}
        >
          {isPlaying ? <Pause size={19} /> : <Music2 size={19} />}
        </Button>
      </div>

      {selectedMemory !== null &&
        (() => {
          const memory = loveConfig.memories[selectedMemory];
          if (!memory) return null;
          return (
            <div
              className="lightbox-backdrop"
              role="presentation"
              onClick={() => setSelectedMemory(null)}
            >
              <section
                className="lightbox-dialog"
                role="dialog"
                aria-modal="true"
                aria-label={memory.title}
                onClick={(event) => event.stopPropagation()}
                onTouchStart={(event) => {
                  touchStartX.current = event.changedTouches[0]?.clientX ?? null;
                }}
                onTouchEnd={(event) => {
                  const end = event.changedTouches[0]?.clientX;
                  if (
                    touchStartX.current !== null &&
                    end !== undefined &&
                    Math.abs(end - touchStartX.current) > 45
                  )
                    changeMemory(end < touchStartX.current ? 1 : -1);
                  touchStartX.current = null;
                }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="lightbox-close"
                  onClick={() => setSelectedMemory(null)}
                  aria-label="Close memory"
                >
                  <X size={21} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lightbox-arrow lightbox-prev"
                  onClick={() => changeMemory(-1)}
                  aria-label="Previous memory"
                >
                  <ArrowLeft size={20} />
                </Button>
                <div className="lightbox-photo">
                  {memory.image ? (
                    <img src={memory.image} alt={`${memory.title}: Sahil and Nandini together`} />
                  ) : (
                    <span className="memory-placeholder">
                      <ImageIcon size={34} />
                      <span>Add your photo to this memory</span>
                    </span>
                  )}
                </div>
                <p className="eyebrow">
                  MEMORY {String(selectedMemory + 1).padStart(2, "0")} / 06
                  {memory.date ? ` · ${memory.date}` : ""}
                </p>
                <h2>{memory.title}</h2>
                <p className="lightbox-caption">{memory.caption}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lightbox-arrow lightbox-next"
                  onClick={() => changeMemory(1)}
                  aria-label="Next memory"
                >
                  <ArrowRight size={20} />
                </Button>
              </section>
            </div>
          );
        })()}

      {celebration && (
        <div className="celebration-layer" aria-hidden="true">
          {Array.from({ length: 54 }, (_, index) => (
            <span
              className={`confetti-piece confetti-piece-${index % 9}`}
              key={index}
              style={{ left: `${(index * 37) % 100}%`, animationDelay: `${(index % 13) * 0.11}s` }}
            >
              {index % 5 === 0 ? "♥" : "✦"}
            </span>
          ))}
          <span className="celebration-heart celebration-heart-one">♥</span>
          <span className="celebration-heart celebration-heart-two">♥</span>
          <span className="celebration-heart celebration-heart-three">♥</span>
        </div>
      )}
    </div>
  );
}
