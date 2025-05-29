"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth, UserButton } from "@clerk/nextjs"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { isSignedIn, isLoaded } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "VideoLLM", href: "#products" },
    {name: "AudioLLM", href: "#audio"},
    { name: "Discover", href: "#solutions" },
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-[#380009] backdrop-blur-md shadow-sm" : "bg-[#FEA996]"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-[#CD1B17] font-bold text-xl md:text-2xl">VideoLab</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${isScrolled ? "hover:bg-gray-100" : "hover:bg-gray-200"} ${
                  pathname === item.href ? "text-blue-600" : "text-black hover:text-gray-700"
                } ${isScrolled ? "text-white hover:text-[#CD1B17]" : "text-black hover:text-gray-900"}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {isLoaded && isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <>
                <Link href="/sign-in">
                  <Button className={`${!isScrolled ? "bg-[#380009] hover:bg-transparent hover:text-black" : "hover:bg-[#F0F6FE] hover:text-black"} hover:cursor-pointer`} variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="bg-[#CD1B17] hover:bg-[#380009] text-white hover:cursor-pointer">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            {isLoaded && isSignedIn && <UserButton afterSignOutUrl="/" className="mr-2" />}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-md text-gray-700 bg-transparent ${isScrolled && "text-white"}`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-[#f89883] shadow-2xl border-none"
        >
          <div className="container mx-auto px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 text-base font-medium rounded-md hover:bg-gray-300 ${
                  pathname === item.href ? "text-blue-600" : "text-gray-700"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {isLoaded && !isSignedIn && (
              <div className="pt-4 flex flex-col space-y-3">
                <Link href="/sign-in" className="w-full">
                  <Button variant="outline" className="w-full justify-center">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up" className="w-full">
                  <Button className="w-full justify-center bg-blue-600 hover:bg-blue-700">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
