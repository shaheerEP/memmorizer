"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  BookOpen,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  LineChart,
  AreaChart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CalendarHeatmap } from "@/components/calendar-heatmap"
import { AnalyticsLineChart } from "@/components/analytics-line-chart"
import { AnalyticsBarChart } from "@/components/analytics-bar-chart"
import { AnalyticsPieChart } from "@/components/analytics-pie-chart"
import { AnalyticsAreaChart } from "@/components/analytics-area-chart"
import { PerformanceTable } from "@/components/performance-table"
import { AchievementBadges } from "@/components/achievement-badges"
import { AdvancedCalendarView } from "@/components/advanced-calendar-view"
import { StatisticsDeepDive } from "@/components/statistics-deep-dive"

// Sample data for analytics
const analyticsData = {
  totalItems: 1247,
  currentStreak: 47,
  itemsDueToday: 24,
  successRate: 92,
  reviewActivity: Array.from({ length: 365 }, (_, i) => ({
    date: new Date(Date.now() - (364 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    count: Math.floor(Math.random() * 20),
  })),
  learningProgress: Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2023, i, 1).toLocaleString("default", { month: "short" }),
    items: Math.floor(Math.random() * 50) + 20,
  })),
  completionRates: [
    { subject: "JavaScript", completed: 85, total: 100 },
    { subject: "React", completed: 72, total: 80 },
    { subject: "CSS", completed: 45, total: 50 },
    { subject: "Node.js", completed: 38, total: 40 },
    { subject: "Database", completed: 28, total: 30 },
    { subject: "Algorithms", completed: 18, total: 20 },
  ],
  reviewStages: [
    { stage: "Daily", count: 42 },
    { stage: "Weekly", count: 78 },
    { stage: "Monthly", count: 124 },
    { stage: "Yearly", count: 56 },
  ],
  workloadForecast: Array.from({ length: 30 }, (_, i) => ({
    day: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    items: Math.floor(Math.random() * 15) + 5,
  })),
  subjectStats: [
    {
      subject: "JavaScript",
      totalItems: 100,
      completionRate: 85,
      avgDifficulty: "Medium",
      avgTime: "2.5 min",
      retentionRate: 92,
    },
    {
      subject: "React",
      totalItems: 80,
      completionRate: 90,
      avgDifficulty: "Hard",
      avgTime: "3.2 min",
      retentionRate: 88,
    },
    {
      subject: "CSS",
      totalItems: 50,
      completionRate: 90,
      avgDifficulty: "Easy",
      avgTime: "1.8 min",
      retentionRate: 95,
    },
    {
      subject: "Node.js",
      totalItems: 40,
      completionRate: 95,
      avgDifficulty: "Medium",
      avgTime: "2.7 min",
      retentionRate: 90,
    },
    {
      subject: "Database",
      totalItems: 30,
      completionRate: 93,
      avgDifficulty: "Hard",
      avgTime: "3.5 min",
      retentionRate: 85,
    },
    {
      subject: "Algorithms",
      totalItems: 20,
      completionRate: 90,
      avgDifficulty: "Hard",
      avgTime: "4.2 min",
      retentionRate: 82,
    },
  ],
  achievements: [
    { name: "7-Day Streak", icon: "Zap", earned: true, date: "2023-12-15" },
    { name: "30-Day Streak", icon: "Zap", earned: true, date: "2024-01-07" },
    { name: "100 Items Learned", icon: "BookOpen", earned: true, date: "2023-11-20" },
    { name: "500 Items Learned", icon: "BookOpen", earned: true, date: "2023-12-28" },
    { name: "1000 Items Learned", icon: "BookOpen", earned: true, date: "2024-01-10" },
    { name: "Perfect Week", icon: "Target", earned: true, date: "2024-01-07" },
    { name: "90-Day Streak", icon: "Zap", earned: false },
    { name: "5000 Items Learned", icon: "BookOpen", earned: false },
  ],
  timeOfDayPerformance: [
    { time: "Morning", successRate: 94 },
    { time: "Afternoon", successRate: 88 },
    { time: "Evening", successRate: 82 },
    { time: "Night", successRate: 76 },
  ],
  difficultyAnalysis: [
    { subject: "JavaScript", hardRate: 25 },
    { subject: "React", hardRate: 35 },
    { subject: "CSS", hardRate: 15 },
    { subject: "Node.js", hardRate: 28 },
    { subject: "Database", hardRate: 32 },
    { subject: "Algorithms", hardRate: 45 },
  ],
  reviewTimeAnalytics: [
    { subject: "JavaScript", avgTime: 2.5 },
    { subject: "React", avgTime: 3.2 },
    { subject: "CSS", avgTime: 1.8 },
    { subject: "Node.js", avgTime: 2.7 },
    { subject: "Database", avgTime: 3.5 },
    { subject: "Algorithms", avgTime: 4.2 },
  ],
}

