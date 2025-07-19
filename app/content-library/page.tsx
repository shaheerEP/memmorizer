"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Plus,
  Edit,
  Copy,
  Trash2,
  Download,
  Upload,
  MoreHorizontal,
  Calendar,
  Tag,
  Eye,
  Archive,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import EditContentForm from "@/components/EditContentForm"

interface ContentItem {
  id: string
  title: string
  content: string
  subject: { name: string; color: string }
  reviewStage: string
  nextReview: string
  dateAdded: string
  difficulty: string
  tags: string[]
  reviewCount: number
  estimatedTime: string
}

interface ContentStats {
  totalItems: number
  dueTodayCount: number
  reviewStages: {
    daily: number
    weekly: number
    monthly: number
    yearly: number
  }
  difficulties: {
    easy: number
    medium: number
    hard: number
  }
  subjects: Record<string, number>
}

interface ApiResponse {
  contents: ContentItem[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  stats: ContentStats
}

export default function ContentLibraryPage() {
  const router = useRouter()
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState<ContentStats | null>(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("All")
  const [selectedStage, setSelectedStage] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  
  // UI states
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importText, setImportText] = useState("")
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
const [showEditDialog, setShowEditDialog] = useState(false)
const [previewItem, setPreviewItem] = useState<ContentItem | null>(null)
const [editItem, setEditItem] = useState<ContentItem | null>(null)

  // Available filter options
  const reviewStages = ["All", "daily", "weekly", "monthly", "yearly"]
  const difficulties = ["All", "easy", "medium", "hard"]
  const subjects = ["All", ...(stats ? Object.keys(stats.subjects) : [])]

  // Fetch content from API
  const fetchContent = async (page = 1, showLoader = true) => {
    try {
      if (showLoader) setLoading(true)
      else setRefreshing(true)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedSubject !== "All" && { subject: selectedSubject }),
        ...(selectedStage !== "All" && { reviewStage: selectedStage }),
        ...(selectedDifficulty !== "All" && { difficulty: selectedDifficulty }),
        sortBy,
        sortOrder
      })

      const response = await fetch(`/api/content/all?${params}`)
      if (!response.ok) throw new Error('Failed to fetch content')
      
      const data: ApiResponse = await response.json()
      
      setContentItems(data.contents)
      setPagination(data.pagination)
      setStats(data.stats)
      
    } catch (error) {
      console.error('Error fetching content:', error)
      toast({
        title: "Error",
        description: "Failed to fetch content. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchContent()
  }, [])

  // Debounced search and filters
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchContent(1, false)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedSubject, selectedStage, selectedDifficulty, sortBy, sortOrder])

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) => 
      prev.includes(itemId) 
        ? prev.filter((id) => id !== itemId) 
        : [...prev, itemId]
    )
  }

  const handleSelectAll = () => {
    if (selectedItems.length === contentItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(contentItems.map((item) => item.id))
    }
  }

 const handleBulkDelete = async () => {
  try {
    const response = await fetch('/api/content/bulk-actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', itemIds: selectedItems })
    })
    if (!response.ok) throw new Error('Failed to delete items')
    
    setSelectedItems([])
    await fetchContent(pagination.page, false)
    toast({
      title: "Success",
      description: `${selectedItems.length} items deleted successfully.`
    })
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to delete items. Please try again.",
      variant: "destructive"
    })
  }
}

  const handleBulkExport = () => {
    const selectedContent = contentItems
      .filter((item) => selectedItems.includes(item.id))
      .map((item) => `${item.title}\n${item.content}\n---`)
      .join("\n\n")

    const blob = new Blob([selectedContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "study-content.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleBulkArchive = async () => {
  try {
    const response = await fetch('/api/content/bulk-actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'archive', itemIds: selectedItems })
    })
    if (!response.ok) throw new Error('Failed to archive items')
    
    setSelectedItems([])
    await fetchContent(pagination.page, false)
    toast({
      title: "Success",
      description: `${selectedItems.length} items archived successfully.`
    })
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to archive items. Please try again.",
      variant: "destructive"
    })
  }
}

  const handleImport = async () => {
    try {
      const items = importText.split("---").filter((item) => item.trim())
      // TODO: Implement import API
      console.log("Importing items:", items)
      setShowImportDialog(false)
      setImportText("")
      await fetchContent(pagination.page, false)
      toast({
        title: "Success",
        description: `${items.length} items imported successfully.`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import items. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handlePreview = async (itemId: string) => {
  try {
    const response = await fetch(`/api/content/${itemId}`)
    if (!response.ok) throw new Error('Failed to fetch content')
    const data = await response.json()
    setPreviewItem(data)
    setShowPreviewDialog(true)
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to load content preview.",
      variant: "destructive"
    })
  }
}

const handleEdit = async (itemId: string) => {
  try {
    const response = await fetch(`/api/content/${itemId}`)
    if (!response.ok) throw new Error('Failed to fetch content')
    const data = await response.json()
    setEditItem(data)
    setShowEditDialog(true)
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to load content for editing.",
      variant: "destructive"
    })
  }
}

