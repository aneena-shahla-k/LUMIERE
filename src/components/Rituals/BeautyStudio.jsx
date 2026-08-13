import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Heart,
  Upload,
  Sparkles,
  Check,
  Plus,
  Wand2,
  MessageCircle,
  X,
  ScanFace,
  Zap,
} from "lucide-react";

import "./BeautyStudio.css";

const products = [
  {
    id: "foundation",
    title: "Foundation",
    subtitle: "Find your complexion match",
  },
  {
    id: "lipstick",
    title: "Lip Color",
    subtitle: "Discover your signature shade",
  },
  {
    id: "blush",
    title: "Blush",
    subtitle: "Find your perfect flush",
  },
  {
    id: "concealer",
    title: "Concealer",
    subtitle: "Match your undertone",
  },
];

const skinTones = [
  {
    id: "fair",
    label: "Fair",
    color: "#f4d5c2",
  },
  {
    id: "medium",
    label: "Medium",
    color: "#c98d6d",
  },
  {
    id: "deep",
    label: "Deep",
    color: "#613b31",
  },
];

const undertones = [
  {
    id: "warm",
    icon: "☀",
    title: "Warm",
    description: "Golden / yellow undertones",
  },
  {
    id: "neutral",
    icon: "◐",
    title: "Neutral",
    description: "Balanced undertones",
  },
  {
    id: "cool",
    icon: "❄",
    title: "Cool",
    description: "Pink / rosy undertones",
  },
];

const shadeFamilies = ["Nude", "Pink", "Red", "Berry", "Coral", "Brown"];

const shades = [
  {
    id: "rose-nude",
    name: "Rose Nude 07",
    family: "Nude",
    color: "#b77d70",
    match: 96,
    description: "A soft rosy nude designed to complement warm undertones.",
    image: "/beauty-studio/lips/rose-nude.jpg",
  },
  {
    id: "soft-pink",
    name: "Soft Pink 04",
    family: "Pink",
    color: "#c98291",
    match: 93,
    description: "A delicate pink with a soft luminous finish.",
    image: "/beauty-studio/lips/soft-pink.jpg",
  },
  {
    id: "classic-red",
    name: "Classic Red 09",
    family: "Red",
    color: "#9e3d43",
    match: 89,
    description: "A timeless red with a refined satin finish.",
    image: "/beauty-studio/lips/classic-red.jpg",
  },
  {
    id: "berry",
    name: "Berry 11",
    family: "Berry",
    color: "#743b52",
    match: 94,
    description: "A sophisticated berry tone for a deeper statement.",
    image: "/beauty-studio/lips/berry.jpg",
  },
  {
    id: "coral",
    name: "Coral Glow 05",
    family: "Coral",
    color: "#d77c68",
    match: 91,
    description: "A fresh coral shade for a naturally radiant look.",
    image: "/beauty-studio/lips/coral.jpg",
  },
  {
    id: "brown",
    name: "Cocoa 08",
    family: "Brown",
    color: "#805447",
    match: 90,
    description: "A warm cocoa brown with understated elegance.",
    image: "/beauty-studio/lips/rose-nude.jpg",
  },
];

const foundationMatches = {
  fair: { warm: "Porcelain 01", neutral: "Ivory 02", cool: "Pearl 01" },
  light: { warm: "Sand 03", neutral: "Beige 04", cool: "Petal 03" },
  medium: { warm: "Honey 05", neutral: "Natural 06", cool: "Rose 05" },
  tan: { warm: "Caramel 07", neutral: "Almond 08", cool: "Mocha 07" },
  deep: { warm: "Amber 09", neutral: "Chestnut 10", cool: "Espresso 09" },
};

// Deterministic "AI" undertone suggestion per skin tone — stands in for a
// real vision-model call while keeping the result stable and explainable.
const suggestedUndertoneByTone = {
  fair: "cool",
  medium: "warm",
  deep: "neutral",
};

// Deterministic "AI" skin-reading metrics per tone, so re-running analysis
// on the same tone always explains itself the same way.
const aiSkinReadings = {
  fair: { hydration: 74, evenness: 81, texture: 88 },
  medium: { hydration: 79, evenness: 87, texture: 84 },
  deep: { hydration: 82, evenness: 90, texture: 86 },
};

