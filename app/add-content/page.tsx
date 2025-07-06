"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Bold,
  Italic,
  List,
  Highlighter,
  Eye,
  EyeOff,
  Save,
  X,
  Plus,
  Clock,
  Type,
  ArrowLeft,
  AlertTriangle,
  Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"

interface Subject {
  id: string
  name: string
  color: string
  createdAt: Date
}


export default function AddContentPage() {
const { data: session } = useSession()
const { toast } = useToast()
const [subjects, setSubjects] = useState<Subject[]>([])
const [isLoading, setIsLoading] = useState(false)
const [isSaving, setIsSaving] = useState(false)
 const router = useRouter()
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [isPreview, setIsPreview] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showNewSubjectDialog, setShowNewSubjectDialog] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState("")
  const [newSubjectColor, setNewSubjectColor] = useState("bg-gray-500")
  const [duplicateWarning, setDuplicateWarning] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")

  
useEffect(() => {
  const fetchSubjects = async () => {
    if (!session?.user?.id) return
    
    try {
      const response = await fetch('/api/subjects')
      const data = await response.json()
      setSubjects(data.subjects)
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }

  fetchSubjects()
}, [session])

// Duplicate check
useEffect(() => {
  if (content.length > 50) {
    const checkDuplicate = async () => {
      try {
        const response = await fetch('/api/content/duplicate-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        })
        const data = await response.json()
        setDuplicateWarning(data.isDuplicate)
      } catch (error) {
        console.error('Error checking duplicate:', error)
      }
    }

    const timer = setTimeout(checkDuplicate, 1000)
    return () => clearTimeout(timer)
  }
}, [content])

// Auto-save (remove simulate, keep real save logic)
useEffect(() => {
  if (content.trim() || title.trim()) {
    setLastSaved(new Date())
  }
}, [content, title, tags])

  const formatText = (format: string) => {
    const textarea = document.getElementById("content-editor") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)

    if (selectedText) {
      let formattedText = ""
      switch (format) {
        case "bold":
          formattedText = `**${selectedText}**`
          break
        case "italic":
          formattedText = `*${selectedText}*`
          break
        case "highlight":
          formattedText = `==${selectedText}==`
          break
        case "list":
          formattedText = `\n• ${selectedText}`
          break
      }

      const newContent = content.substring(0, start) + formattedText + content.substring(end)
      setContent(newContent)
    }
  }

  const getWordCount = () =>
    content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
  const getEstimatedReadTime = () => Math.ceil(getWordCount() / 200) // 200 words per minute

  const renderPreview = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/==(.*?)==/g, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
      .replace(/^• (.+)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
  }

 const handleSave = async () => {
  if (!session?.user?.id) {
    toast({
      title: "Error",
      description: "Please sign in to save content",
      variant: "destructive"
    })
    return
  }

  if (!selectedSubject) {
    toast({
      title: "Error", 
      description: "Please select a subject",
      variant: "destructive"
    })
    return
  }

  setIsSaving(true)
  
  try {
    const selectedSubjectData = subjects.find(s => s.id === selectedSubject)
    
    const response = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim() || undefined,
        content: content.trim(),
        subject: selectedSubjectData,
        tags
      })
    })

    const data = await response.json()

    if (response.ok) {
      toast({
        title: "Success",
        description: "Content saved successfully"
      })
      router.push("/content-library")
    } else {
      throw new Error(data.error || 'Failed to save content')
    }
  } catch (error) {
    console.error('Save error:', error)
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to save content",
      variant: "destructive"
    })
  } finally {
    setIsSaving(false)
  }
}

