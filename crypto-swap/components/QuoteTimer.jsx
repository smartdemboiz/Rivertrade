'use client';

import { useEffect, useState } from 'react';

export default function QuoteTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSeconds((current) => (current >= 30 ? 0 : current + 1));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return <span aria-label={`Timer ${seconds} seconds`}>{seconds}s</span>;
}
