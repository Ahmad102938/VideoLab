import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFA896] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#38000A]">Sign in to VideoLab</h1>
          <p className="mt-2 text-sm text-black">Access your account to manage your Content</p>
        </div>
        <div className="mt-8">
          <SignIn
          
            appearance={{
              elements: {
                card: "shadow-lg rounded-lg p-6",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                footerActionLink: "text-blue-600 hover:text-blue-800",
              },
            }}
            redirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  )
}
