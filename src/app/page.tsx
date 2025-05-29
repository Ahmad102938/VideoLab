import HeroSection from "../components/sections/heroSection"
import BuildWithSection from "@/components/sections/buildWithSection"
// import PodcastSection from "@/components/sections/avatarVideoSection"
import PodcastSection from "@/components/sections/avatarVideoSection"
import DiscoverSection from "@/components/sections/dicoverSection"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "VideoLab - Generate AI Avatar Videos",
  description:
    "Generate stunning AI avatar videos in minutes with VideoLab. No filming, no editing, just pure creativity.",
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen ">
        <HeroSection />
        <BuildWithSection />
        <PodcastSection />
        <DiscoverSection />
      </main>
      <Footer />
    </>
  )
}
