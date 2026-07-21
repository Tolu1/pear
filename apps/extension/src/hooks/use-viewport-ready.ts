import { useEffect, useState } from "react";

export function useViewportReady() {
  const [ready, setReady] = useState(() => window.innerWidth > 0);

  useEffect(() => {
    if (ready) return;

    let frame = requestAnimationFrame(function check() {
      if (window.innerWidth > 0) {
        setReady(true);
        return;
      }
      frame = requestAnimationFrame(check);
    });

    return () => cancelAnimationFrame(frame);
  }, [ready]);

  return ready;
}
