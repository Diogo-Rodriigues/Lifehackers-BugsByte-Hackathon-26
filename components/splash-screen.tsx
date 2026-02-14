"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Show splash for 2 seconds, then fade out
    const timer = setTimeout(() => {
      setFadeOut(true)
    }, 2000)

    // Complete after fade out animation
    const completeTimer = setTimeout(() => {
      setIsVisible(false)
      onComplete()
    }, 2800) // 2000ms display + 800ms fade

    return () => {
      clearTimeout(timer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-primary/10 via-background to-primary/5 transition-opacity duration-800",
        fadeOut && "opacity-0"
      )}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="animate-in fade-in zoom-in duration-700">
            <Image src="/logo.png" alt="NutriFuel" width={250} height={250} priority />
          </div>
          <p className="font-display text-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <span className="text-[#38b6ff]">Nourish</span>{" "}
            <span className="text-primary">Your Journey.</span>
          </p>
        </div>

        {/* Collaboration */}
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
          <span className="text-sm text-muted-foreground">in collaboration with</span>
          <Image src="/nutrium-logo.png" alt="Nutrium" width={80} height={28} className="opacity-70" />
        </div>

        {/* Animated loading bar */}
        <div className="relative h-1 w-32 overflow-hidden rounded-full bg-primary/20 animate-in fade-in duration-700 delay-500">
          <div className="absolute inset-0 h-full w-full origin-left animate-[shimmer_1.5s_ease-in-out_infinite] rounded-full bg-primary" />
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}
