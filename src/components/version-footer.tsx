import { APP_VERSION } from "@/configs/version"

export function VersionFooter() {
  return (
    <div className="fixed bottom-4 right-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded border">
      {APP_VERSION}
    </div>
  )
}
