"use client"

import { useState } from "react"
import { Calendar, ChevronLeft, ChevronRight, Clock, CalendarIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Generate sample calendar data
const generateCalendarData = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  const calendarDays = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ day: null, items: 0, date: null })
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6

    // Generate random number of items, with more on weekdays
    const items = isWeekend ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 15) + 5

    calendarDays.push({
      day,
      items,
      date,
    })
  }

  return calendarDays
}

export function AdvancedCalendarView() {
  const [calendarData] = useState(generateCalendarData())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState("month")
  const [holidayMode, setHolidayMode] = useState(false)
  const [showDateDialog, setShowDateDialog] = useState(false)

  const today = new Date()
  const currentMonth = today.toLocaleString("default", { month: "long" })
  const currentYear = today.getFullYear()

  const getItemsColor = (items: number) => {
    if (items === 0) return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
    if (items < 5) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    if (items < 10) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  }

  const handleDateClick = (date: Date | null) => {
    if (!date) return
    setSelectedDate(date)
    setShowDateDialog(true)
  }

  // Generate sample items for the selected date
  const getItemsForDate = (date: Date | null) => {
    if (!date) return []

    const sampleItems = [
      {
        title: "JavaScript Closures",
        subject: "JavaScript",
        reviewStage: "daily",
      },
      {
        title: "React Hooks",
        subject: "React",
        reviewStage: "weekly",
      },
      {
        title: "CSS Grid Layout",
        subject: "CSS",
        reviewStage: "monthly",
      },
      {
        title: "Node.js Event Loop",
        subject: "Node.js",
        reviewStage: "daily",
      },
      {
        title: "Database Indexing",
        subject: "Database",
        reviewStage: "weekly",
      },
    ]

    // Return 3-5 random items
    const count = Math.floor(Math.random() * 3) + 3
    return sampleItems.slice(0, count)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Review Calendar</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="View mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month View</SelectItem>
                  <SelectItem value="week">Week View</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <CardDescription className="flex items-center justify-between">
            <span>
              {currentMonth} {currentYear}
            </span>
            <div className="flex items-center space-x-2">
              <Switch checked={holidayMode} onCheckedChange={setHolidayMode} id="holiday-mode" />
              <Label htmlFor="holiday-mode">Holiday Mode</Label>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Weekday Headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-2 text-center font-medium text-sm">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarData.map((day, index) => (
              <div
                key={index}
                className={`p-2 min-h-[80px] border rounded-md cursor-pointer ${
                  day.day === today.getDate() ? "border-primary" : "border-muted"
                } ${holidayMode && day.day ? "bg-muted/50" : ""}`}
                onClick={() => day.date && handleDateClick(day.date)}
              >
                {day.day && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className={day.day === today.getDate() ? "font-bold text-primary" : ""}>{day.day}</span>
                      {day.items > 0 && !holidayMode && (
                        <Badge variant="outline" className={getItemsColor(day.items)}>
                          {day.items}
                        </Badge>
                      )}
                    </div>
                    {day.items > 0 && !holidayMode && (
                      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${Math.min(Math.random() * 100, 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end space-x-4 mt-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-muted-foreground">Light (1-4)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-muted-foreground">Medium (5-9)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-muted-foreground">Heavy (10+)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Dialog */}
      <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>
                {selectedDate?.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </DialogTitle>
            <DialogDescription>
              {holidayMode ? "Holiday mode is active. No reviews scheduled." : "Reviews scheduled for this day"}
            </DialogDescription>
          </DialogHeader>

          {!holidayMode && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Reviews</span>
                <Badge>{getItemsForDate(selectedDate).length} items</Badge>
              </div>

              <div className="space-y-2">
                {getItemsForDate(selectedDate).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.subject}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {item.reviewStage}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Estimated time: 15 minutes</span>
                </div>
                <Button size="sm">Start Review</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
