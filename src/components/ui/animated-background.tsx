"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const streaks: HTMLDivElement[] = []

    const createContinuousStreaks = () => {
      for (let layer = 0; layer < 4; layer++) {
        for (let i = 0; i < 12; i++) {
          const streakContainer = document.createElement("div")
          const head = document.createElement("div")
          const tail = document.createElement("div")

          const isLeftToRight = Math.random() > 0.5

          const layerMultiplier = layer + 1
          const headSize = gsap.utils.random(0.6, 1.2) / layerMultiplier
          const tailLength = gsap.utils.random(120, 250) / layerMultiplier
          const tailThickness = gsap.utils.random(0.2, 0.6) / layerMultiplier
          const opacity = gsap.utils.random(0.1, 0.3) / layerMultiplier

          const centerHeight = window.innerHeight * 0.7
          const centerOffset = window.innerHeight * 0.15
          const spacing = centerHeight / 12
          const yPosition = centerOffset + i * spacing + gsap.utils.random(-25, 25)

          const angle = isLeftToRight ? gsap.utils.random(-6, -2) : gsap.utils.random(2, 6)
          const speed = gsap.utils.random(10, 16) * layerMultiplier

          head.style.cssText = `
            position: absolute;
            ${isLeftToRight ? "left: 0;" : "right: 0;"}
            top: 50%;
            width: ${headSize}px;
            height: ${headSize}px;
            background: hsla(${gsap.utils.random(140, 170)}, ${gsap.utils.random(60, 80)}%, ${gsap.utils.random(50, 65)}%, ${opacity * 2.5});
            border-radius: 50%;
            transform: translateY(-50%);
            filter: blur(0.2px);
            box-shadow: 
              0 0 ${headSize * 2}px hsla(${gsap.utils.random(140, 170)}, 70%, 60%, ${opacity * 1.5}),
              0 0 ${headSize * 4}px hsla(${gsap.utils.random(140, 170)}, 60%, 55%, ${opacity * 0.4});
            z-index: 2;
          `

          tail.style.cssText = `
            position: absolute;
            ${isLeftToRight ? `left: -${tailLength}px;` : `right: -${tailLength}px;`}
            top: 50%;
            width: ${tailLength}px;
            height: ${tailThickness}px;
            background: linear-gradient(${isLeftToRight ? "90deg" : "270deg"}, 
              transparent 0%, 
              hsla(${gsap.utils.random(140, 170)}, 65%, 55%, ${opacity * 0.03}) 8%,
              hsla(${gsap.utils.random(140, 170)}, 70%, 60%, ${opacity * 0.2}) 60%, 
              hsla(${gsap.utils.random(140, 170)}, 75%, 65%, ${opacity * 0.8}) 95%
            );
            border-radius: ${tailThickness}px;
            transform: translateY(-50%);
            filter: blur(${tailThickness * 0.15}px);
            box-shadow: 
              0 0 ${tailThickness * 2}px hsla(${gsap.utils.random(140, 170)}, 70%, 60%, ${opacity * 0.15});
            z-index: 1;
          `

          streakContainer.style.cssText = `
            position: absolute;
            top: ${yPosition}px;
            width: ${tailLength + headSize}px;
            height: ${Math.max(headSize, tailThickness)}px;
            transform: rotate(${angle}deg);
            z-index: ${8 - layer};
          `

          streakContainer.appendChild(tail)
          streakContainer.appendChild(head)
          container.appendChild(streakContainer)
          streaks.push(streakContainer)

          if (isLeftToRight) {
            gsap.set(streakContainer, {
              x: -(tailLength + headSize),
              left: 0,
            })
            gsap.to(streakContainer, {
              x: window.innerWidth / 2 + tailLength,
              duration: speed,
              ease: "none",
              repeat: -1,
              repeatDelay: gsap.utils.random(0.8, 2.5),
            })
          } else {
            gsap.set(streakContainer, {
              x: tailLength + headSize,
              right: 0,
            })
            gsap.to(streakContainer, {
              x: -(window.innerWidth / 2 + tailLength),
              duration: speed,
              ease: "none",
              repeat: -1,
              repeatDelay: gsap.utils.random(0.8, 2.5),
            })
          }

          ScrollTrigger.create({
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            onUpdate: (self) => {
              const progress = self.progress
              const parallaxSpeed = (layer + 1) * 0.15
              const parallaxOffset = progress * parallaxSpeed * 20
              gsap.set(streakContainer, {
                y: yPosition + parallaxOffset,
              })
            },
          })
        }
      }
    }

    createContinuousStreaks()

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX / window.innerWidth
      const mouseY = e.clientY / window.innerHeight

      streaks.forEach((streak, index) => {
        const layer = Math.floor(index / 12)
        const influence = (4 - layer) * 0.02
        const offsetX = (mouseX - 0.5) * influence * 6
        const offsetY = (mouseY - 0.5) * influence * 3

        gsap.to(streak, {
          x: `+=${offsetX}`,
          y: `+=${offsetY}`,
          duration: 2,
          ease: "power2.out",
        })
      })
    }

    container.addEventListener("mousemove", handleMouseMove)

    // Cleanup
    return () => {
      container.removeEventListener("mousemove", handleMouseMove)
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
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
      className="fixed inset-0 z-0"
      style={{
        background: `
          radial-gradient(ellipse at top left, rgba(16, 185, 129, 0.02) 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, rgba(34, 197, 94, 0.02) 0%, transparent 50%),
          radial-gradient(ellipse at center, rgba(5, 150, 105, 0.01) 0%, transparent 70%)
        `,
        pointerEvents: 'none'
      }}
    />
  )
}