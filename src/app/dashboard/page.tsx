import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-16">
        <div className="container px-4 md:px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.firstName || "User"}</h1>
              <p className="text-gray-600 mt-1">Manage your JoggAI API integrations and settings</p>
            </div>
            <Button className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700">Create New Project</Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">API Usage</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Avatar Video API</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>URL to Video API</span>
                    <span className="font-medium">40%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "40%" }}></div>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-6">
                View Details
              </Button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
              <ul className="space-y-3">
                <li className="flex justify-between items-center">
                  <span>Marketing Campaign</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Product Demo</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Customer Onboarding</span>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Draft</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full mt-6">
                View All Projects
              </Button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">API Keys</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Production Key</label>
                  <div className="flex mt-1">
                    <input
                      type="password"
                      value="••••••••••••••••"
                      readOnly
                      className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm"
                    />
                    <button className="bg-gray-100 border border-l-0 border-gray-300 rounded-r-md px-3 py-2 text-sm">
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Development Key</label>
                  <div className="flex mt-1">
                    <input
                      type="password"
                      value="••••••••••••••••"
                      readOnly
                      className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm"
                    />
                    <button className="bg-gray-100 border border-l-0 border-gray-300 rounded-r-md px-3 py-2 text-sm">
                      Copy
                    </button>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-6">
                Manage API Keys
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
