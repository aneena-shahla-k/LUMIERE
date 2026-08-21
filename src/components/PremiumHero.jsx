import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import "../styles/premiumHero.css";
import SignupOffer from "./SignupOffer";

const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max);

export default function PremiumHero() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);

  const animationFrameRef = useRef(null);
  const targetProgressRef = useRef(0);
  const isVideoReadyRef = useRef(false);

  const [isReady, setIsReady] = useState(false);
  const [showSignupOffer, setShowSignupOffer] = useState(false);

  /* --------------------------------
     SCROLL
  -------------------------------- */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /*
    Spring is ONLY used for the visual scroll indicator.
    The actual video uses raw scrollYProgress so it
    doesn't introduce animation delay.
  */
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.2,
  });

  /* --------------------------------
     VIDEO READY
  -------------------------------- */
  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const handleReady = () => {
      if (isVideoReadyRef.current) return;

      isVideoReadyRef.current = true;

      /*
        Make sure video starts at the first frame.
      */
      try {
        video.currentTime = 0;
      } catch (error) {
        console.warn("Unable to set initial video time:", error);
      }

      /*
        Wait one browser frame before revealing
        the hero to avoid showing an unpainted video.
      */
      requestAnimationFrame(() => {
        setIsReady(true);
      });
    };

    const handleError = () => {
      console.error(
        "Lumière hero video failed to load."
      );
    };

    video.addEventListener("loadedmetadata", handleReady);
    video.addEventListener("loadeddata", handleReady);
    video.addEventListener("canplay", handleReady);
    video.addEventListener("error", handleError);

    /*
      If the browser already loaded the metadata
      before listeners were attached.
    */
    if (video.readyState >= 2) {
      handleReady();
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleReady);
      video.removeEventListener("loadeddata", handleReady);
      video.removeEventListener("canplay", handleReady);
      video.removeEventListener("error", handleError);
    };
  }, []);

  /* --------------------------------
     SCROLL → VIDEO
  -------------------------------- */
  useEffect(() => {
    const unsubscribe = scrollYProgress.on(
      "change",
      (progress) => {
        targetProgressRef.current = clamp(
          progress,
          0,
          0.999999
        );

        /*
          Cancel previous frame update.
          This prevents dozens of currentTime
          assignments during fast scrolling.
        */
        if (animationFrameRef.current) {
          cancelAnimationFrame(
            animationFrameRef.current
          );
        }

        animationFrameRef.current =
          requestAnimationFrame(() => {
            const video = videoRef.current;

            if (
              !video ||
              !isVideoReadyRef.current ||
              !Number.isFinite(video.duration) ||
              video.duration <= 0
            ) {
              return;
            }

            const progressValue =
              targetProgressRef.current;

            const targetTime =
              progressValue * video.duration;

            /*
              Avoid tiny unnecessary seeks.
            */
            if (
              Math.abs(
                video.currentTime - targetTime
              ) > 0.012
            ) {
              try {
                video.currentTime = targetTime;
              } catch (error) {
                // Ignore browser seek race conditions.
              }
            }
          });
      }
    );

    return () => {
      unsubscribe();

      if (animationFrameRef.current) {
        cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current = null;
      }
    };
  }, [scrollYProgress]);

  /* --------------------------------
     CLEANUP
  -------------------------------- */
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }
    };
  }, []);

  /* --------------------------------
     SIGNUP OFFER
  -------------------------------- */
  useEffect(() => {
    if (!isReady) return;

    const alreadyShown = sessionStorage.getItem(
      "lumiere_signup_offer_shown"
    );

    if (alreadyShown) return;

    const timer = setTimeout(() => {
      setShowSignupOffer(true);

      sessionStorage.setItem(
        "lumiere_signup_offer_shown",
        "true"
      );
    }, 700);

    return () => {
      clearTimeout(timer);
    };
  }, [isReady]);

  return (
    <>
      <section
        ref={sectionRef}
        className="premium-hero"
      >
        <div className="premium-hero__sticky">

          {/* --------------------------------
              SCROLL CONTROLLED VIDEO
          -------------------------------- */}
          <video
            ref={videoRef}
            className="premium-hero__video"
            muted
            playsInline
            preload="auto"
            webkit-playsinline="true"
            aria-hidden="true"
          >
            <source
              src="/skin-animation.mp4"
              type="video/mp4"
            />
          </video>

          <div className="premium-hero__overlay" />

          {/* --------------------------------
              LOADER
          -------------------------------- */}
          {!isReady && (
            <div className="premium-hero__loader">
              <div className="premium-hero__loader-brand">
                LUMIÈRE
              </div>

              <div className="premium-hero__loader-line">
                <motion.div
                  className="premium-hero__loader-progress"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 1.2,
                    ease: "easeOut",
                  }}
                />
              </div>

              <span>LOADING</span>
            </div>
          )}

          {/* --------------------------------
              HERO CONTENT
          -------------------------------- */}
          <motion.div
            className="premium-hero__content"
            initial={{ opacity: 0 }}
            animate={{
              opacity: isReady ? 1 : 0,
            }}
            transition={{
              duration: 1.2,
              ease: "easeOut",
            }}
          >
            <div className="premium-hero__eyebrow">
              ADVANCED SKINCARE
            </div>

            <h1>
              THE RITUAL
              <br />
              OF RADIANCE
            </h1>

            <p>
              Where science meets purity.
              <br />
              Advanced skincare rituals
              <br />
              made for luminous skin.
            </p>

            <button className="premium-hero__cta">
              <span>
                DISCOVER THE RITUAL
              </span>

              <span className="premium-hero__arrow">
                →
              </span>
            </button>
          </motion.div>

          {/* --------------------------------
              SCROLL INDICATOR
          -------------------------------- */}
          <motion.div
            className="premium-hero__scroll"
            animate={{
              opacity: isReady ? 1 : 0,
            }}
          >
            <div className="premium-hero__scroll-line">
              <motion.div
                style={{
                  scaleY: smoothProgress,
                  transformOrigin: "top",
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {showSignupOffer && (
        <SignupOffer
          onClose={() =>
            setShowSignupOffer(false)
          }
        />
      )}
    </>
  );
}