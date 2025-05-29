import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import AIEmailHero from "@/components/sections/dashboard-podcast"

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  return (
    <>
      <Navbar />
      <AIEmailHero/>
      <Footer />
    </>
  )
}
