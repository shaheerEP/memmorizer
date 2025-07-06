"use client"

import { Zap, BookOpen, Target, Award, Calendar, Brain, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Achievement {
  name: string
  icon: string
  earned: boolean
  date?: string
}

interface AchievementBadgesProps {
  achievements: Achievement[]
}

export function AchievementBadges({ achievements }: AchievementBadgesProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Zap":
        return <Zap className="h-6 w-6" />
      case "BookOpen":
        return <BookOpen className="h-6 w-6" />
      case "Target":
        return <Target className="h-6 w-6" />
      case "Award":
        return <Award className="h-6 w-6" />
      case "Calendar":
        return <Calendar className="h-6 w-6" />
      case "Brain":
        return <Brain className="h-6 w-6" />
      case "TrendingUp":
        return <TrendingUp className="h-6 w-6" />
      case "Clock":
        return <Clock className="h-6 w-6" />
      default:
        return <Award className="h-6 w-6" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Achievements</span>
          </CardTitle>
          <CardDescription>Track your learning milestones and accomplishments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                  achievement.earned
                    ? "bg-primary/5 border-primary/20"
                    : "bg-muted/50 border-muted text-muted-foreground"
                }`}
              >
                <div
                  className={`p-3 rounded-full mb-3 ${
                    achievement.earned ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {getIcon(achievement.icon)}
                </div>
                <h3 className="text-center font-medium mb-1">{achievement.name}</h3>
                {achievement.earned ? (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    Earned {achievement.date && `on ${new Date(achievement.date).toLocaleDateString()}`}
                  </Badge>
                ) : (
                  <Badge variant="outline">Locked</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Progress Milestones</span>
          </CardTitle>
          <CardDescription>Your learning journey progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Streak Progress</span>
                <span className="text-sm text-muted-foreground">47/90 days</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "52%" }}></div>
              </div>
              <p className="text-xs text-muted-foreground">Next milestone: 90-Day Streak</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Items Learned</span>
                <span className="text-sm text-muted-foreground">1,247/5,000 items</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "25%" }}></div>
              </div>
              <p className="text-xs text-muted-foreground">Next milestone: 5,000 Items Learned</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Perfect Weeks</span>
                <span className="text-sm text-muted-foreground">3/10 weeks</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "30%" }}></div>
              </div>
              <p className="text-xs text-muted-foreground">Next milestone: 10 Perfect Weeks</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
