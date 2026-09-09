"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export function PageTransition() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 700);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (prefersReducedMotion) return null;

  return (
    <AnimatePresence mode="wait">
      {isNavigating && (
        <motion.div
          key={pathname}
          className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 origin-left"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        >
          <div className="h-full w-full bg-gradient-to-r from-deep-forest via-fresh-leaf to-butter-gold" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
