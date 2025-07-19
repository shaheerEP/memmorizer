"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Brain, TrendingUp, BarChart3 } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface StatisticsDeepDiveProps {
  timeOfDayData: {
    time: string
    successRate: number
  }[]
  difficultyData: {
    subject: string
    hardRate: number
  }[]
  reviewTimeData: {
    subject: string
    avgTime: number
  }[]
  subjectData: {
    subject: string
    totalItems: number
    completionRate: number
    avgDifficulty: string
    avgTime: string
    retentionRate: number
  }[]
}

export function StatisticsDeepDive({
  timeOfDayData,
  difficultyData,
  reviewTimeData,
  subjectData,
}: StatisticsDeepDiveProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Performance by Time of Day</span>
          </CardTitle>
          <CardDescription>Success rates for reviews completed at different times of day</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ChartContainer
            config={{
              successRate: {
                label: "Success Rate",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeOfDayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="successRate" fill="var(--color-successRate)">
                  {timeOfDayData.map((entry, index) => {
                    let color = "#22c55e" // green
                    if (entry.successRate < 85) color = "#eab308" // yellow
                    if (entry.successRate < 80) color = "#ef4444" // red

                    return <Cell key={`cell-${index}`} fill={color} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Difficulty Analysis</span>
            </CardTitle>
            <CardDescription>Percentage of items marked as "Hard" by subject</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer
              config={{
                hardRate: {
                  label: "Hard Rate",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={difficultyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="hardRate" fill="var(--color-hardRate)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Review Time Analytics</span>
            </CardTitle>
            <CardDescription>Average time spent reviewing items by subject (minutes)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer
              config={{
                avgTime: {
                  label: "Average Time (min)",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reviewTimeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="avgTime" fill="var(--color-avgTime)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Subject Performance Comparison</span>
          </CardTitle>
          <CardDescription>Detailed comparison of performance metrics across subjects</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="completion">
            <TabsList className="grid grid-cols-3 w-[400px] mb-4">
              <TabsTrigger value="completion">Completion Rate</TabsTrigger>
              <TabsTrigger value="retention">Retention Rate</TabsTrigger>
              <TabsTrigger value="difficulty">Difficulty</TabsTrigger>
            </TabsList>

            <TabsContent value="completion">
              <div className="space-y-4">
                {subjectData
                  .sort((a, b) => b.completionRate - a.completionRate)
                  .map((subject, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{subject.subject}</span>
                        <span className="text-sm">{subject.completionRate}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${subject.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="retention">
              <div className="space-y-4">
                {subjectData
                  .sort((a, b) => b.retentionRate - a.retentionRate)
                  .map((subject, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{subject.subject}</span>
                        <span className="text-sm">{subject.retentionRate}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${subject.retentionRate}%`,
                            backgroundColor:
                              subject.retentionRate >= 90
                                ? "#22c55e"
                                : subject.retentionRate >= 80
                                  ? "#eab308"
                                  : "#ef4444",
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="difficulty">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {subjectData.map((subject, index) => {
                  const getDifficultyColor = (difficulty: string) => {
                    if (!difficulty) return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"

                    switch (difficulty.toLowerCase()) {
                      case "easy":
                        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      case "medium":
                        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      case "hard":
                        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      default:
                        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                    }
                  }

                  return (
                    <div
                      key={index}
                      className="p-4 border rounded-lg flex flex-col items-center justify-center space-y-2"
                    >
                      <span className="font-medium">{subject.subject}</span>
                      <Badge variant="outline" className={getDifficultyColor(subject.avgDifficulty)}>
                        {subject.avgDifficulty}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Avg. Time: {subject.avgTime}</span>
                    </div>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
