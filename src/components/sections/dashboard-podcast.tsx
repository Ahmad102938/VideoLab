"use client";
import { Button } from "@/components/ui/button"
import Image from "next/image"
import dash from "../../assets/dash.svg"

export default function AIEmailHero() {
  return (
    <section className="bg-[#FFA896] py-12 lg:py-10">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="space-y-6 lg:space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#38000A] leading-tight">
              Generate a multi-host AI PodCast using by VideoLab
            </h1>

            <p className="text-black text-lg lg:text-xl leading-relaxed max-w-lg">
                Create engaging podcasts with AI that can host conversations, interviews, and discussions. 
                VideoLab allows to generate audio podcasts,
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={() => window.location.href = "/dashboard/podcast"}
                className="bg-[#CD1C18] hover:bg-[#cd1b18d3] text-white px-8 py-6 text-lg rounded-full font-medium"
                size="lg"
              >
                Generate
              </Button>
              <Button
                variant="outline"
                className="bg-black hover:bg-transparent hover:text-black text-white border-black px-8 py-6 text-lg rounded-full font-medium"
                size="lg"
              >
                View Demo
              </Button>
            </div>
          </div>

          <div className="relative flex justify-center items-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl">
              <Image
              width={600}
                height={400}
                src={dash}
                alt="Two people having a conversation at a table with microphones"
                className="w-full h-auto object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
