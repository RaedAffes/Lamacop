"use client"

import { useEffect, useRef, useState } from "react"

type Props = {
  children: React.ReactNode
  className?: string
  delayMs?: number
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
}

export default function ScrollReveal({ children, className, delayMs = 0 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (prefersReducedMotion()) {
      setShown(true)
      return
    }

    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight || 0
    const initiallyInView = rect.top < vh && rect.bottom > 0

    if (initiallyInView) {
      // Defer one tick so the transition runs even
      // when the element is already in view on mount.
      setTimeout(() => setShown(true), 30)
      return
    }

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          setShown(true)
          obs.disconnect()
        }
      },
      { threshold: 0.15 }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const base = "transform-gpu transition-[opacity,transform] duration-700 ease-out"
  const hidden = "opacity-0 translate-y-4"
  const visible = "opacity-100 translate-y-0"

  return (
    <div
      ref={ref}
      className={[
        base,
        shown ? visible : hidden,
        "motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  )
}
