// KioskApp.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Sparkles } from "lucide-react";
import TitleDisplay from "./components/TitleDisplay";
import ProcessingDisplay from "./components/ProcessingDisplay";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

const BACKEND_URL = "/api";

// --- Home Button (inline; remove if you import it from App.jsx) ---
function HomeButton({ onHome }) {
  return (
    <button
      onClick={onHome}
      className="fixed top-3 right-3 z-50 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl border border-white/20 backdrop-blur-md shadow-md transition"
      title="Go to Home"
      aria-label="Go to Home"
    >
      🏠 <span className="hidden sm:inline">Home</span>
    </button>
  );
}

// --- Countdown Overlay ---
function CountdownOverlay({ value }) {
  if (!value || value <= 0) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <motion.div
        key={value}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1.1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="w-40 h-40 rounded-full bg-black/60 backdrop-blur flex items-center justify-center border border-white/20 shadow-xl"
      >
        <span className="text-6xl font-bold">{value}</span>
      </motion.div>
    </div>
  );
}

// Artists list
const ARTISTS = [
  { key: "picasso", name: "Pablo Picasso", prompt: "in the style of Pablo Picasso: cubist abstraction, fractured planes, bold geometric composition, experimental color blocking" },
  { key: "vangogh", name: "Vincent van Gogh", prompt: "in the style of Vincent van Gogh: bold impasto brush strokes, swirling skies, vibrant cobalt blue and cadmium yellow, post-Impressionist lighting" },
  { key: "raja", name: "Raja Ravi Varma", prompt: "in the style of Raja Ravi Varma: classical Indian portraiture, rich color palettes, detailed drapery, expressive realism" },
  { key: "frida", name: "Frida Kahlo", prompt: "in the style of Frida Kahlo: surreal symbolism, vibrant Mexican folk palette, floral motifs, bold portrait framing" },
  { key: "claude", name: "Claude Monet", prompt: "in the style of Claude Monet: soft impressionist brushwork, broken color, luminous pastel palette, shimmering light reflections" },
  { key: "leonardo", name: "Leonardo da Vinci", prompt: "in the style of Leonardo da Vinci: sfumato, subtle gradations, renaissance lighting, detailed anatomical proportions" },
];

function BackButton({ onBack }) {
  return (
    <button
      onClick={onBack}
      className="fixed top-4 left-4 z-50 text-white text-3xl sm:text-4xl font-light transition-transform hover:scale-110"
      title="Back"
      aria-label="Go Back"
    >
      ←
    </button>
  );
}

