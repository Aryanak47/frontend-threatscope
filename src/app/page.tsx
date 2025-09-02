import { HeroSection } from '@/components/landing/hero-section'
import { SearchSection } from '@/components/landing/search-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { Footer } from '@/components/layout/footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Navigation */}
      <HeroSection />
      
      {/* Main Search Interface */}
      <SearchSection />
      
      {/* Features */}
      <FeaturesSection />
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
