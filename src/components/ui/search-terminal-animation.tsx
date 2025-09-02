"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function SearchTerminalAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const streaks: HTMLDivElement[] = []

    const createContinuousStreaks = () => {
      for (let layer = 0; layer < 8; layer++) {
        for (let i = 0; i < 20; i++) {
          const streakContainer = document.createElement("div")
          const head = document.createElement("div")
          const tail = document.createElement("div")

          const isLeftToRight = Math.random() > 0.5

          const layerMultiplier = layer + 1
          const headSize = gsap.utils.random(1.5, 2.5) / layerMultiplier
          const tailLength = gsap.utils.random(200, 400) / layerMultiplier
          const tailThickness = gsap.utils.random(0.5, 1.2) / layerMultiplier
          const opacity = gsap.utils.random(0.15, 0.4) / layerMultiplier

          const centerHeight = container.clientHeight * 0.8 // Use 80% of container height
          const centerOffset = container.clientHeight * 0.1 // Start 10% from top
          const spacing = centerHeight / 20
          const yPosition = centerOffset + i * spacing + gsap.utils.random(-30, 30)

          const angle = isLeftToRight ? gsap.utils.random(-8, -3) : gsap.utils.random(3, 8)
          const speed = gsap.utils.random(8, 15) * layerMultiplier

          head.style.cssText = `
            position: absolute;
            ${isLeftToRight ? "left: 0;" : "right: 0;"}
            top: 50%;
            width: ${headSize}px;
            height: ${headSize}px;
            background: hsla(${gsap.utils.random(120, 160)}, ${gsap.utils.random(70, 90)}%, ${gsap.utils.random(50, 70) + 20}%, ${opacity * 2});
            border-radius: 50%;
            transform: translateY(-50%);
            filter: blur(0.3px);
            box-shadow: 
              0 0 ${headSize * 3}px hsla(${gsap.utils.random(120, 160)}, ${gsap.utils.random(70, 90)}%, ${gsap.utils.random(50, 70)}%, ${opacity}),
              0 0 ${headSize * 6}px hsla(${gsap.utils.random(120, 160)}, ${gsap.utils.random(70, 90)}%, ${gsap.utils.random(50, 70)}%, ${opacity * 0.3});
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
              hsla(${gsap.utils.random(120, 160)}, ${gsap.utils.random(70, 90)}%, ${gsap.utils.random(50, 70)}%, ${opacity * 0.05}) 10%,
              hsla(${gsap.utils.random(120, 160)}, ${gsap.utils.random(70, 90)}%, ${gsap.utils.random(50, 70)}%, ${opacity * 0.3}) 70%, 
              hsla(${gsap.utils.random(120, 160)}, ${gsap.utils.random(70, 90)}%, ${gsap.utils.random(50, 70)}%, ${opacity}) 100%
            );
            border-radius: ${tailThickness}px;
            transform: translateY(-50%);
            filter: blur(${tailThickness * 0.2}px);
            box-shadow: 
              0 0 ${tailThickness * 3}px hsla(${gsap.utils.random(120, 160)}, ${gsap.utils.random(70, 90)}%, ${gsap.utils.random(50, 70)}%, ${opacity * 0.2});
            z-index: 1;
          `

          streakContainer.style.cssText = `
            position: absolute;
            top: ${yPosition}px;
            width: ${tailLength + headSize}px;
            height: ${Math.max(headSize, tailThickness)}px;
            transform: rotate(${angle}deg);
            z-index: ${10 - layer};
          `

          streakContainer.appendChild(tail)
          streakContainer.appendChild(head)
          container.appendChild(streakContainer)
          streaks.push(streakContainer)

          // Modified to converge at center and disappear
          const centerX = container.clientWidth / 2

          if (isLeftToRight) {
            gsap.set(streakContainer, {
              x: -(tailLength + headSize),
              left: 0,
            })
            gsap.to(streakContainer, {
              x: centerX,
              opacity: 0,
              duration: speed * 0.5,
              ease: "none",
              repeat: -1,
              repeatDelay: gsap.utils.random(0.5, 2),
            })
          } else {
            gsap.set(streakContainer, {
              x: tailLength + headSize,
              right: 0,
            })
            gsap.to(streakContainer, {
              x: -centerX,
              opacity: 0,
              duration: speed * 0.5,
              ease: "none",
              repeat: -1,
              repeatDelay: gsap.utils.random(0.5, 2),
            })
          }

          ScrollTrigger.create({
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
            onUpdate: (self) => {
              const progress = self.progress
              const parallaxSpeed = (layer + 1) * 0.2
              const parallaxOffset = progress * parallaxSpeed * 30
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
        const layer = Math.floor(index / 20)
        const influence = (8 - layer) * 0.03
        const offsetX = (mouseX - 0.5) * influence * 8
        const offsetY = (mouseY - 0.5) * influence * 4

        gsap.to(streak, {
          x: `+=${offsetX}`,
          y: `+=${offsetY}`,
          duration: 2.5,
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
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{
        zIndex: 1,
        background: `
          radial-gradient(ellipse at top left, rgba(34, 197, 94, 0.03) 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, rgba(16, 185, 129, 0.03) 0%, transparent 50%)
        `,
      }}
    />
  )
}