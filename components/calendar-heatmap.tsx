"use client"

import { useTheme } from "next-themes"
import { useEffect, useRef } from "react"

interface CalendarHeatmapProps {
  data: {
    date: string
    count: number
  }[]
}

export function CalendarHeatmap({ data }: CalendarHeatmapProps) {
  const { theme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !data) return

    const renderHeatmap = async () => {
      try {
        // Fallback to a simple visualization if the library fails to load
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="grid grid-cols-12 gap-1 p-4">
              ${data
                .slice(0, 365)
                .map((item, index) => {
                  const intensity = Math.min(Math.floor((item?.count || 0) / 4), 4)
                  const opacity = intensity * 0.2 + 0.1
                  return `<div class="w-3 h-3 rounded-sm bg-primary" style="opacity: ${opacity}" title="${item?.date || ""}: ${item?.count || 0} reviews"></div>`
                })
                .join("")}
            </div>
            <div class="text-center text-sm text-muted-foreground mt-2">
              Review activity heatmap (${data.length} days)
            </div>
          `
        }
      } catch (error) {
        console.error("Failed to load calendar heatmap:", error)
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="flex items-center justify-center h-32 text-muted-foreground">
              Calendar heatmap visualization would appear here
            </div>
          `
        }
      }
    }

    renderHeatmap()
  }, [data, theme])

  return (
    <div className="w-full overflow-x-auto">
      <div ref={containerRef} className="min-h-[200px] w-full">
        <div className="flex items-center justify-center h-32 text-muted-foreground">Loading calendar heatmap...</div>
      </div>
    </div>
  )
}
