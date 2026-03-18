import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import type { Member } from '../types';

interface Props {
  winner: Member;
}

function fireConfetti() {
  const defaults = { spread: 80, ticks: 100, gravity: 0.8, decay: 0.94, startVelocity: 30 };

  confetti({ ...defaults, particleCount: 80, origin: { x: 0.15, y: 0.6 }, angle: 60 });
  confetti({ ...defaults, particleCount: 80, origin: { x: 0.85, y: 0.6 }, angle: 120 });

  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 50,
      origin: { x: 0.5, y: 0.3 },
      spread: 120,
      startVelocity: 40,
      colors: ['#f59e0b', '#3b82f6', '#22c55e', '#ef4444', '#8b5cf6'],
    });
  }, 300);
}

export function WinnerReveal({ winner }: Props) {
  useEffect(() => {
    fireConfetti();
  }, [winner.id]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="mt-6 text-center"
    >
      <p className="mb-3 text-lg text-amber-400">おめでとう!</p>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
        className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full text-4xl font-bold text-white shadow-[0_0_30px_rgba(245,158,11,0.4)]"
        style={{ backgroundColor: winner.color }}
      >
        {winner.name.charAt(0)}
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-white"
      >
        今回のラッキーパーソンは
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-2 text-4xl font-black text-amber-400"
      >
        {winner.name}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-1 text-lg text-white"
      >
        さんです!
      </motion.p>
    </motion.div>
  );
}