// At the top of the component, add data validation:
const validateAnalyticsData = (data: any) => {
  return {
    ...data,
    reviewActivity: data.reviewActivity || [],
    learningProgress: data.learningProgress || [],
    completionRates: data.completionRates || [],
    reviewStages: data.reviewStages || [],
    workloadForecast: data.workloadForecast || [],
    subjectStats: data.subjectStats || [],
    achievements: data.achievements || [],
    timeOfDayPerformance: data.timeOfDayPerformance || [],
    difficultyAnalysis: data.difficultyAnalysis || [],
    reviewTimeAnalytics: data.reviewTimeAnalytics || [],
  }
}

// Use the validated data:
const validatedData = validateAnalyticsData(analyticsData)

export default function AnalyticsPage() {
  const { theme } = useTheme()
  const [timeRange, setTimeRange] = useState("30d")
  const [activeTab, setActiveTab] = useState("overview")

  const handleExportData = () => {
    const dataStr = JSON.stringify(validatedData, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `studyflow-analytics-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track your learning progress and performance</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 md:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
                        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Items</p>
                        <p className="text-2xl font-bold">{validatedData.totalItems}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                      <span className="text-green-500">+12%</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-green-100 rounded-full dark:bg-green-900">
                        <Zap className="h-5 w-5 text-green-600 dark:text-green-300" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Current Streak</p>
                        <p className="text-2xl font-bold">{validatedData.currentStreak} days</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                      <span className="text-green-500">+5 days</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-yellow-100 rounded-full dark:bg-yellow-900">
                        <Calendar className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Due Today</p>
                        <p className="text-2xl font-bold">{validatedData.itemsDueToday} items</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex items-center">
                      <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
                      <span className="text-red-500">-3 items</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-purple-100 rounded-full dark:bg-purple-900">
                        <Target className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <p className="text-2xl font-bold">{validatedData.successRate}%</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                      <span className="text-green-500">+2%</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Calendar Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Review Activity</span>
                </CardTitle>
                <CardDescription>Daily review activity over the past year</CardDescription>
              </CardHeader>
              <CardContent>
                <CalendarHeatmap data={validatedData.reviewActivity} />
              </CardContent>
            </Card>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <LineChart className="h-5 w-5" />
                    <span>Learning Progress</span>
                  </CardTitle>
                  <CardDescription>Items added per month</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <AnalyticsLineChart data={validatedData.learningProgress} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Completion Rates</span>
                  </CardTitle>
                  <CardDescription>Review completion by subject</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <AnalyticsBarChart data={validatedData.completionRates} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>Review Stages</span>
                  </CardTitle>
                  <CardDescription>Distribution of items across review stages</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <AnalyticsPieChart data={validatedData.reviewStages} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AreaChart className="h-5 w-5" />
                    <span>Workload Forecast</span>
                  </CardTitle>
                  <CardDescription>Items due in the next 30 days</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <AnalyticsAreaChart data={validatedData.workloadForecast} />
                </CardContent>
              </Card>
            </div>

            {/* Statistics Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Subject Performance</span>
                </CardTitle>
                <CardDescription>Detailed breakdown by subject</CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceTable data={validatedData.subjectStats} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <AdvancedCalendarView />
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics">
            <StatisticsDeepDive
              timeOfDayData={validatedData.timeOfDayPerformance}
              difficultyData={validatedData.difficultyAnalysis}
              reviewTimeData={validatedData.reviewTimeAnalytics}
              subjectData={validatedData.subjectStats}
            />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <AchievementBadges achievements={validatedData.achievements} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
