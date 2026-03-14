import React, { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";

const NEW_SUBMISSION_DURATION_MS = 17000;
const SLIDESHOW_INTERVAL_MS = 7000;
const POLL_INTERVAL_MS = 5000;

export default function TvGallery() {
  const [submissions, setSubmissions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newSubmission, setNewSubmission] = useState(null);
  const slideshowRef = useRef(null);
  const newSubmissionTimerRef = useRef(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('comic_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (data && !error) {
        setSubmissions(data);
      }
    } catch {
      // ignore
    }
  }, []);

  const showNewSubmission = useCallback((sub) => {
    if (newSubmissionTimerRef.current) {
      clearTimeout(newSubmissionTimerRef.current);
      newSubmissionTimerRef.current = null;
    }
    setNewSubmission(sub);
    newSubmissionTimerRef.current = setTimeout(() => {
      setNewSubmission(null);
      newSubmissionTimerRef.current = null;
    }, NEW_SUBMISSION_DURATION_MS);
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  useEffect(() => {
    const channel = supabase
      .channel("comic_submissions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comic_submissions" },
        (payload) => {
          const row = payload.new;
          showNewSubmission(row);
          setSubmissions((prev) => [row, ...prev]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [showNewSubmission]);

  useEffect(() => {
    const id = setInterval(fetchSubmissions, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchSubmissions]);

  useEffect(() => {
    if (newSubmission) return;
    if (submissions.length === 0) return;
    slideshowRef.current = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % submissions.length);
    }, SLIDESHOW_INTERVAL_MS);
    return () => {
      if (slideshowRef.current) clearInterval(slideshowRef.current);
    };
  }, [newSubmission, submissions.length]);

  const displayItem = newSubmission ?? submissions[currentIndex];

  return (
    <main className="min-h-screen w-full bg-slate-950 flex items-center justify-center overflow-hidden relative text-white font-sans">
      <AnimatePresence mode="wait">
        {!displayItem ? (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-12"
          >
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full border-2 border-cyan-500/30 animate-[spin_4s_linear_infinite]" />
              <div className="absolute inset-2 rounded-full border-2 border-purple-500/20 animate-[spin_6s_linear_infinite_reverse]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              AI Art Exhibit
            </h1>
            <p className="text-slate-400 text-xl">Waiting for artwork...</p>
          </motion.div>
        ) : (
          <motion.div
            key={displayItem.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full h-full min-h-screen flex items-center justify-center"
          >
            <motion.div
              className="relative max-w-full max-h-[85vh] overflow-hidden"
              animate={{
                scale: [1, 1.04, 1.04],
                x: [0, "1%", "1%"],
                y: [0, "1%", "1%"],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            >
              <img
                src={displayItem.generated_url}
                alt={`AI-generated art in ${displayItem.style} style`}
                className="max-w-full max-h-[85vh] object-contain w-full h-full"
              />
            </motion.div>

            <div className="absolute bottom-6 right-6 p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl">
              <QRCodeSVG
                value={displayItem.generated_url}
                size={120}
                level="M"
                includeMargin={false}
                bgColor="transparent"
                fgColor="#ffffff"
              />
              <p className="text-xs text-slate-300 mt-2 text-center font-medium">
                Scan to save
              </p>
            </div>

            <AnimatePresence>
              {newSubmission && (
                <motion.div
                  initial={{ y: -80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -80, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute top-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-black/40 border border-cyan-400/50 rounded-full shadow-[0_0_25px_rgba(6,182,212,0.4)]"
                >
                  <span className="text-cyan-200 font-semibold">New artwork!</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-6 left-6 px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-slate-300 text-sm font-medium"
            >
              {displayItem.style}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
