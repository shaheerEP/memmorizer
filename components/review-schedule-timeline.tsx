"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, TrendingUp } from "lucide-react"

interface ReviewScheduleTimelineProps {
  itemTitle?: string
  startDate?: Date
}

export function ReviewScheduleTimeline({
  itemTitle = "Sample Study Item",
  startDate = new Date(),
}: ReviewScheduleTimelineProps) {
  const schedulePhases = [
    {
      phase: "Initial Learning",
      day: 1,
      description: "First exposure to content",
      color: "bg-blue-500",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      phase: "Daily Reviews",
      day: "2-4",
      description: "Daily reinforcement period",
      color: "bg-purple-500",
      textColor: "text-purple-700",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      phase: "Weekly Transition",
      day: 11,
      description: "First weekly review",
      color: "bg-yellow-500",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    },
    {
      phase: "Weekly Reviews",
      day: "18, 25, 32",
      description: "Weekly reinforcement",
      color: "bg-orange-500",
      textColor: "text-orange-700",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
    },
    {
      phase: "Monthly Transition",
      day: 62,
      description: "First monthly review",
      color: "bg-red-500",
      textColor: "text-red-700",
      bgColor: "bg-red-50 dark:bg-red-950/20",
    },
    {
      phase: "Monthly Reviews",
      day: "92, 122, 152",
      description: "Monthly reinforcement",
      color: "bg-pink-500",
      textColor: "text-pink-700",
      bgColor: "bg-pink-50 dark:bg-pink-950/20",
    },
    {
      phase: "Yearly Transition",
      day: 517,
      description: "First yearly review",
      color: "bg-green-500",
      textColor: "text-green-700",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      phase: "Long-term Retention",
      day: "Years 2, 3, 4",
      description: "Yearly maintenance",
      color: "bg-emerald-500",
      textColor: "text-emerald-700",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    },
  ]

  const calculateDate = (dayOffset: number | string) => {
    if (typeof dayOffset === "string") return dayOffset
    const date = new Date(startDate)
    date.setDate(date.getDate() + dayOffset - 1)
    return date.toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Review Schedule Timeline</span>
        </CardTitle>
        <CardDescription>
          Spaced repetition schedule for: <span className="font-medium">{itemTitle}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schedulePhases.map((phase, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${phase.bgColor}`}
              style={{ borderLeftColor: phase.color.replace("bg-", "").replace("-500", "") }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${phase.color}`}></div>
                  <h4 className="font-semibold">{phase.phase}</h4>
                  <Badge variant="outline" className={phase.textColor}>
                    Day {phase.day}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {calculateDate(typeof phase.day === "string" ? phase.day.split(",")[0].trim() : phase.day)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground ml-6">{phase.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Timeline Summary</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium">Daily Phase</p>
              <p className="text-muted-foreground">Days 1-4</p>
            </div>
            <div>
              <p className="font-medium">Weekly Phase</p>
              <p className="text-muted-foreground">Days 11-32</p>
            </div>
            <div>
              <p className="font-medium">Monthly Phase</p>
              <p className="text-muted-foreground">Days 62-152</p>
            </div>
            <div>
              <p className="font-medium">Yearly Phase</p>
              <p className="text-muted-foreground">Day 517+</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
