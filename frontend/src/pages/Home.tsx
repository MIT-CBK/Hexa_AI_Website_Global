import { Hero } from "@/components/sections/Hero"
import { LivePlatform } from "@/components/sections/LivePlatform"
import { VideoWall } from "@/components/sections/VideoWall"
import { SolutionsSection, ServicesSection } from "@/components/sections/Offerings"
import { VisionMission } from "@/components/sections/VisionMission"
import { CertificationsPreview } from "@/components/sections/CertificationsPreview"
import { NewsletterPreview } from "@/components/sections/NewsletterPreview"
import { CtaBand } from "@/components/sections/CtaBand"
import { Contact } from "@/components/sections/Contact"

export default function Home() {
  return (
    <>
      <Hero />
      <SolutionsSection />
      <LivePlatform />
      <ServicesSection />
      <VideoWall />
      <VisionMission />
      <CertificationsPreview />
      <NewsletterPreview />
      <CtaBand />
      <Contact />
    </>
  )
}
