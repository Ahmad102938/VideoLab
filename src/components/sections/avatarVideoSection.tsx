"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Play, Pause, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import pod from "../../assets/demoPodCast.mp3"

export default function PodcastSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const features = [
    "AI-generated podcast episodes from text",
    "Multilingual voices and accents",
    "Customizable intros and outros",
    "High-quality audio output",
    "Seamless Podcast generation",
  ]

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <section ref={ref} id="podcast-section" className="w-full py-16 md:py-24 bg-[#FFA386]">
      <div className="container px-4 md:px-6">  
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl text-[#38000A] font-bold tracking-tighter mb-4">AI Podcast Generation</h2>
            <p className="text-black mb-6">
              Create engaging podcast episodes effortlessly using AI. Turn text or audio inputs into professional podcasts, perfect for storytelling, marketing, or automated content creation.
            </p>

            <ul className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="flex items-center text-gray-900"
                >
                  <CheckCircle className="h-5 w-5 text-[#CD1C18] mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-[#CD1C18] hover:bg-[#cd1b18d7] text-white hover:cursor-pointer">Try This</Button>
              <Button variant="outline" className="hover:cursor-pointer">Sign Up</Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-blue-50 to-black-100 p-6"
          >
            <div className="aspect-video relative flex flex-col items-center justify-center">
              <audio
                ref={audioRef}
                src={pod}
                className="w-full"
              />
              <div className="flex items-center justify-center mt-4">
                <motion.button
                  onClick={togglePlay}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#38000A] text-white rounded-full p-4 shadow-lg hover:bg-[#38000ad0] transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8 fill-white" />
                  ) : (
                    <Play className="h-8 w-8 fill-white" />
                  )}
                </motion.button>
              </div>
              <div className="w-full h-12 mt-4 bg-gray-200 rounded-lg overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#CD1C18] to-[#38000A]"
                  initial={{ width: "0%" }}
                  animate={{ width: isPlaying ? "100%" : "0%" }}
                  transition={{ duration: 30, ease: "linear" }}
                />
              </div>
              <p className="text-center text-black mt-4 font-medium">
                Listen to a demo podcast generated by our AI technology
              </p>
            </div>
            
          </motion.div>
        </div>
      </div>
    </section>
  )
}