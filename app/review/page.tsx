"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, SkipForward, Pause, Volume2, RotateCcw, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const reviewItems = [
  {
    id: 1,
    title: "JavaScript Closures",
    content:
      "A **closure** is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned. Closures are created every time a function is created, at function creation time.\n\n• Inner functions have access to outer function variables\n• Variables remain accessible even after outer function returns\n• Commonly used in ==module patterns== and *event handlers*",
    subject: { name: "JavaScript", color: "bg-yellow-500" },
    reviewStage: "daily",
  },
  {
    id: 2,
    title: "React useEffect Dependencies",
    content:
      "The **dependency array** in useEffect determines when the effect runs:\n\n• **Empty array []**: Effect runs once after initial render\n• **No array**: Effect runs after every render\n• **With dependencies**: Effect runs when dependencies change\n\nAlways include all values from component scope that are used inside the effect.",
    subject: { name: "React", color: "bg-blue-500" },
    reviewStage: "weekly",
  },
  {
    id: 3,
    title: "CSS Grid vs Flexbox",
    content:
      "**CSS Grid** is for ==two-dimensional== layouts, while **Flexbox** is for *one-dimensional* layouts:\n\n• Grid: Controls both rows and columns\n• Flexbox: Controls either row OR column\n• Grid: Better for complex layouts\n• Flexbox: Better for component-level layouts",
    subject: { name: "CSS", color: "bg-purple-500" },
    reviewStage: "monthly",
  },
]

export default function ReviewPage() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showPauseDialog, setShowPauseDialog] = useState(false)
  const [completedItems, setCompletedItems] = useState<number[]>([])
  const [sessionProgress, setSessionProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const currentItem = reviewItems[currentIndex]
  const totalItems = reviewItems.length
  const progress = ((currentIndex + 1) / totalItems) * 100

  useEffect(() => {
    setSessionProgress(progress)
  }, [progress])

  const renderContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/==(.*?)==/g, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>')
      .replace(/^• (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul class="list-disc space-y-1">$1</ul>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^(.+)$/, '<p class="mb-4">$1</p>')
  }

  const handleAssessment = (difficulty: "again" | "hard" | "good" | "easy") => {
    setCompletedItems([...completedItems, currentItem.id])
    
    if (currentIndex < totalItems - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // Review session complete
      router.push("/dashboard")
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < totalItems - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleSkip = () => {
    if (currentIndex < totalItems - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleTextToSpeech = () => {
    setIsPlaying(!isPlaying)
    // Simulate text-to-speech
    if (!isPlaying) {
      setTimeout(() => setIsPlaying(false), 3000)
    }
  }

  const handlePauseReview = () => {
    setShowPauseDialog(false)
    router.push("/dashboard")
  }

  const getAssessmentColor = (type: string) => {
    switch (type) {
      case "again": return "bg-red-500 hover:bg-red-600"
      case "hard": return "bg-orange-500 hover:bg-orange-600"
      case "good": return "bg-blue-500 hover:bg-blue-600"
      case "easy": return "bg-green-500 hover:bg-green-600"
      default: return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => setShowPauseDialog(true)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Review Session</h1>
              <p className="text-muted-foreground">
                Item {currentIndex + 1} of {totalItems}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => setShowPauseDialog(true)}>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span>Session Progress</span>
            <span>{Math.round(sessionProgress)}% Complete</span>
          </div>
          <Progress value={sessionProgress} className="h-2" />
        </div>

        {/* Content Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CardTitle className="text-xl">{currentItem.title}</CardTitle>
                <Badge className={`${currentItem.subject.color} text-white`}>
                  {currentItem.subject.name}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleTextToSpeech}>
                  <Volume2 className={`h-4 w-4 ${isPlaying ? "animate-pulse" : ""}`} />
                </Button>
                <Badge variant="outline" className="capitalize">
                  {currentItem.reviewStage} Review
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none dark:prose-invert leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderContent(currentItem.content) }}
            />
          </CardContent>
        </Card>

        {/* Assessment Buttons */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">How well did you remember this?</CardTitle>
            <CardDescription>
              Your assessment determines when you'll see this item again
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => handleAssessment("again")}
                className={`${getAssessmentColor("again")} text-white h-16 flex-col space-y-1`}
              >
                <RotateCcw className="h-5 w-5" />
                <span className="font-medium">Again</span>
                <span className="text-xs opacity-90">&lt; 1 day</span>
              </Button>
              <Button
                onClick={() => handleAssessment("hard")}
                className={`${getAssessmentColor("hard")} text-white h-16 flex-col space-y-1`}
              >
                <span className="text-lg">😓</span>
                <span className="font-medium">Hard</span>
                <span className="text-xs opacity-90">1-2 days</span>
              </Button>
              <Button
                onClick={() => handleAssessment("good")}
                className={`${getAssessmentColor("good")} text-white h-16 flex-col space-y-1`}
              >
                <span className="text-lg">👍</span>
                <span className="font-medium">Good</span>
                <span className="text-xs opacity-90">3-4 days</span>
              </Button>
              <Button
                onClick={() => handleAssessment("easy")}
                className={`${getAssessmentColor("easy")} text-white h-16 flex-col space-y-1`}
              >
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Easy</span>
                <span className="text-xs opacity-90">1 week</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={handleSkip}>
              <SkipForward className="h-4 w-4 mr-2" />
              Skip
            </Button>
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentIndex === totalItems - 1}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Pause Dialog */}
        <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pause Review Session?</DialogTitle>
              <DialogDescription>
                Your progress will be saved and you can continue later from where you left off.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPauseDialog(false)}>
                Continue Review
              </Button>
              <Button onClick={handlePauseReview}>
                Save & Exit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
  
}