export default function KioskApp({ initialStyle, onBack, onHome }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const capturedUrlRef = useRef(null);
  const currentImageRef = useRef(null);

  const openingRef = useRef(false);
  const needsGestureRef = useRef(false);

  const [stream, setStream] = useState(null);
  const [showCapturedImage, setShowCapturedImage] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [rendering, setRendering] = useState(false);
  const [generatingResultUrl, setGeneratingResultUrl] = useState(null); // Result from current generation only
  const [countdown, setCountdown] = useState(0);

  const [prompt, setPrompt] = useState("");
  const [selectedArtist, setSelectedArtist] = useState(ARTISTS[0]);
  const [mode, setMode] = useState("portrait"); // portrait | storyline

  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const keyboardRef = useRef(null);

  const onChangeKeyboard = (input) => {
    setPrompt(input);
  };
  const onChangePrompt = (e) => {
    const val = e.target.value;
    setPrompt(val);
    if (keyboardRef.current) {
      keyboardRef.current.setInput(val);
    }
  };

  // ✅ Preselect artist + mode passed from intro
  useEffect(() => {
    if (!initialStyle) return;
    const byIndex =
      Number.isInteger(initialStyle.index) && ARTISTS[initialStyle.index]
        ? ARTISTS[initialStyle.index]
        : null;

    const byName =
      ARTISTS.find(
        (a) =>
          a.name.toLowerCase() === String(initialStyle.name || "").toLowerCase()
      ) ||
      ARTISTS.find((a) =>
        String(initialStyle.name || "")
          .toLowerCase()
          .startsWith(a.name.toLowerCase().slice(0, 5))
      );

    const chosen = byIndex || byName || ARTISTS[0];
    setSelectedArtist(chosen);
    setMode(initialStyle.action === "storyline" ? "storyline" : "portrait");
  }, [initialStyle]);

  // Camera stream management
  useEffect(() => {
    if (!stream || !videoRef.current) return;
    const video = videoRef.current;
    video.srcObject = stream;
    video.setAttribute("playsinline", "");
    video.muted = true;

    const start = async () => {
      if (video.readyState < 1) {
        await new Promise((resolve) => {
          const onLoaded = () => {
            video.removeEventListener("loadedmetadata", onLoaded);
            resolve();
          };
          video.addEventListener("loadedmetadata", onLoaded, { once: true });
        });
      }
      try {
        await video.play();
        needsGestureRef.current = false;
      } catch {
        needsGestureRef.current = true;
      }
    };
    start();
  }, [stream]);

  // --- Smart Idle Timer Logic ---
  useEffect(() => {
    let timeoutId;
    
    const resetTimer = () => {
      clearTimeout(timeoutId);
      // Wait for 30s of inactivity to trigger onHome
      timeoutId = setTimeout(() => {
        onHome();
      }, 30000);
    };

    // If generating/refining, pause the timer completely.
    // If we're not running a job, start the timer now.
    if (rendering) {
      clearTimeout(timeoutId);
    } else {
      resetTimer();
    }

    const handleActivity = () => {
      // Don't reset anything if we are currently rendering an image.
      if (!rendering) {
        resetTimer();
      }
    };

    // Listen to usual kiosk interaction events
    window.addEventListener("pointerdown", handleActivity, { passive: true });
    window.addEventListener("pointermove", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity);

    // Cleanup listeners and intervals
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("pointerdown", handleActivity);
      window.removeEventListener("pointermove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
    };
  }, [rendering, onHome]);

  useEffect(() => {
    const handler = async () => {
      if (needsGestureRef.current && videoRef.current) {
        try {
          await videoRef.current.play();
          needsGestureRef.current = false;
        } catch { }
      }
    };
    window.addEventListener("pointerdown", handler, { passive: true });
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    };
  }, []);

  const stopCamera = useCallback(() => {
    try {
      if (videoRef.current) {
        videoRef.current.pause?.();
        videoRef.current.srcObject = null;
      }
      if (stream) stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    } catch { }
    openingRef.current = false;
  }, [stream]);

  const openCamera = useCallback(async () => {
    if (openingRef.current || stream) return;
    openingRef.current = true;
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", aspectRatio: 12 / 16 },
        audio: false,
      });
      setShowCapturedImage(false);
      setStream(s);
    } catch (e) {
      console.error("Could not open camera", e);
    } finally {
      openingRef.current = false;
    }
  }, [stream]);

  const runCountdown = (secs, onDone) => {
    let v = Math.max(1, Math.floor(secs));
    setCountdown(v);
    const iv = setInterval(() => {
      v -= 1;
      setCountdown(v);
      if (v <= 0) {
        clearInterval(iv);
        onDone?.();
      }
    }, 1000);
  };

  const captureStill = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return "";
    const w = video.videoWidth || 720;
    const h = video.videoHeight || 1280;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);
    return canvas.toDataURL("image/png");
  };

  const setNewResult = (newUrl) => {
    if (currentImageRef.current && currentImageRef.current.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(currentImageRef.current);
      } catch { }
    }
    currentImageRef.current = newUrl;
    setResultUrl(newUrl);
  };

  const builtPrompt = [selectedArtist?.prompt?.trim(), prompt.trim()]
    .filter(Boolean)
    .join(", ");

  const handleGenerate = async () => {
    const trimmed = (builtPrompt || "").trim();
    if (!trimmed) return console.error("Prompt required (select an artist or add text)");

    const src = capturedUrlRef.current || currentImageRef.current || resultUrl;
    if (!src) return console.error("No captured image to generate from");

    setRendering(true);
    setGeneratingResultUrl(null); // Clear so ProcessingDisplay keeps flipping until new result arrives
    try {
      const imgBlob = await (await fetch(src)).blob();
      const form = new FormData();
      form.append("image_file", imgBlob, "capture.png");
      form.append("prompt", trimmed);
      form.append("mode", mode);

      const response = await fetch(`${BACKEND_URL}/edit`, {
        method: "POST",
        body: form,
      });
      if (!response.ok) throw new Error(`Backend error (${response.status})`);

      const outBlob = await response.blob();
      const newObjectUrl = URL.createObjectURL(outBlob);
      setGeneratingResultUrl(newObjectUrl); // Pass to ProcessingDisplay so it flips to final result
      setNewResult(newObjectUrl);
    } catch (e) {
      console.error("GENERATE failed:", e);
      setRendering(false); // Only reset on error; on success, animation completion will reset it.
    }
  };



  const onClickCapture = () => {
    runCountdown(3, async () => {
      const dataUrl = await captureStill();
      capturedUrlRef.current = dataUrl;
      currentImageRef.current = dataUrl;
      setShowCapturedImage(true);
      stopCamera();
    });
  };

  const renderContent = () => {
    if (rendering) {
      const sourceImageUrl = capturedUrlRef.current || currentImageRef.current || resultUrl;
      return (
        <ProcessingDisplay
          capturedImageUrl={sourceImageUrl}
          resultUrl={generatingResultUrl}
          onAnimationComplete={() => {
            setRendering(false);
            setGeneratingResultUrl(null);
          }}
        />
      );
    }
    if (resultUrl && !rendering) {
      return <img src={resultUrl} alt="Result" className="w-full h-full object-cover" />;
    }
    if (stream) {
      return <video ref={videoRef} playsInline autoPlay muted className="w-full h-full object-cover" />;
    }
    if (showCapturedImage && capturedUrlRef.current) {
      return <img src={capturedUrlRef.current} alt="Captured" className="w-full h-full object-cover" />;
    }
    return (
      <div className="text-center px-6 opacity-80">
        <p className="text-sm">Tap “Open Camera” to begin.</p>
      </div>
    );
  };

  const hasCamera = !!stream;
  const hasCaptured = !!capturedUrlRef.current;
  const hasResult = !!resultUrl;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-10 backdrop-blur bg-slate-900/50 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Inline back arrow */}
          <button
            onClick={onBack}
            className="text-white text-2xl sm:text-3xl font-light hover:scale-110 transition-transform"
            title="Back"
            aria-label="Go Back"
          >
            ←
          </button>

          <Camera className="w-6 h-6 text-white/90" />

          <h1 className="text-lg font-semibold tracking-tight text-white">
            {mode === "storyline" ? "Storyline Generator" : "Portrait Generator"}
          </h1>
        </div>

        {/* Top-right Home (fixed so it always stays visible) */}
        <HomeButton onHome={onHome} />
      </header>

      <main className="max-w-6xl w-full mx-auto px-4 pb-16 pt-6 flex flex-col items-center gap-6">
        <TitleDisplay />

        <div className="grid w-full max-w-4xl gap-4 md:grid-cols-[1fr,360px]">
          {/* Display Column */}
          <div className="w-full rounded-2xl border border-white/10 bg-slate-900/50 overflow-hidden shadow-xl">
            {/* Artist + Mode selector */}
            <div className="p-3 border-b border-white/10 flex items-center justify-end gap-3">
              {/* Animated Mode Toggle */}
              <div className="relative w-40 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between cursor-pointer overflow-hidden">
                <motion.div
                  layout
                  className="absolute top-0 bottom-0 rounded-xl bg-indigo-500/70"
                  style={{ left: mode === "portrait" ? "0%" : "50%", width: "50%" }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                />
                <button
                  onClick={() => setMode("portrait")}
                  className={`relative z-10 flex-1 h-full flex items-center justify-center text-sm font-medium transition-colors ${mode === "portrait" ? "text-white" : "text-slate-300"
                    }`}
                >
                  Portrait
                </button>
                <button
                  onClick={() => setMode("storyline")}
                  className={`relative z-10 flex-1 h-full flex items-center justify-center text-sm font-medium transition-colors ${mode === "storyline" ? "text-white" : "text-slate-300"
                    }`}
                >
                  Storyline
                </button>
              </div>
            </div>

            {/* Display Area */}
            <div className="relative aspect-[12/16] bg-black flex items-center justify-center">
              {renderContent()}

              {/* Artist tag */}
              {selectedArtist && (
                <div className="absolute right-3 top-3 z-10">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 text-xs font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    {selectedArtist.name}
                  </span>
                </div>
              )}

              <AnimatePresence>
                {countdown > 0 && <CountdownOverlay value={countdown} />}
              </AnimatePresence>
            </div>
          </div>

          {/* Controls Column */}
          <div className="flex flex-col gap-3">
            {/* Show text box only for storyline mode */}
            <AnimatePresence mode="wait">
              {mode === "storyline" && (
                <motion.textarea
                  key="storyline-box"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  value={prompt}
                  onChange={onChangePrompt}
                  onFocus={() => setKeyboardOpen(true)}
                  placeholder="Describe your storyline… (artist style added automatically)"
                  className="w-full h-36 rounded-xl bg-slate-900/70 border border-white/10 p-3 outline-none"
                />
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={openCamera}
                disabled={!!stream}
                className="rounded-xl px-4 py-3 bg-white/10 border border-white/10 hover:bg-white/15 disabled:opacity-50"
              >
                Open Camera
              </button>
              <button
                onClick={onClickCapture}
                disabled={!stream}
                className="rounded-xl px-4 py-3 bg-white/10 border border-white/10 hover:bg-white/15 disabled:opacity-50"
              >
                Capture
              </button>
            </div>

            <button
              onClick={handleGenerate}
              disabled={(!hasCaptured && !hasResult) || (!builtPrompt && !prompt.trim()) || rendering}
              className="rounded-xl px-4 py-3 bg-indigo-500/90 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 disabled:opacity-60"
              title={builtPrompt ? builtPrompt : "Select an artist or type a prompt"}
            >
              <Sparkles className="w-4 h-4" /> Generate
            </button>



            <button
              onClick={() => {
                setShowCapturedImage(false);
                openCamera();
              }}
              className="rounded-xl px-4 py-3 bg-white/10 border border-white/10 hover:bg-white/15"
            >
              New Capture
            </button>
          </div>
        </div>
      </main>

      <canvas ref={canvasRef} className="hidden" />

      {/* Virtual Keyboard Overlay */}
      <AnimatePresence>
        {keyboardOpen && mode === "storyline" && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[100] bg-slate-900/95 backdrop-blur-md border-t border-white/10 p-4 pb-8 shadow-2xl"
          >
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setKeyboardOpen(false)}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium"
                >
                  Done
                </button>
              </div>
              <Keyboard
                keyboardRef={(r) => (keyboardRef.current = r)}
                onChange={onChangeKeyboard}
                inputName="default"
                theme={"hg-theme-default myTheme1"}
                physicalKeyboardHighlight={true}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}