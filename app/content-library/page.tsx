"use client"

import { useState } from "react"
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

const contentItems = [
  {
    id: 1,
    title: "JavaScript Closures",
    content: "A closure is a function that has access to variables in its outer scope...",
    subject: { name: "JavaScript", color: "bg-yellow-500" },
    reviewStage: "daily",
    nextReview: "2024-01-15",
    dateAdded: "2024-01-10",
    difficulty: "medium",
  },
  {
    id: 2,
    title: "React useEffect Dependencies",
    content: "The dependency array in useEffect determines when the effect runs...",
    subject: { name: "React", color: "bg-blue-500" },
    reviewStage: "weekly",
    nextReview: "2024-01-18",
    dateAdded: "2024-01-08",
    difficulty: "hard",
  },
  {
    id: 3,
    title: "CSS Grid vs Flexbox",
    content: "CSS Grid is for two-dimensional layouts, while Flexbox is for one-dimensional...",
    subject: { name: "CSS", color: "bg-purple-500" },
    reviewStage: "monthly",
    nextReview: "2024-02-10",
    dateAdded: "2024-01-05",
    difficulty: "easy",
  },
  {
    id: 4,
    title: "Node.js Event Loop",
    content: "The event loop is what allows Node.js to perform non-blocking I/O operations...",
    subject: { name: "Node.js", color: "bg-green-500" },
    reviewStage: "yearly",
    nextReview: "2024-12-15",
    dateAdded: "2024-01-01",
    difficulty: "hard",
  },
]

const subjects = ["All", "JavaScript", "React", "CSS", "Node.js", "Database", "Algorithms"]
const reviewStages = ["All", "daily", "weekly", "monthly", "yearly"]
const difficulties = ["All", "easy", "medium", "hard"]

export default function ContentLibraryPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("All")
  const [selectedStage, setSelectedStage] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importText, setImportText] = useState("")

  const filteredItems = contentItems.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === "All" || item.subject?.name === selectedSubject
    const matchesStage = selectedStage === "All" || item.reviewStage === selectedStage
    const matchesDifficulty = selectedDifficulty === "All" || item.difficulty === selectedDifficulty

    return matchesSearch && matchesSubject && matchesStage && matchesDifficulty
  })

  const handleSelectItem = (itemId: number) => {
    setSelectedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredItems.map((item) => item.id))
    }
  }

  const handleBulkDelete = () => {
    console.log("Deleting items:", selectedItems)
    setSelectedItems([])
    setShowBulkActions(false)
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

  const handleImport = () => {
    const items = importText.split("---").filter((item) => item.trim())
    console.log("Importing items:", items)
    setShowImportDialog(false)
    setImportText("")
  }

  const getDifficultyColor = (difficulty: string) => {
    if (!difficulty) return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"

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
    if (!stage) return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Content Library</h1>
            <p className="text-muted-foreground">Manage your study content and review schedule</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Import Content</DialogTitle>
                  <DialogDescription>
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
                      className="min-h-[200px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleImport} disabled={!importText.trim()}>
                    Import Items
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={() => router.push("/add-content")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Review Stage" />
                </SelectTrigger>
                <SelectContent>
                  {reviewStages.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <Card className="mb-6 border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">{selectedItems.length} items selected</span>
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedItems.length === filteredItems.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleBulkExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content List */}
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => handleSelectItem(item.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold truncate">{item.title}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="text-muted-foreground mb-3 line-clamp-2">{item.content}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={`${item.subject.color} text-white`}>{item.subject.name}</Badge>
                        <Badge variant="outline" className={getStageColor(item.reviewStage)}>
                          {item.reviewStage}
                        </Badge>
                        <Badge variant="outline" className={getDifficultyColor(item.difficulty)}>
                          {item.difficulty}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Next: {new Date(item.nextReview).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Tag className="h-4 w-4" />
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

        {filteredItems.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No content found matching your filters.</p>
              <Button className="mt-4" onClick={() => router.push("/add-content")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
