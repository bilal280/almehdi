import { useCallback, useEffect, useRef, useState } from "react";

export function useScrollReveal() {
  const [visible, setVisible] = useState<string[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const getObserver = useCallback(() => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisible((prev) =>
                prev.includes(entry.target.id) ? prev : [...prev, entry.target.id]
              );
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -80px 0px" }
      );
    }
    return observerRef.current;
  }, []);

  const register = useCallback(
    (id: string) => (node: HTMLElement | null) => {
      if (!node) return;
      getObserver().observe(node);
    },
    [getObserver]
  );

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  return { register, isVisible: (id: string) => visible.includes(id) };
}