const handleSaveEdit = async (updatedItem: ContentItem) => {
  try {
    const response = await fetch(`/api/content/${updatedItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItem)
    })
    if (!response.ok) throw new Error('Failed to update content')
    
    setShowEditDialog(false)
    setEditItem(null)
    await fetchContent(pagination.page, false)
    toast({
      title: "Success",
      description: "Content updated successfully."
    })
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to update content.",
      variant: "destructive"
    })
  }
}

const handleDelete = async (itemId: string) => {
  try {
    const response = await fetch(`/api/content/${itemId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete content')
    
    await fetchContent(pagination.page, false)
    toast({
      title: "Success",
      description: "Content deleted successfully."
    })
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to delete content.",
      variant: "destructive"
    })
  }
}

const handleDuplicate = async (itemId: string) => {
  try {
    const response = await fetch(`/api/content/${itemId}/duplicate`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to duplicate content')
    
    await fetchContent(pagination.page, false)
    toast({
      title: "Success",
      description: "Content duplicated successfully."
    })
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to duplicate content.",
      variant: "destructive"
    })
  }
}

const handleArchive = async (itemId: string) => {
  try {
    const response = await fetch(`/api/content/${itemId}/archive`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to archive content')
    
    await fetchContent(pagination.page, false)
    toast({
      title: "Success",
      description: "Content archived successfully."
    })
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to archive content.",
      variant: "destructive"
    })
  }
}

  const handlePageChange = (newPage: number) => {
    fetchContent(newPage, false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your content...</p>
        </div>
      </div>
    )
  }

 return (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Content Library</h1>
          <div className="text-sm sm:text-base text-muted-foreground">
            <p className="mb-1">Manage your study content and review schedule</p>
            {stats && (
              <p className="text-xs sm:text-sm">
                {stats.totalItems} items • {stats.dueTodayCount} due today
              </p>
            )}
          </div>
        </div>
        
        {/* Action Buttons - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 sm:items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchContent(pagination.page, false)}
            disabled={refreshing}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-2xl mx-auto">
              <DialogHeader>
                <DialogTitle>Import Content</DialogTitle>
                <DialogDescription className="text-sm">
                  Paste multiple items separated by "---". Each item should have a title and content.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="import-text">Content</Label>
                  <Textarea
                    id="import-text"
                    placeholder="Title 1&#10;Content for first item&#10;---&#10;Title 2&#10;Content for second item&#10;---"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    className="min-h-[150px] sm:min-h-[200px] text-sm"
                  />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowImportDialog(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleImport} 
                  disabled={!importText.trim()}
                  className="w-full sm:w-auto"
                >
                  Import Items
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={() => router.push("/add-content")}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </Button>
        </div>
      </div>

      {/* Filters - Mobile Optimized */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-3 sm:pt-6">
          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:gap-4">
            {/* Search - Full width on mobile */}
            <div className="relative sm:col-span-2 md:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            
            {/* Subject Filter */}
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                    {stats && subject !== "All" && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({stats.subjects[subject]})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Review Stage Filter */}
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Review Stage" />
              </SelectTrigger>
              <SelectContent>
                {reviewStages.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                    {stats && stage !== "All" && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({stats.reviewStages[stage as keyof typeof stats.reviewStages]})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Difficulty Filter */}
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((difficulty) => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty}
                    {stats && difficulty !== "All" && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({stats.difficulties[difficulty as keyof typeof stats.difficulties]})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Sort Filter */}
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-')
              setSortBy(field)
              setSortOrder(order)
            }}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest first</SelectItem>
                <SelectItem value="createdAt-asc">Oldest first</SelectItem>
                <SelectItem value="title-asc">Title A-Z</SelectItem>
                <SelectItem value="title-desc">Title Z-A</SelectItem>
                <SelectItem value="nextReview-asc">Next review</SelectItem>
                <SelectItem value="difficulty-asc">Difficulty</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions - Mobile Optimized */}
      {selectedItems.length > 0 && (
        <Card className="mb-4 sm:mb-6 border-primary">
          <CardContent className="p-3 sm:pt-6">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <span className="font-medium text-sm sm:text-base">
                  {selectedItems.length} items selected
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSelectAll}
                  className="w-full sm:w-auto mt-2 sm:mt-0"
                >
                  {selectedItems.length === contentItems.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleBulkExport}
                  className="w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleBulkArchive}
                  className="w-full sm:w-auto"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleBulkDelete}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content List - Mobile Optimized */}
      <div className="space-y-3 sm:space-y-4">
        {contentItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:pt-6">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={() => handleSelectItem(item.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base sm:text-lg font-semibold line-clamp-2 pr-2">
                      {item.title}
                    </h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePreview(item.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(item.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(item.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchive(item.id)}>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3 sm:line-clamp-2">
                    {item.content}
                  </p>

                  {/* Mobile: Stack badges and dates vertically */}
                  <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <Badge 
                        className={`${item.subject.color} text-white text-xs`}
                        variant="secondary"
                      >
                        {item.subject.name}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`${getStageColor(item.reviewStage)} text-xs`}
                      >
                        {item.reviewStage}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`${getDifficultyColor(item.difficulty)} text-xs`}
                      >
                        {item.difficulty}
                      </Badge>
                      {item.tags.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {item.tags.length} tag{item.tags.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>

                    {/* Mobile: Stack dates vertically */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs text-muted-foreground space-y-1 sm:space-y-0">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Next: {new Date(item.nextReview).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Tag className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Added: {new Date(item.dateAdded).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination - Mobile Optimized */}
      {pagination.pages > 1 && (
        <Card className="mt-4 sm:mt-6">
          <CardContent className="p-3 sm:pt-6">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex items-center justify-center sm:justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="text-xs sm:text-sm"
                >
                  Previous
                </Button>
                <span className="text-xs sm:text-sm px-2">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="text-xs sm:text-sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {contentItems.length === 0 && !loading && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">No content found matching your filters.</p>
            <Button 
              onClick={() => router.push("/add-content")}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Item
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog - Mobile Optimized */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl line-clamp-2">
              {previewItem?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge 
                className={`${previewItem?.subject.color} text-white text-xs`}
                variant="secondary"
              >
                {previewItem?.subject.name}
              </Badge>
              <Badge 
                variant="outline" 
                className={`${getStageColor(previewItem?.reviewStage || '')} text-xs`}
              >
                {previewItem?.reviewStage}
              </Badge>
              <Badge 
                variant="outline" 
                className={`${getDifficultyColor(previewItem?.difficulty || '')} text-xs`}
              >
                {previewItem?.difficulty}
              </Badge>
            </div>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-xs sm:text-sm bg-muted p-3 rounded-md overflow-x-auto">
                {previewItem?.content}
              </pre>
            </div>
            {previewItem?.tags && previewItem.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {previewItem.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - Mobile Optimized */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit Content</DialogTitle>
          </DialogHeader>
          {editItem && (
            <EditContentForm 
              item={editItem} 
              onSave={handleSaveEdit}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  </div>
)
}