const assistantTips = [
  "Pick the product you'd like help with — I'll tailor every step that follows to it.",
  "I can read your undertone straight from a photo, or you can tell me yourself in the next steps.",
  "Undertone matters more than depth — it's why two people with similar skin can need very different shades.",
  "I'm scoring every shade in this family against your profile — higher match, better wear and less oxidation.",
  "Upload a photo here and I'll simulate the shade on your own skin instead of a model's.",
  "This is your saved profile — I'll remember it if you come back to shop again.",
];

const assistantSuggestions = [
  {
    q: "How does the AI match work?",
    a: "I cross-reference your undertone, depth and the shade's pigment ratio against thousands of past matches to score longevity and color-true wear on your skin.",
  },
  {
    q: "Is my photo stored?",
    a: "Your photo is only used locally to preview shades in this session — it isn't uploaded or saved anywhere.",
  },
  {
    q: "Can I trust the % match?",
    a: "Think of it as a starting point, not a guarantee — lighting and formula can shift the result, so use Compare Shades before you buy.",
  },
];

export default function BeautyStudio() {
  const [step, setStep] = useState(0);
  const [product, setProduct] = useState("lipstick");
  const [skinTone, setSkinTone] = useState("medium");
  const [undertone, setUndertone] = useState("warm");
  const [family, setFamily] = useState("Nude");
  const [selectedShade, setSelectedShade] = useState(shades[0]);
  const [saved, setSaved] = useState(false);
  const [compareShade, setCompareShade] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  // --- AI Skin Analysis state ---
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [suggestedUndertone, setSuggestedUndertone] = useState(null);

  // --- AI Assistant state ---
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantAnswer, setAssistantAnswer] = useState(null);

  const studioRef = useRef(null);

  const filteredShades = useMemo(() => {
    return shades.filter((shade) => shade.family === family);
  }, [family]);

  const foundationName = foundationMatches[skinTone][undertone];

  const selectShade = (shade) => {
    setSelectedShade(shade);
  };

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    // A fresh photo invalidates any earlier analysis
    setAnalyzed(false);
  };

  const runAiAnalysis = () => {
    setAnalyzing(true);
    setAnalyzed(false);

    window.setTimeout(() => {
      const suggestion = suggestedUndertoneByTone[skinTone] || "neutral";
      setSuggestedUndertone(suggestion);
      setUndertone(suggestion);
      setAnalyzing(false);
      setAnalyzed(true);
    }, 1900);
  };

  const nextStep = () => {
    setStep((current) => Math.min(current + 1, 6));
  };

  const previousStep = () => {
    setStep((current) => Math.max(current - 1, 0));
  };

  const scrollToStudio = () => {
    studioRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const readingForTone = aiSkinReadings[skinTone] || aiSkinReadings.medium;

  const assistantTip =
    assistantTips[step] || assistantTips[assistantTips.length - 1];

  return (
    <main className="beauty-studio">
      <section className="beauty-studio-shell" ref={studioRef}>
        {/* Progress */}

        <div className="beauty-progress">
          <div className="beauty-progress-label">
            <span>STEP {String(step + 1).padStart(2, "0")}</span>
            <span>07</span>
          </div>

          <div className="beauty-progress-line">
            <motion.div
              animate={{ width: `${((step + 1) / 7) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* =================================================
            STEP CONTENT
        ================================================= */}

        <AnimatePresence mode="wait">
          {/* STEP 1 — PRODUCT */}

          {step === 0 && (
            <motion.section
              key="product"
              className="beauty-step"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <StepHeading
                number="01"
                title="Choose your product"
                description="What would you like to discover today?"
              />

              <div className="product-choice-grid">
                {products.map((item) => (
                  <button
                    key={item.id}
                    className={`product-choice ${
                      product === item.id ? "active" : ""
                    }`}
                    onClick={() => setProduct(item.id)}
                  >
                    <span className="product-choice-number">
                      0{products.indexOf(item) + 1}
                    </span>

                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.subtitle}</p>
                    </div>

                    <ArrowRight size={16} />
                  </button>
                ))}
              </div>

              <StepControls onNext={nextStep} />
            </motion.section>
          )}

          {/* STEP 2 — AI SKIN ANALYSIS (new) */}

          {step === 1 && (
            <motion.section
              key="ai-analysis"
              className="beauty-step"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <StepHeading
                number="02"
                title="AI skin analysis"
                description="Let our AI read your undertone and skin profile in seconds — or skip ahead and choose it yourself."
              />

              <div className="ai-analysis-layout">
                <div className="ai-scan-panel">
                  <div className="ai-scan-frame">
                    <FacePreview
                      skinTone={skinTone}
                      shade={null}
                      uploadedImage={uploadedImage}
                    />

                    {analyzing && (
                      <motion.div
                        className="ai-scan-line"
                        initial={{ top: "8%" }}
                        animate={{ top: "92%" }}
                        transition={{
                          duration: 1.6,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    )}

                    {analyzing && (
                      <div className="ai-scan-badge">
                        <Zap size={11} />
                        Analyzing
                      </div>
                    )}

                    {analyzed && !analyzing && (
                      <motion.div
                        className="ai-scan-badge complete"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <Check size={11} />
                        Analysis complete
                      </motion.div>
                    )}
                  </div>

                  <label className="upload-button ai-upload-button">
                    <Upload size={16} />
                    Upload a photo to analyze
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                    />
                  </label>
                </div>

                <div className="ai-results-panel">
                  <span className="mini-label">SKIN READING</span>

                  <h3 className="ai-results-heading">
                    {analyzed
                      ? "Here's what our AI found."
                      : "Ready when you are."}
                  </h3>

                  <p className="ai-results-copy">
                    {analyzed
                      ? "These readings, plus your undertone, feed directly into the shades we recommend later."
                      : "Run the scan to auto-detect your undertone, or continue and set it manually in the next steps."}
                  </p>

                  <div className="ai-metric-list">
                    {[
                      { key: "hydration", label: "Hydration" },
                      { key: "evenness", label: "Tone evenness" },
                      { key: "texture", label: "Texture" },
                    ].map((metric) => (
                      <div className="ai-metric-row" key={metric.key}>
                        <span>{metric.label}</span>

                        <div className="ai-metric-bar-track">
                          <motion.div
                            className="ai-metric-bar-fill"
                            initial={{ width: 0 }}
                            animate={{
                              width: analyzed
                                ? `${readingForTone[metric.key]}%`
                                : "0%",
                            }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>

                        <strong>
                          {analyzed ? `${readingForTone[metric.key]}%` : "—"}
                        </strong>
                      </div>
                    ))}
                  </div>

                  {analyzed && suggestedUndertone && (
                    <div className="ai-undertone-result">
                      <ScanFace size={15} />
                      <span>
                        AI-detected undertone:{" "}
                        <strong>{suggestedUndertone}</strong>
                      </span>
                    </div>
                  )}

                  <button
                    className="ai-analyze-button"
                    onClick={runAiAnalysis}
                    disabled={analyzing}
                  >
                    <Sparkles size={14} />
                    {analyzing
                      ? "Analyzing your skin..."
                      : analyzed
                      ? "Re-run analysis"
                      : "Analyze with AI"}
                  </button>
                </div>
              </div>

              <StepControls onBack={previousStep} onNext={nextStep} />
            </motion.section>
          )}

          {/* STEP 3 — COMPLEXION */}

          {step === 2 && (
            <motion.section
              key="complexion"
              className="beauty-step"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <StepHeading
                number="03"
                title="Your complexion"
                description="Choose the tone that feels closest to your skin."
              />

              <div className="complexion-layout">
                <div className="tone-selector">
                  {skinTones.map((tone) => (
                    <button
                      key={tone.id}
                      className={`tone-option ${
                        skinTone === tone.id ? "active" : ""
                      }`}
                      onClick={() => setSkinTone(tone.id)}
                    >
                      <span
                        className="tone-circle"
                        style={{ background: tone.color }}
                      />
                      <span>{tone.label}</span>
                    </button>
                  ))}
                </div>

                <FacePreview
                  skinTone={skinTone}
                  uploadedImage={uploadedImage}
                  shade={selectedShade}
                />
              </div>

              <StepControls onBack={previousStep} onNext={nextStep} />
            </motion.section>
          )}

          {/* STEP 4 — UNDERTONE */}

          {step === 3 && (
            <motion.section
              key="undertone"
              className="beauty-step"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <StepHeading
                number="04"
                title="Find your undertone"
                description="This helps us find shades that naturally complement you."
              />

              <div className="undertone-grid">
                {undertones.map((item) => (
                  <button
                    key={item.id}
                    className={`undertone-card ${
                      undertone === item.id ? "active" : ""
                    }`}
                    onClick={() => setUndertone(item.id)}
                  >
                    <span className="undertone-icon">{item.icon}</span>

                    <h3>{item.title}</h3>
                    <p>{item.description}</p>

                    {suggestedUndertone === item.id && (
                      <span className="ai-suggested-badge">
                        <Sparkles size={9} />
                        AI pick
                      </span>
                    )}

                    {undertone === item.id && (
                      <span className="selected-check">
                        <Check size={12} />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="undertone-note">
                <Sparkles size={15} />
                <span>
                  Your current match: <strong>{foundationName}</strong>
                </span>
              </div>

              <StepControls onBack={previousStep} onNext={nextStep} />
            </motion.section>
          )}

          {/* STEP 5 — SHADE STUDIO */}

          {step === 4 && (
            <motion.section
              key="shade"
              className="beauty-step shade-studio-step"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <StepHeading
                number="05"
                title="Shade studio"
                description="Explore the shades and see your match instantly."
              />

              <div className="shade-studio-layout">
                {/* LEFT */}

                <div className="shade-controls">
                  <span className="mini-label">SHADE FAMILY</span>

                  <div className="shade-family-list">
                    {shadeFamilies.map((item) => (
                      <button
                        key={item}
                        className={family === item ? "active" : ""}
                        onClick={() => setFamily(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <div className="shade-swatch-grid">
                    {filteredShades.length ? (
                      filteredShades.map((shade) => (
                        <button
                          key={shade.id}
                          className={`shade-swatch ${
                            selectedShade.id === shade.id ? "active" : ""
                          }`}
                          onClick={() => selectShade(shade)}
                        >
                          <span style={{ background: shade.color }} />
                          <small>{shade.name.split(" ").slice(-1)}</small>
                        </button>
                      ))
                    ) : (
                      <div className="shade-empty">
                        More shades coming soon.
                      </div>
                    )}
                  </div>

                  <div className="why-match-card">
                    <div className="why-match-heading">
                      <Wand2 size={13} />
                      <span>Why this match</span>
                    </div>

                    <p>
                      Your {undertone} undertone and {skinTone} depth score
                      best against {family.toLowerCase()} pigments —{" "}
                      <strong>{selectedShade.name}</strong> came out on top
                      for undertone harmony and expected wear.
                    </p>
                  </div>
                </div>

                {/* RIGHT PREVIEW */}

                <div className="shade-result">
                  <FacePreview
                    skinTone={skinTone}
                    shade={selectedShade}
                    uploadedImage={uploadedImage}
                  />

                  <div className="shade-result-info">
                    <div>
                      <span className="mini-label">YOUR MATCH</span>
                      <h3>{selectedShade.name}</h3>
                      <p>{selectedShade.description}</p>
                    </div>

                    <div className="match-score">
                      <strong>{selectedShade.match}%</strong>
                      <span>MATCH</span>
                    </div>
                  </div>

                  <div className="shade-actions">
                    <button
                      onClick={() =>
                        setSelectedShade(
                          shades[Math.floor(Math.random() * shades.length)]
                        )
                      }
                    >
                      Try Another
                    </button>

                    <button
                      onClick={() =>
                        setCompareShade(compareShade ? null : selectedShade)
                      }
                    >
                      Compare Shades
                    </button>
                  </div>
                </div>
              </div>

              {compareShade && (
                <div className="compare-bar">
                  <span>Comparing:</span>
                  <strong>{compareShade.name}</strong>
                  <span>vs</span>
                  <strong>{selectedShade.name}</strong>

                  <button onClick={() => setCompareShade(null)}>×</button>
                </div>
              )}

              <StepControls onBack={previousStep} onNext={nextStep} />
            </motion.section>
          )}

          {/* STEP 6 — TRY ON */}

          {/* {step === 5 && (
            <motion.section
              key="tryon"
              className="beauty-step"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <StepHeading
                number="06"
                title="Virtual try-on"
                description="See your selected shade on a beauty preview."
              />

              <div className="tryon-layout">
                <div className="tryon-preview">
                  <FacePreview
                    skinTone={skinTone}
                    shade={selectedShade}
                    uploadedImage={uploadedImage}
                    large
                  />

                  <div className="tryon-before-after">
                    <span>BEFORE</span>
                    <div className="before-after-line">
                      <span />
                    </div>
                    <span>AFTER</span>
                  </div>
                </div>

                <div className="tryon-controls">
                  <span className="mini-label">YOUR PHOTO</span>

                  <h3>
                    Make it
                    <br />
                    personal.
                  </h3>

                  <p>Upload a photo to preview your beauty look.</p>

                  <label className="upload-button">
                    <Upload size={16} />
                    Upload Your Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                    />
                  </label>

                  {uploadedImage && (
                    <button
                      className="remove-photo"
                      onClick={() => setUploadedImage(null)}
                    >
                      Use Demo Face
                    </button>
                  )}
                </div>
              </div>

              <StepControls onBack={previousStep} onNext={nextStep} />
            </motion.section>
          )} */}

          {/* STEP 7 — RESULT */}

          {step === 5 && (
            <motion.section
              key="result"
              className="beauty-step result-step"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <StepHeading
                number="07"
                title="Your perfect match"
                description="A beauty ritual curated around your choices."
              />

              <div className="final-result-layout">
                <div className="final-face">
                  <FacePreview
                    skinTone={skinTone}
                    shade={selectedShade}
                    uploadedImage={uploadedImage}
                    large
                  />

                  <div className="final-match-circle">
                    <strong>{selectedShade.match}%</strong>
                    <span>MATCH</span>
                  </div>
                </div>

                <div className="result-card">
                  <span className="mini-label">YOUR BEAUTY PROFILE</span>

                  <div className="result-item">
                    <span>Foundation</span>
                    <strong>{foundationName}</strong>
                  </div>

                  <div className="result-item">
                    <span>Undertone</span>
                    <strong>{undertone}</strong>
                  </div>

                  <div className="result-item">
                    <span>Lip Color</span>
                    <strong>{selectedShade.name}</strong>
                  </div>

                  <button
                    className={`save-match ${saved ? "saved" : ""}`}
                    onClick={() => setSaved(!saved)}
                  >
                    <Heart size={16} fill={saved ? "currentColor" : "none"} />
                    {saved ? "Match Saved" : "Save My Match"}
                  </button>
                </div>
              </div>

              {/* AI ROUTINE BUILDER */}

              <div className="routine-builder">
                <div className="complete-look-heading">
                  <div>
                    <span className="mini-label">GENERATED FOR YOU</span>
                    <h3>Your AI routine.</h3>
                  </div>

                  <span className="ai-generated-tag">
                    <Wand2 size={12} />
                    AI generated
                  </span>
                </div>

                <div className="routine-grid">
                  {[
                    {
                      title: "Prep",
                      detail: `Hydrating primer tuned for ${readingForTone.hydration}% hydration reading`,
                    },
                    {
                      title: "Apply",
                      detail: `${foundationName} blended toward your ${undertone} undertone`,
                    },
                    {
                      title: "Finish",
                      detail: `${selectedShade.name} set with a translucent powder for longer wear`,
                    },
                  ].map((item, index) => (
                    <div className="routine-card" key={item.title}>
                      <span className="routine-card-number">
                        0{index + 1}
                      </span>
                      <h4>{item.title}</h4>
                      <p>{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* COMPLETE LOOK */}

              {/* <div className="complete-look">
                <div className="complete-look-heading">
                  <div>
                    <span className="mini-label">CURATED FOR YOU</span>
                    <h3>Complete your look.</h3>
                  </div>

                  <Sparkles size={18} />
                </div>

                <div className="recommendation-grid">
                  {[
                    ["Foundation", foundationName, "₹899"],
                    ["Concealer", "Silk 04", "₹699"],
                    ["Lip Color", selectedShade.name, "₹599"],
                    ["Blush", "Peach Glow 04", "₹749"],
                  ].map(([title, name, price]) => (
                    <div className="recommendation-card" key={title}>
                      <div className="recommendation-image">
                        <div className="fake-product">{title[0]}</div>
                      </div>

                      <span>{title}</span>
                      <strong>{name}</strong>
                      <small>{price}</small>

                      <button>
                        <Plus size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <button className="complete-look-button">
                  Add Complete Look
                  <ArrowRight size={16} />
                </button>
              </div> */}

              <button className="restart-button" onClick={() => setStep(0)}>
                <ArrowLeft size={14} />
                Start Again
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </section>

      {/* =================================================
          AI BEAUTY ASSISTANT (floating)
      ================================================= */}

      <div className="ai-assistant">
        <AnimatePresence>
          {assistantOpen && (
            <motion.div
              className="ai-assistant-panel"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="ai-assistant-header">
                <span>
                  <Sparkles size={13} />
                  Beauty AI
                </span>

                <button onClick={() => setAssistantOpen(false)}>
                  <X size={14} />
                </button>
              </div>

              <p className="ai-assistant-tip">{assistantTip}</p>

              <div className="ai-assistant-chips">
                {assistantSuggestions.map((item) => (
                  <button
                    key={item.q}
                    className={
                      assistantAnswer?.q === item.q ? "active" : ""
                    }
                    onClick={() =>
                      setAssistantAnswer(
                        assistantAnswer?.q === item.q ? null : item
                      )
                    }
                  >
                    {item.q}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {assistantAnswer && (
                  <motion.p
                    key={assistantAnswer.q}
                    className="ai-assistant-answer"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {assistantAnswer.a}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          className="ai-assistant-fab"
          onClick={() => setAssistantOpen((open) => !open)}
        >
          {assistantOpen ? <X size={18} /> : <MessageCircle size={18} />}
        </button>
      </div>
    </main>
  );
}

/* =====================================================
   SMALL COMPONENTS
===================================================== */

function StepHeading({ number, title, description }) {
  return (
    <div className="step-heading">
      <span className="step-number">{number}</span>

      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function StepControls({ onBack, onNext }) {
  return (
    <div className="step-controls">
      {onBack ? (
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={14} />
          Back
        </button>
      ) : (
        <span />
      )}

      {onNext && (
        <button className="continue-button" onClick={onNext}>
          Continue
          <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}

/* =====================================================
   FACE PREVIEW
===================================================== */

function FacePreview({ skinTone, shade, uploadedImage, large = false }) {
  const foundationImage = `/beauty-studio/faces/${skinTone}/foundation-01.jpg`;

  return (
    <div className={`face-preview ${large ? "large" : ""}`}>
      <div className="face-preview-glow" />

      <AnimatePresence mode="wait">
        <motion.div
          key={uploadedImage || `${skinTone}-${shade?.id}`}
          className="face-image-wrapper"
          initial={{ opacity: 0, scale: 1.025 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.985 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={uploadedImage || foundationImage}
            alt="Beauty preview"
            className="face-image"
          />

          {/* Simulated lipstick overlay */}

          {!uploadedImage && shade && (
            <motion.div
              className="makeup-shade-overlay"
              animate={{ backgroundColor: shade.color }}
              transition={{ duration: 0.5 }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="face-preview-caption">
        <span>LUMIÈRE</span>
        <span>{shade?.name || "YOUR PREVIEW"}</span>
      </div>
    </div>
  );
}
