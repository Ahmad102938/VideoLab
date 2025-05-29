import type * as React from "react"
import { User, Mail, FileText, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"

interface PromptCardProps {
  title: string
  icon: string
  className?: string
}

export function PromptCard({ title, icon, className }: PromptCardProps) {
  const getIcon = (): React.ReactNode => {
    switch (icon) {
      case "user":
        return <User className="h-5 w-5" />
      case "mail":
        return <Mail className="h-5 w-5" />
      case "file-text":
        return <FileText className="h-5 w-5" />
      case "cpu":
        return <Cpu className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <button
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border p-6 text-center transition-colors hover:bg-muted/50",
        className,
      )}
    >
      <div className="mb-3 rounded-full bg-muted p-2">{getIcon()}</div>
      <p className="text-sm">{title}</p>
    </button>
  )
}
