"use client"

import * as React from "react"
import { PlusCircle, RefreshCw, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatSidebar } from "@/components/interface/chat-sidebar"
import { PromptCard } from "@/components/interface/prompt-card"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

const promptSuggestions = [
  {
    title: "Write a to-do list for a personal project or task",
    icon: "user",
  },
  {
    title: "Generate an email to reply to a job offer",
    icon: "mail",
  },
  {
    title: "Summarize this article or text for me in one paragraph",
    icon: "file-text",
  },
  {
    title: "How does AI work in a technical capacity",
    icon: "cpu",
  },
]

export default function ChatInterface() {
  const [input, setInput] = React.useState("")
  const [userName, setUserName] = React.useState("John")
  const [characterCount, setCharacterCount] = React.useState(0)
  const maxCharacters = 1000

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)
    setCharacterCount(value.length)
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <ChatSidebar />
        <SidebarInset className="flex-1">
          <div className="flex h-full flex-col">
            {/* Header with sidebar toggle */}
            <header className="flex h-14 items-center border-b px-4">
              <SidebarTrigger className="h-8 w-8" />
              <div className="ml-4 font-semibold">ChatGPT</div>
            </header>

            <main className="flex-1 overflow-auto p-6">
              <div className="mx-auto max-w-3xl space-y-8 pt-8">
                <div className="space-y-2 text-center">
                  <h1 className="text-4xl font-bold tracking-tight">
                    Hi there, <span className="text-purple-500">{userName}</span>
                  </h1>
                  <h2 className="text-3xl font-semibold tracking-tight text-purple-500">What would like to know?</h2>
                  <p className="text-muted-foreground">
                    Use one of the most common prompts below or use your own to begin
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {promptSuggestions.map((prompt, index) => (
                    <PromptCard key={index} title={prompt.title} icon={prompt.icon} />
                  ))}
                </div>

                <div className="flex justify-center">
                  <Button variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh Prompts
                  </Button>
                </div>
              </div>
            </main>

            <div className="border-t p-4">
              <div className="mx-auto max-w-3xl">
                <div className="relative rounded-lg border bg-background p-2 shadow-sm">
                  <Input
                    className="border-0 bg-transparent px-2 py-6 shadow-none focus-visible:ring-0"
                    placeholder="Ask whatever you want..."
                    value={input}
                    onChange={handleInputChange}
                  />
                  <div className="absolute bottom-2 left-2 flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <span className="sr-only">Add attachment</span>
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {characterCount}/{maxCharacters}
                    </span>
                    <Button size="sm" className="h-8 w-8 rounded-full p-0">
                      <span className="sr-only">Send</span>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
