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
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Complete Review</h1>
              <p className="text-muted-foreground flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {today}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className={previewMode ? "bg-primary/10 border-primary" : ""}
            >
              {previewMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {previewMode ? "Hide Controls" : "Show Controls"}
            </Button>
            {previewMode && (
              <Button variant="outline" size="sm" onClick={handleCopyAll}>
                <Copy className="h-4 w-4 mr-2" />
                Copy All
              </Button>
            )}
          </div>
        </div>

        {/* Summary Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-lg font-semibold">{activeItems.length}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Time</p>
                  <p className="text-lg font-semibold">{totalEstimatedTime} minutes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Items */}
        <div className="space-y-6">
          {activeItems.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Done!</h3>
                <p className="text-muted-foreground">You've completed all your reviews for today. Great job!</p>
                <Button className="mt-4" onClick={() => router.push("/")}>
                  Return to Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
            activeItems.map((item, index) => (
              <Card key={item._id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                        <Badge className={`${item.subject.color} text-white`}>{item.subject.name}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Scheduled: {new Date(item.scheduledDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{item.estimatedTime}</span>
                        </div>
                        <Badge variant="outline" className={getStageColor(item.reviewStage)}>
                          {item.reviewStage}
                        </Badge>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {previewMode && (
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyItem(item)}
                          title="Copy to clipboard"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleArchiveItem(item._id)}
                          title="Archive item"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteItem(item._id)}
                          title="Delete item"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderContent(item.content) }}
                  />
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleMarkAsComplete(item._id)}
                    >
                      Mark as Complete
                    </Button>
                  </div>
                </CardContent>
                {index < activeItems.length - 1 && <Separator className="mt-6" />}
              </Card>
            ))
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span>Delete Item</span>
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete this item? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {itemToDelete && (
              <Alert className="border-destructive/20 bg-destructive/5">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertDescription>
                  <strong>"{todaysContent.find((item) => item._id === itemToDelete)?.title}"</strong> will be permanently
                  deleted from your study library.
                </AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete Permanently
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}