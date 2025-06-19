"use client"

import { Button } from "@/components/ui/button"
import { motion, useAnimation } from "framer-motion"
import Image from "next/image"
import { useEffect } from "react"
import { useInView } from "framer-motion"
import { useRef } from "react"
import img1 from "../../assets/mic.webp"
import img2 from "../../assets/img6.svg"
import img3 from "../../assets/videopdcst.png"
import img4 from "../../assets/img7.png"
import img5 from "../../assets/vibe.jpg"
export default function HeroSection() {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])

  return (
    <section
      ref={ref}
      className="w-full mt-0 py-12 md:py-16 lg:py-10 overflow-hidden bg-[#FEA996]"
    >
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text--500 font-medium text-xl text-[#000] tracking-tight mb-2"
            >
              Video Lab
            </motion.span>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#380009] tracking-tighter"
            >
              Transform Ideas into Stunning AI Avatar Videos in Minutes
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-black md:text-lg max-w-[600px]"
            >
              No filming. No editing. JoggAI simplifies it all.
Perfect for social media content, video ads, and more
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-4"
            >
              <Button
                size="lg"
                onClick={() => window.location.href = "/sign-up"}
                className="bg-[#CD1B17] hover:bg-[#380009] text-white rounded-full px-8 transform transition-transform hover:scale-105 active:scale-95"
              >
                Get Started
              </Button>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative h-[300px] sm:h-[400px] lg:h-[500px]"
          >
            <CardStack />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function CardStack() {
  return (
    <div className="relative w-full h-full">
      <motion.div
        initial={{ x: 100, y: 0, opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-30 w-[220px] sm:w-[280px] h-[150px] sm:h-[180px] bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl">
          <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">PodCast</div>
          <Image
            src={img1}
            alt="API Card"
            className="absolute inset-0 w-full h-full object-cover opacity-100"
            layout="fill"
            objectFit="cover"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ x: 80, y: -40, opacity: 0 }}
        animate={{ x: 20, y: -60, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.7 }}
        whileHover={{ y: -65, transition: { duration: 0.2 } }}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 w-[220px] sm:w-[280px] h-[150px] sm:h-[180px] bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-xl">
          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">VIDEO</div>
          <Image
            src={img2}
            alt="Video Card"
            className="absolute inset-0 w-full h-full object-cover opacity-100"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ x: 60, y: 40, opacity: 0 }}
        animate={{ x: 40, y: 60, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.7 }}
        whileHover={{ y: 65, transition: { duration: 0.2 } }}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-[220px] sm:w-[280px] h-[150px] sm:h-[180px] bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-green-50 rounded-xl">
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">AI</div>
          <Image
            src={img3}
            alt="AI Card"
            className="absolute inset-0 w-full h-full object-cover opacity-100"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.7 }}
        whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
        className="absolute left-0 bottom-0 z-40 w-[100px] sm:w-[120px] h-[100px] sm:h-[120px] bg-white rounded-full shadow-lg overflow-hidden"
      >
        <Image
          src={img5}
          alt="Avatar 1"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </motion.div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.7 }}
        whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
        className="absolute right-20 bottom-10 z-40 w-[120px] sm:w-[140px] h-[120px] sm:h-[140px] bg-white rounded-full shadow-lg overflow-hidden"
      >
        <Image
          src={img4}
          alt="Avatar 2"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </motion.div>
    </div>
  )
}