const handleAddSubject = async () => {
  if (!newSubjectName.trim()) return
  
  setIsLoading(true)
  
  try {
    const response = await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newSubjectName.trim(),
        color: newSubjectColor
      })
    })

    const data = await response.json()

    if (response.ok) {
      setSubjects([...subjects, data.subject])
      setSelectedSubject(data.subject.id)
      setShowNewSubjectDialog(false)
      setNewSubjectName("")
      setNewSubjectColor("bg-gray-500")
      
      toast({
        title: "Success",
        description: "Subject created successfully"
      })
    } else {
      throw new Error(data.error || 'Failed to create subject')
    }
  } catch (error) {
    console.error('Create subject error:', error)
    toast({
      title: "Error", 
      description: error instanceof Error ? error.message : "Failed to create subject",
      variant: "destructive"
    })
  } finally {
    setIsLoading(false)
  }
}

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  if (!session) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
        <p className="text-muted-foreground">You need to be signed in to add content</p>
      </div>
    </div>
  )
}


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
              <h1 className="text-2xl font-bold">Add New Content</h1>
              <p className="text-muted-foreground">Create a new study item for spaced repetition</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isAutoSaving && (
              <div className="flex items-center text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
                Saving...
              </div>
            )}
            {lastSaved && (
              <p className="text-sm text-muted-foreground">
                Last updated: {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Duplicate Warning */}
        {duplicateWarning && (
          <Alert className="mb-6 border-yellow-500">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Similar content detected. You may already have this topic in your library.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title (optional)</Label>
                  <Input
                    id="title"
                    placeholder="Enter a descriptive title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Subject Selection */}
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <div className="flex space-x-2">
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${subject.color}`}></div>
                              <span>{subject.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Dialog open={showNewSubjectDialog} onOpenChange={setShowNewSubjectDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Subject</DialogTitle>
                          <DialogDescription>Create a new subject category for your content.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="subject-name">Subject Name</Label>
                            <Input
                              id="subject-name"
                              value={newSubjectName}
                              onChange={(e) => setNewSubjectName(e.target.value)}
                              placeholder="e.g., Python, Machine Learning"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex space-x-2">
                              {[
                                "bg-red-500",
                                "bg-blue-500",
                                "bg-green-500",
                                "bg-yellow-500",
                                "bg-purple-500",
                                "bg-pink-500",
                              ].map((color) => (
                                <button
                                  key={color}
                                  className={`w-8 h-8 rounded-full ${color} ${newSubjectColor === color ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                                  onClick={() => setNewSubjectColor(color)}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowNewSubjectDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddSubject}>Add Subject</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {tag}
                        <button 
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a tag..."
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button variant="outline" onClick={handleAddTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Content</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsPreview(!isPreview)}>
                      {isPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {isPreview ? "Edit" : "Preview"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Formatting Toolbar */}
                {!isPreview && (
                  <div className="flex items-center space-x-2 p-2 border rounded-md bg-muted/50">
                    <Button variant="ghost" size="sm" onClick={() => formatText("bold")}>
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => formatText("italic")}>
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => formatText("highlight")}>
                      <Highlighter className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => formatText("list")}>
                      <List className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <span className="text-sm text-muted-foreground">Select text to format</span>
                  </div>
                )}

                {/* Editor/Preview */}
                {isPreview ? (
                  <div
                    className="min-h-[300px] p-4 border rounded-md bg-background prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
                  />
                ) : (
                  <Textarea
                    id="content-editor"
                    placeholder="Enter your study content here... Use **bold**, *italic*, ==highlight==, and • for lists"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[300px] resize-none"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Type className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Words</span>
                  </div>
                  <span className="font-medium">{getWordCount()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Read time</span>
                  </div>
                  <span className="font-medium">{getEstimatedReadTime()} min</span>
                </div>
                {selectedSubject && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Subject</span>
                    <Badge className={subjects.find((s) => s.id === selectedSubject)?.color}>
                      {subjects.find((s) => s.id === selectedSubject)?.name}
                    </Badge>
                  </div>
                )}
                {tags.length > 0 && (
                  <div className="flex flex-col space-y-2">
                    <span className="text-sm">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
               <Button 
  onClick={handleSave} 
  className="w-full" 
  disabled={!content.trim() || !selectedSubject || isSaving}
>
  <Save className="h-4 w-4 mr-2" />
  {isSaving ? "Saving..." : "Save Content"}
</Button>
                <Button variant="outline" className="w-full" onClick={() => router.back()}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </CardContent>
            </Card>

            {/* Review Schedule Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Review Schedule</CardTitle>
                <CardDescription>When this item will appear for review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>First review:</span>
                    <span className="font-medium">Tomorrow</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily phase:</span>
                    <span className="text-muted-foreground">Days 2-4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weekly phase:</span>
                    <span className="text-muted-foreground">Day 11+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly phase:</span>
                    <span className="text-muted-foreground">Day 62+</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}