import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

type ShowToast = (message: string) => void;

const ToastContext = createContext<ShowToast>(() => {});

export function useToast(): ShowToast {
  return useContext(ToastContext);
}

/**
 * Lightweight toast used to acknowledge link clicks, especially inside
 * sandboxed preview iframes where opening mail clients / new tabs is blocked,
 * the click copies the target and confirms it visually.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const show = useCallback((msg: string) => {
    setMessage(msg);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(null), 2800);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2">
        <AnimatePresence>
          {message !== null && (
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex items-center gap-2.5 rounded-full border border-[#D7E2EA]/25 bg-[#16161c]/95 px-5 py-3 shadow-2xl backdrop-blur"
            >
              <Check size={15} strokeWidth={2.2} className="shrink-0 text-[#FFFFFF]" />
              <span className="max-w-[70vw] truncate text-[11px] font-medium uppercase tracking-widest text-[#FFFFFF] sm:text-xs">
                {message}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
