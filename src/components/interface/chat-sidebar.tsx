"use client"

import * as React from "react"
import { Plus, Search, Settings, MessageSquare, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type ChatHistory = {
  id: string
  title: string
  date: string
  isActive?: boolean
}

export function ChatSidebar() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [chatHistory, setChatHistory] = React.useState<ChatHistory[]>([
    { id: "1", title: "How to build a website", date: "2 days ago", isActive: true },
    { id: "2", title: "JavaScript best practices", date: "3 days ago" },
    { id: "3", title: "React vs Angular comparison", date: "1 week ago" },
    { id: "4", title: "CSS Grid tutorial", date: "Yesterday" },
    { id: "5", title: "TypeScript fundamentals", date: "3 days ago" },
    { id: "6", title: "Next.js deployment guide", date: "1 week ago" },
  ])

  const filteredHistory = chatHistory.filter((chat) => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: "New conversation",
      date: "Just now",
      isActive: true,
    }
    // Set all other chats to inactive
    const updatedHistory = chatHistory.map((chat) => ({ ...chat, isActive: false }))
    setChatHistory([newChat, ...updatedHistory])
  }

  const handleDeleteChat = (id: string) => {
    setChatHistory(chatHistory.filter((chat) => chat.id !== id))
  }

  const handleRenameChat = (id: string) => {
    console.log("Rename chat:", id)
  }

  const setActiveChat = (id: string) => {
    setChatHistory(
      chatHistory.map((chat) => ({
        ...chat,
        isActive: chat.id === id,
      })),
    )
  }

  const todayChats = filteredHistory.filter((chat) => chat.date === "Just now" || chat.date === "Yesterday")
  const olderChats = filteredHistory.filter((chat) => chat.date !== "Just now" && chat.date !== "Yesterday")

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-3">
        <Button onClick={handleNewChat} className="w-full justify-start gap-2 h-10" variant="outline">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <div className="px-2 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {todayChats.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">Today</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {todayChats.map((chat) => (
                  <SidebarMenuItem key={chat.id} className="group/item">
                    <SidebarMenuButton
                      className={`justify-start gap-2 h-10 px-2 ${chat.isActive ? "bg-accent" : ""}`}
                      onClick={() => setActiveChat(chat.id)}
                    >
                      <MessageSquare className="h-4 w-4 shrink-0" />
                      <div className="flex-1 truncate text-sm">{chat.title}</div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover/item:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-3 w-3" />
                            <span className="sr-only">More options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleRenameChat(chat.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteChat(chat.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {olderChats.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">
              Previous 7 Days
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {olderChats.map((chat) => (
                  <SidebarMenuItem key={chat.id} className="group/item">
                    <SidebarMenuButton
                      className={`justify-start gap-2 h-10 px-2 ${chat.isActive ? "bg-accent" : ""}`}
                      onClick={() => setActiveChat(chat.id)}
                    >
                      <MessageSquare className="h-4 w-4 shrink-0" />
                      <div className="flex-1 truncate text-sm">{chat.title}</div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover/item:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-3 w-3" />
                            <span className="sr-only">More options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleRenameChat(chat.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteChat(chat.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredHistory.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">No chats found</div>
        )}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="justify-start gap-2 h-10">
              <Settings className="h-4 w-4" />
              Settings
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
