"use client"

import { useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { ChevronUp, ChevronDown, Play } from "lucide-react"

export default function BuildWithSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [isVideoHovered, setIsVideoHovered] = useState(false)

      const [isPlaying, setIsPlaying] = useState(true); // Video starts playing
      const videoRef = useRef(null);

    

      const togglePlay = () => {
        if(videoRef.current) {
          if (isPlaying) {
            videoRef.current.pause();
          } else {
            videoRef.current.play();
          }
          setIsPlaying(!isPlaying);
        }
      }

  return (
    <section ref={ref} id="products" className="w-full py-16 md:py-24 lg:py-32 bg-[#380009]">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-[#CD1B17] text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter mb-4">Build with VideoLab</h2>
          <p className="text-gray-100 md:text-lg max-w-[800px] mx-auto">
            VideoLab is designed to generate high-quality videos quickly and easily. Whether you need to create marketing
            content, training materials, or personalized messages,
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6">
            <ApiAccordion
              title="Avatar Video"
              description="Create stunning videos with AI avatars that speak your script. Our product allows you to generate high-quality videos with customizable avatars, backgrounds, and voiceovers. Perfect for marketing, training, and personalized messages."
            />
            <ApiAccordion
              title="Audio PodCast"
              description="
              Convert your text into a natural-sounding audio podcast. Our product uses advanced AI technology to generate high-quality audio from your script, making it easy to create engaging podcasts without the need for recording equipment or voice actors."
              defaultClosed
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="pt-4"
            >
              <a
                href="http://localhost:3000/sign-in"
                className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white bg-[#CD1B17] rounded-full shadow-md hover:bg-[#cd1a17ce] transition-colors"
              >
                Get Started
              </a>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="bg-[#fac9c0] rounded-3xl p-6 relative overflow-hidden"
          >
            <div
          className="relative aspect-video rounded-xl overflow-hidden bg-gray-50 shadow-md cursor-pointer"
          onMouseEnter={() => setIsVideoHovered(true)}
          onMouseLeave={() => setIsVideoHovered(false)}
        >
          <video
            ref={videoRef}
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: isVideoHovered ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white/90 rounded-full p-3 cursor-pointer"
              onClick={togglePlay}
            >
              <Play className={`h-8 w-8 ${isPlaying ? 'text-[#38000A] fill-[#38000A]' : 'text-red-600 fill-red-600'}`} />
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
            <p className="text-lg font-medium">Hello World</p>
            <div className="mt-2">
              <span className="bg-purple-500 text-white py-1 px-3 rounded-lg text-sm">Render Video</span>
            </div>
          </div>
        </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

interface ApiAccordionProps {
  title: string
  description: string
  defaultClosed?: boolean
}

function ApiAccordion({ title, description, defaultClosed = false }: ApiAccordionProps) {
  const [isOpen, setIsOpen] = useState(!defaultClosed)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 text-left bg-[#FEA996] hover:bg-[#fea996e1] transition-colors"
      >
        <h3 className="text-xl text-black font-semibold">{title}</h3>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          {isOpen ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-4 bg-[#FEA996]">
          <p className="text-black">{description}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
