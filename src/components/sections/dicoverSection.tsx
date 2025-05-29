"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { ChevronUp } from "lucide-react"
import Image from "next/image"
import img1 from "../../assets/img6.svg"

export default function DiscoverSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [activeTab, setActiveTab] = useState("marketing")

  const tabs = [
    { id: "marketing", label: "Marketing Campaigns" },
    { id: "onboarding", label: "Customer Onboarding" },
    { id: "support", label: "Customer Support" },
  ]

  return (
    <section ref={ref} id="solutions" className="w-full py-16 md:py-20 bg-[#FFA896]">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-[#38000A] font-bold tracking-tighter mb-4">
            Discover the Power of VideoLab AI
          </h2>
          <p className="text-black md:text-lg max-w-[800px] mx-auto">
            Transform your business with AI-generated avatar videos. Whether for marketing, customer support, or onboarding,
            our solutions help you engage your audience like never before. Explore how VideoLab AI can revolutionize your
            content strategy and drive results.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-[#9B1313] text-white" : "bg-gray-100 text-black hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="bg-[#fad1c8] rounded-3xl p-6 relative overflow-hidden"
          >
            <div className="relative aspect-square md:aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
              <Image
                src={img1}
                alt="Avatar Video Example"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Social media icons */}
              <motion.div
                initial={{ x: -50, rotate: -15 }}
                animate={isInView ? { x: 0, rotate: -15 } : {}}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -left-8 top-1/4 transform -translate-y-1/2"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
                  </svg>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 50, rotate: 10 }}
                animate={isInView ? { x: 0, rotate: 10 } : {}}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute right-0 top-1/3 transform -translate-y-1/2"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"></path>
                  </svg>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 50, rotate: -5 }}
                animate={isInView ? { y: 0, rotate: -5 } : {}}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="absolute right-10 bottom-10 transform"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="w-16 h-16 bg-blue-400 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                  </svg>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="space-y-6">
              <div className={`${activeTab === "marketing" ? "block" : "hidden"}`}>
                <h4 className="text-xl text-black font-semibold mb-4">Marketing Campaigns</h4>
                <p className="text-gray-800 mb-6">
                  Create viral videos for TikTok, Instagram, and YouTube Shorts that deliver results and amplify your
                  reach on social media. Engage your audience with personalized content that resonates with them.
                </p>
              </div>

              <div className={`${activeTab === "onboarding" ? "block" : "hidden"}`}>
                <h4 className="text-xl text-black font-semibold mb-4">Customer Onboarding</h4>
                <p className="text-gray-800 mb-6">
                  Welcome new customers with personalized avatar videos that guide them through your product or service.
                  Increase engagement and reduce support tickets with clear, visual instructions.
                </p>
              </div>

              <div className={`${activeTab === "support" ? "block" : "hidden"}`}>
                <h4 className="text-xl text-black font-semibold mb-4">Customer Support</h4>
                <p className="text-gray-800 mb-6">
                  Provide instant, personalized video responses to customer inquiries. Solve problems faster and create
                  memorable support experiences that build loyalty and trust.
                </p>
              </div>

              <motion.button
                whileHover={{ y: -3 }}
                whileTap={{ y: 0 }}
                className="flex items-center text-[#CD1c18] hover:text-[#38000A] transition-colors group"
              >
                <span className="text-sm font-medium mr-2">Learn more</span>
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                >
                  <ChevronUp className="h-5 w-5 group-hover:text-[#38000A]" />
                </motion.div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
