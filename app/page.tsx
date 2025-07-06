"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  Plus,
  BarChart3,
  Settings,
  Target,
  TrendingUp,
  BookOpen,
  PlayCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Header from "./Header"

export default function StudyFlowDashboard() {
  // Set auth status on component mount (simulate successful login)
  useEffect(() => {
    localStorage.setItem("studyflow_auth", "true")
  }, [])

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const reviewSections = [
    {
      id: "new",
      title: "New Reviews",
      description: "Items in days 2-4 of daily review cycle",
      count: 12,
      completed: 8,
      total: 12,
      theme: "blue",
      borderColor: "border-l-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      buttonColor: "bg-blue-500 hover:bg-blue-600",
      items: ["JavaScript closures and scope", "React useEffect dependencies", "CSS Grid vs Flexbox"],
    },
    {
      id: "weekly",
      title: "Weekly Reviews",
      description: "Items due for weekly review cycle",
      count: 8,
      completed: 3,
      total: 8,
      theme: "yellow",
      borderColor: "border-l-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
      buttonColor: "bg-yellow-500 hover:bg-yellow-600",
      items: ["Database normalization principles", "HTTP status codes", "Git branching strategies"],
    },
    {
      id: "monthly",
      title: "Monthly Reviews",
      description: "Items due for monthly review cycle",
      count: 15,
      completed: 12,
      total: 15,
      theme: "orange",
      borderColor: "border-l-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      buttonColor: "bg-orange-500 hover:bg-orange-600",
      items: ["System design patterns", "Algorithm complexity analysis", "Network protocols overview"],
    },
    {
      id: "yearly",
      title: "Yearly Reviews",
      description: "Items due for yearly review cycle",
      count: 6,
      completed: 6,
      total: 6,
      theme: "green",
      borderColor: "border-l-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      buttonColor: "bg-green-500 hover:bg-green-600",
      items: ["Software architecture principles", "Project management methodologies", "Leadership and team dynamics"],
    },
  ]

  const recentActivities = [
    { action: "Completed", item: "React Hooks", time: "2 minutes ago", type: "success" },
    { action: "Added", item: "TypeScript Generics", time: "1 hour ago", type: "info" },
    { action: "Reviewed", item: "CSS Animations", time: "3 hours ago", type: "success" },
    { action: "Skipped", item: "Node.js Streams", time: "5 hours ago", type: "warning" },
    { action: "Completed", item: "Database Indexing", time: "1 day ago", type: "success" },
  ]

  const quickStats = [
    { label: "Day Streak", value: "47", icon: Target, color: "text-orange-500" },
    { label: "Items Learned", value: "1,247", icon: BookOpen, color: "text-blue-500" },
    { label: "Completion Rate", value: "94%", icon: TrendingUp, color: "text-green-500" },
  ]

  const quickActions = [
    { label: "Add New Content", icon: Plus, href: "/add-content" },
    { label: "Complete Review", icon: BookOpen, href: "/complete-review" },
    { label: "View Analytics", icon: BarChart3, href: "/analytics" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ]

  const totalReviews = reviewSections.reduce((sum, section) => sum + section.count, 0)
  const totalCompleted = reviewSections.reduce((sum, section) => sum + section.completed, 0)
  const overallProgress = totalReviews > 0 ? (totalCompleted / totalReviews) * 100 : 0

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Today's Overview */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Good morning! 👋</h2>
              <p className="text-muted-foreground flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {today}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="text-right">
                <p className="text-2xl font-bold">{totalReviews}</p>
                <p className="text-sm text-muted-foreground">Total Reviews Today</p>
              </div>
            </div>
          </div>

          {/* Overall Progress */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Today's Progress</span>
                <span className="text-sm text-muted-foreground">
                  {totalCompleted}/{totalReviews} completed
                </span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickStats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Complete Review Section */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Ready for Today's Review?</h3>
                    <p className="text-muted-foreground">{totalReviews} items are scheduled for review today</p>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => (window.location.href = "/complete-review")}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    Complete Review
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Review Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviewSections.map((section) => (
                <Card key={section.id} className={`${section.borderColor} border-l-4 ${section.bgColor}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <Badge variant="secondary">{section.count}</Badge>
                    </div>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Preview Items */}
                    <div className="space-y-2">
                      {section.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="text-sm p-2 bg-background rounded border">
                          {item}
                        </div>
                      ))}
                      {section.items.length > 2 && (
                        <p className="text-xs text-muted-foreground">+{section.items.length - 2} more items</p>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>
                          {section.completed}/{section.total}
                        </span>
                      </div>
                      <Progress
                        value={section.total > 0 ? (section.completed / section.total) * 100 : 0}
                        className="h-2"
                      />
                    </div>

                    {/* Start Button */}
                    <Button
                      className={`w-full ${section.buttonColor} text-white`}
                      disabled={section.completed === section.total}
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      {section.completed === section.total ? "Completed" : "Start Review"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === "success"
                          ? "bg-green-500"
                          : activity.type === "info"
                            ? "bg-blue-500"
                            : "bg-yellow-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.action}</span>{" "}
                        <span className="text-muted-foreground">{activity.item}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => (window.location.href = action.href)}
                  >
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <Button size="lg" className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg">
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  )
}