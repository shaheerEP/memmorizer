"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Copy,
  Archive,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ContentItem {
  _id: string
  title?: string
  content: string
  subject: { name: string; color: string }
  reviewStage: 'daily' | 'weekly' | 'monthly' | 'yearly'
  createdAt: string
  scheduledDate: string
  difficulty?: 'easy' | 'medium' | 'hard'
  estimatedTime?: string
  reviewCount?: number
}

export default function CompleteReviewPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [previewMode, setPreviewMode] = useState(false)
  const [archivedItems, setArchivedItems] = useState<string[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [deletedItems, setDeletedItems] = useState<string[]>([])
  const [todaysContent, setTodaysContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodaysContent()
  }, [])

  const determineReviewStage = (reviewCount: number): 'daily' | 'weekly' | 'monthly' | 'yearly' => {
    if (reviewCount < 2) return 'daily'
    if (reviewCount < 5) return 'weekly'
    if (reviewCount < 8) return 'monthly'
    return 'yearly'
  }

  const fetchTodaysContent = async () => {
    try {
      const response = await fetch('/api/content/today')
      if (response.ok) {
        const data = await response.json()
        setTodaysContent(data.content.map((item: any) => ({
          ...item,
          _id: item._id.toString(),
          estimatedTime: item.estimatedTime || "3 min",
          reviewStage: determineReviewStage(item.reviewCount || 0),
          scheduledDate: item.scheduledDate || new Date().toISOString()
        })))
      }
    } catch (error) {
      console.error('Error fetching content:', error)
      toast({
        title: "Error",
        description: "Failed to load today's content",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const renderContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/==(.*?)==/g, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>')
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(
        /```(\w+)?\n([\s\S]*?)```/g,
        '<pre class="bg-muted p-3 rounded-md overflow-x-auto"><code class="text-sm font-mono">$2</code></pre>',
      )
      .replace(/^• (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul class="list-disc space-y-1 my-2">$1</ul>')
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/^(.+)$/, '<p class="mb-3">$1</p>')
  }

  const handleCopyItem = async (item: ContentItem) => {
    const textContent = `${item.title}\n\n${item.content}`
    try {
      await navigator.clipboard.writeText(textContent)
      toast({
        title: "Copied to clipboard",
        description: `"${item.title}" has been copied to your clipboard.`,
      })
    } catch (err) {
      console.error("Failed to copy:", err)
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCopyAll = async () => {
    const activeItems = todaysContent.filter(
      (item) => !archivedItems.includes(item._id) && !deletedItems.includes(item._id)
    )
    
    const allContent = activeItems.map((item) => `${item.title}\n\n${item.content}\n\n---\n\n`).join("")

    try {
      await navigator.clipboard.writeText(allContent)
      toast({
        title: "All content copied",
        description: `${activeItems.length} items have been copied to your clipboard.`,
      })
    } catch (err) {
      console.error("Failed to copy all:", err)
      toast({
        title: "Copy failed",
        description: "Unable to copy all content. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteItem = (itemId: string) => {
    setItemToDelete(itemId)
    setShowDeleteDialog(true)
  }

  const handleMarkAsComplete = async (itemId: string) => {
  try {
    const response = await fetch('/api/content/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reviewed', contentId: itemId })
    })

    if (response.ok) {
      setArchivedItems([...archivedItems, itemId])
      const item = todaysContent.find(item => item._id === itemId)
      toast({
        title: "Marked as complete",
        description: `${item?.title || 'Content'} has been marked as reviewed and will reappear at the next interval.`
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to mark as complete.",
        variant: "destructive"
      })
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to mark as complete.",
      variant: "destructive"
    })
  }
}


  const getStageColor = (stage: string) => {
    switch (stage) {
      case "daily":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "weekly":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "monthly":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "yearly":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const handleArchiveItem = async (itemId: string) => {
    try {
      const response = await fetch('/api/content/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive', contentId: itemId })
      })

      if (response.ok) {
        setArchivedItems([...archivedItems, itemId])
        const item = todaysContent.find(item => item._id === itemId)
        toast({
          title: "Item archived",
          description: `"${item?.title || 'Content'}" has been archived.`
        })
      }
    } catch (error) {
      console.error('Archive error:', error)
      toast({
        title: "Error",
        description: "Failed to archive item",
        variant: "destructive"
      })
    }
  }

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        const response = await fetch('/api/content/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', contentId: itemToDelete })
        })

        if (response.ok) {
          setDeletedItems([...deletedItems, itemToDelete])
          const item = todaysContent.find(item => item._id === itemToDelete)
          toast({
            title: "Item deleted",
            description: `"${item?.title || 'Content'}" has been permanently deleted.`
          })
        }
      } catch (error) {
        console.error('Delete error:', error)
        toast({
          title: "Error",
          description: "Failed to delete item",
          variant: "destructive"
        })
      }
      setItemToDelete(null)
      setShowDeleteDialog(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading today's content...</p>
        </div>
      </div>
    )
  }

  // Filter active items
  const activeItems = todaysContent.filter(
    (item) => !archivedItems.includes(item._id) && !deletedItems.includes(item._id)
  )

  // Calculate total estimated time
  const totalEstimatedTime = activeItems.reduce((total, item) => {
    const timeStr = item.estimatedTime || "3 min"
    const minutes = parseInt(timeStr.split(" ")[0])
    return total + minutes
  }, 0)

 return (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Complete Review</h1>
            <p className="text-muted-foreground flex items-center text-sm">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              {today}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className={`${previewMode ? "bg-primary/10 border-primary" : ""} text-xs sm:text-sm`}
          >
            {previewMode ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />}
            <span className="hidden sm:inline">{previewMode ? "Hide Controls" : "Show Controls"}</span>
            <span className="sm:hidden">{previewMode ? "Hide" : "Show"}</span>
          </Button>
          {previewMode && (
            <Button variant="outline" size="sm" onClick={handleCopyAll} className="text-xs sm:text-sm">
              <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Copy All</span>
              <span className="sm:hidden">Copy</span>
            </Button>
          )}
        </div>
      </div>

      {/* Summary Card */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="pt-4 sm:pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Items</p>
                <p className="text-base sm:text-lg font-semibold">{activeItems.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Est. Time</p>
                <p className="text-base sm:text-lg font-semibold">{totalEstimatedTime} min</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Items */}
      <div className="space-y-4 sm:space-y-6">
        {activeItems.length === 0 ? (
          <Card>
            <CardContent className="pt-4 sm:pt-6 text-center">
              <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-500 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">All Done!</h3>
              <p className="text-sm sm:text-base text-muted-foreground px-2">You've completed all your reviews for today. Great job!</p>
              <Button className="mt-3 sm:mt-4" onClick={() => router.push("/")}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          activeItems.map((item, index) => (
            <Card key={item._id} className="relative">
              <CardHeader className="pb-3 sm:pb-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2 gap-2 sm:gap-0">
                      <CardTitle className="text-lg sm:text-xl break-words">{item.title}</CardTitle>
                      <Badge className={`${item.subject.color} text-white self-start sm:self-auto text-xs`}>
                        {item.subject.name}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-muted-foreground gap-1 sm:gap-0">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>Scheduled: {new Date(item.scheduledDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>{item.estimatedTime}</span>
                      </div>
                      <Badge variant="outline" className={`${getStageColor(item.reviewStage)} text-xs self-start sm:self-auto`}>
                        {item.reviewStage}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {previewMode && (
                    <div className="flex items-center space-x-1 sm:space-x-2 sm:ml-4 self-end sm:self-start">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyItem(item)}
                        title="Copy to clipboard"
                        className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3"
                      >
                        <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline sm:ml-2">Copy</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchiveItem(item._id)}
                        title="Archive item"
                        className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3"
                      >
                        <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline sm:ml-2">Archive</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteItem(item._id)}
                        title="Delete item"
                        className="text-destructive hover:text-destructive h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline sm:ml-2">Delete</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div
                  className="prose prose-sm max-w-none dark:prose-invert leading-relaxed text-sm sm:text-base"
                  dangerouslySetInnerHTML={{ __html: renderContent(item.content) }}
                />
                <div className="flex justify-end mt-3 sm:mt-4">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleMarkAsComplete(item._id)}
                    className="text-sm w-full sm:w-auto"
                  >
                    Mark as Complete
                  </Button>
                </div>
              </CardContent>
              {index < activeItems.length - 1 && <Separator className="mt-4 sm:mt-6" />}
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="mx-4 sm:mx-0 w-[calc(100vw-2rem)] sm:w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
              <span>Delete Item</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Are you sure you want to permanently delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {itemToDelete && (
            <Alert className="border-destructive/20 bg-destructive/5">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-sm">
                <strong>"{todaysContent.find((item) => item._id === itemToDelete)?.title}"</strong> will be permanently
                deleted from your study library.
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="w-full sm:w-auto">
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>
)
}