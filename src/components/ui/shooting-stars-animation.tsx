"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function ShootingStarsAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const streaks: HTMLDivElement[] = []

    const createShootingStars = () => {
      for (let layer = 0; layer < 3; layer++) {
        for (let i = 0; i < 8; i++) {
          const streakContainer = document.createElement("div")
          const head = document.createElement("div")
          const tail = document.createElement("div")

          const isLeftToRight = Math.random() > 0.5

          // Significantly larger sizes for better visibility
          const layerMultiplier = layer + 1
          const headSize = gsap.utils.random(4, 8) / Math.sqrt(layerMultiplier) // Much larger head
          const tailLength = gsap.utils.random(250, 450) / layerMultiplier // Longer tails
          const tailThickness = gsap.utils.random(1.5, 4) / layerMultiplier // Thicker tails
          const opacity = gsap.utils.random(0.2, 0.5) / layerMultiplier // Higher opacity

          // Position stars across the search section area
          const centerHeight = window.innerHeight * 0.8
          const centerOffset = window.innerHeight * 0.1
          const spacing = centerHeight / 8
          const yPosition = centerOffset + i * spacing + gsap.utils.random(-60, 60)

          const angle = isLeftToRight ? gsap.utils.random(-8, -3) : gsap.utils.random(3, 8)
          const speed = gsap.utils.random(8, 15) * layerMultiplier

          // Enhanced head with better glow effects
          head.style.cssText = `
            position: absolute;
            ${isLeftToRight ? "left: 0;" : "right: 0;"}
            top: 50%;
            width: ${headSize}px;
            height: ${headSize}px;
            background: radial-gradient(circle, 
              hsla(${gsap.utils.random(180, 220)}, ${gsap.utils.random(80, 100)}%, ${gsap.utils.random(70, 90)}%, ${opacity * 1.8}) 0%,
              hsla(${gsap.utils.random(180, 220)}, ${gsap.utils.random(70, 90)}%, ${gsap.utils.random(60, 80)}%, ${opacity * 1.2}) 50%,
              transparent 100%
            );
            border-radius: 50%;
            transform: translateY(-50%);
            filter: blur(0.4px);
            box-shadow: 
              0 0 ${headSize * 4}px hsla(${gsap.utils.random(180, 220)}, 100%, 80%, ${opacity}),
              0 0 ${headSize * 8}px hsla(${gsap.utils.random(180, 220)}, 90%, 70%, ${opacity * 0.6}),
              0 0 ${headSize * 15}px hsla(${gsap.utils.random(180, 220)}, 70%, 60%, ${opacity * 0.3});
            z-index: 2;
          `

          // Enhanced tail with gradient
          tail.style.cssText = `
            position: absolute;
            ${isLeftToRight ? `left: -${tailLength}px;` : `right: -${tailLength}px;`}
            top: 50%;
            width: ${tailLength}px;
            height: ${tailThickness}px;
            background: linear-gradient(${isLeftToRight ? "90deg" : "270deg"}, 
              transparent 0%, 
              hsla(${gsap.utils.random(180, 220)}, ${gsap.utils.random(70, 90)}%, ${gsap.utils.random(50, 70)}%, ${opacity * 0.2}) 20%,
              hsla(${gsap.utils.random(180, 220)}, ${gsap.utils.random(80, 100)}%, ${gsap.utils.random(70, 90)}%, ${opacity * 0.8}) 80%, 
              hsla(${gsap.utils.random(180, 220)}, ${gsap.utils.random(90, 100)}%, ${gsap.utils.random(80, 95)}%, ${opacity * 1.2}) 100%
            );
            border-radius: ${tailThickness}px;
            transform: translateY(-50%);
            filter: blur(${tailThickness * 0.3}px);
            box-shadow: 0 0 ${tailThickness * 6}px hsla(${gsap.utils.random(180, 220)}, 90%, 70%, ${opacity * 0.4});
            z-index: 1;
          `

          streakContainer.style.cssText = `
            position: absolute;
            top: ${yPosition}px;
            width: ${tailLength + headSize}px;
            height: ${Math.max(headSize, tailThickness)}px;
            transform: rotate(${angle}deg) translateZ(0);
            z-index: ${10 - layer};
            will-change: transform, opacity;
          `

          streakContainer.appendChild(tail)
          streakContainer.appendChild(head)
          container.appendChild(streakContainer)
          streaks.push(streakContainer)

          // Animation that flows INTO the terminal like data streams
          const centerX = window.innerWidth / 2
          
          // Target specific areas of the terminal interface
          const terminalTop = window.innerHeight * 0.35
          const terminalBottom = window.innerHeight * 0.65
          const terminalLeft = centerX - 250
          const terminalRight = centerX + 250
          
          // Create entry points at terminal edges
          const entryPoints = [
            { x: terminalLeft, y: terminalTop },     // Top-left corner
            { x: terminalRight, y: terminalTop },    // Top-right corner
            { x: terminalLeft, y: terminalBottom },  // Bottom-left corner
            { x: terminalRight, y: terminalBottom }, // Bottom-right corner
            { x: centerX, y: terminalTop },          // Top center
            { x: centerX, y: terminalBottom },       // Bottom center
          ]
          
          const targetPoint = entryPoints[i % entryPoints.length]

          if (isLeftToRight) {
            gsap.set(streakContainer, {
              x: -(tailLength + headSize),
              left: 0,
              opacity: 1,
              scale: 1
            })
            gsap.to(streakContainer, {
              x: targetPoint.x,
              y: `+=${targetPoint.y - yPosition}`,
              opacity: 0,
              scale: 0.1, // Almost disappear as it enters
              duration: speed * 0.8,
              ease: "power3.in", // Strong acceleration into terminal
              repeat: -1,
              repeatDelay: 0.3,
              delay: (i * 0.2) + (layer * 0.4)
            })
          } else {
            gsap.set(streakContainer, {
              x: tailLength + headSize,
              right: 0,
              opacity: 1,
              scale: 1
            })
            gsap.to(streakContainer, {
              x: -(window.innerWidth - targetPoint.x),
              y: `+=${targetPoint.y - yPosition}`,
              opacity: 0,
              scale: 0.1, // Almost disappear as it enters
              duration: speed * 0.8,
              ease: "power3.in", // Strong acceleration into terminal
              repeat: -1,
              repeatDelay: 0.3,
              delay: (i * 0.2) + (layer * 0.4)
            })
          }

          // Optional: Add subtle parallax effect without interfering with main animation
          // ScrollTrigger.create({
          //   trigger: container,
          //   start: "top bottom",
          //   end: "bottom top",
          //   scrub: 2,
          //   onUpdate: (self) => {
          //     const progress = self.progress
          //     const parallaxSpeed = (layer + 1) * 0.05
          //     const parallaxOffset = progress * parallaxSpeed * 10
          //     gsap.set(streakContainer, {
          //       y: yPosition + parallaxOffset,
          //     })
          //   },
          // })
        }
      }
    }

    createShootingStars()

    return () => {
      // ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
      streaks.forEach((streak) => {
        if (streak.parentNode) {
          streak.parentNode.removeChild(streak)
        }
      })
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{
        background: `
          radial-gradient(ellipse 800px 400px at 50% 20%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
          radial-gradient(ellipse 600px 300px at 80% 80%, rgba(99, 102, 241, 0.02) 0%, transparent 50%)
        `,
      }}
    />
  )
}