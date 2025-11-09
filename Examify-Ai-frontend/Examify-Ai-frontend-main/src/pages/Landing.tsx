import Header from "@/components/landing/header"
import Hero from "@/components/landing/hero"
import Features from "@/components/landing/features"
import AISection from "@/components/landing/ai-section"
import Pricing from "@/components/landing/pricing"
import Testimonials from "@/components/landing/testimonials"
import Footer from "@/components/landing/footer"
import Reveal from "@/components/motion/reveal"

export default function Landing() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <Header />
      <main>
        <Reveal delay={0.0}>
          <Hero />
        </Reveal>
        <Reveal delay={0.1}>
          <Features />
        </Reveal>
        <Reveal delay={0.2}>
          <AISection />
        </Reveal>
        <Reveal delay={0.3}>
          <Pricing />
        </Reveal>
        <Reveal delay={0.4}>
          <Testimonials />
        </Reveal>
      </main>
      <Footer />
    </div>
  )
}
