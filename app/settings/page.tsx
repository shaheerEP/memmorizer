"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import {
  Moon,
  Sun,
  Laptop,
  Save,
  Download,
  Upload,
  Trash2,
  Bell,
  Calendar,
  Clock,
  Keyboard,
  AlertTriangle,
  Check,
  Volume2,
  User,
  Database,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [fontSize, setFontSize] = useState("medium")
  const [fontFamily, setFontFamily] = useState("system")
  const [sessionSize, setSessionSize] = useState("10")
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [audioVolume, setAudioVolume] = useState([70])
  const [audioVoice, setAudioVoice] = useState("default")
  const [audioSpeed, setAudioSpeed] = useState("1")

  const [dailyInterval, setDailyInterval] = useState("1,2,4")
  const [weeklyInterval, setWeeklyInterval] = useState("7,14,21")
  const [monthlyInterval, setMonthlyInterval] = useState("30,60,90")
  const [yearlyInterval, setYearlyInterval] = useState("365,730,1095")

  const [weekendReviews, setWeekendReviews] = useState(true)
  const [preferredTime, setPreferredTime] = useState("morning")
  const [holidayMode, setHolidayMode] = useState(false)

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [browserNotifications, setBrowserNotifications] = useState(true)
  const [reminderTime, setReminderTime] = useState("18:00")

  const [showClearDataDialog, setShowClearDataDialog] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  const handleSaveSettings = () => {
    // Simulate saving settings
    setShowSuccessAlert(true)
    setTimeout(() => setShowSuccessAlert(false), 3000)
  }

  const handleClearData = () => {
    // Simulate clearing data
    setShowClearDataDialog(false)
    setShowSuccessAlert(true)
    setTimeout(() => setShowSuccessAlert(false), 3000)
  }

  const handleExportData = () => {
    // Simulate exporting data
    const dummyData = {
      settings: {
        theme,
        fontSize,
        fontFamily,
        sessionSize,
        audioEnabled,
        audioVolume,
        audioVoice,
        audioSpeed,
        dailyInterval,
        weeklyInterval,
        monthlyInterval,
        yearlyInterval,
        weekendReviews,
        preferredTime,
        holidayMode,
        emailNotifications,
        browserNotifications,
        reminderTime,
      },
      userData: {
        items: "1247 study items",
        progress: "Full progress data",
        statistics: "Complete statistics",
      },
    }

    const dataStr = JSON.stringify(dummyData, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `studyflow-backup-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Customize your study experience</p>
          </div>
          <Button onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>

        {/* Success Alert */}
        {showSuccessAlert && (
          <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950/20">
            <Check className="h-4 w-4 text-green-500" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Your settings have been saved successfully.</AlertDescription>
          </Alert>
        )}

        {/* Settings Tabs */}
        <Tabs defaultValue="preferences" className="mb-6">
          <TabsList className="grid grid-cols-4 md:w-[600px]">
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>User Interface</span>
                </CardTitle>
                <CardDescription>Customize how StudyFlow looks and feels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Selection */}
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setTheme("light")}
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setTheme("dark")}
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setTheme("system")}
                    >
                      <Laptop className="h-4 w-4 mr-2" />
                      System
                    </Button>
                  </div>
                </div>

                {/* Font Size */}
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Select value={fontSize} onValueChange={setFontSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="x-large">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Font Family */}
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select font family" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System Default</SelectItem>
                      <SelectItem value="serif">Serif</SelectItem>
                      <SelectItem value="sans-serif">Sans Serif</SelectItem>
                      <SelectItem value="monospace">Monospace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Session Size */}
                <div className="space-y-2">
                  <Label>Default Review Session Size</Label>
                  <Select value={sessionSize} onValueChange={setSessionSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select session size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 items</SelectItem>
                      <SelectItem value="10">10 items</SelectItem>
                      <SelectItem value="15">15 items</SelectItem>
                      <SelectItem value="20">20 items</SelectItem>
                      <SelectItem value="25">25 items</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Volume2 className="h-5 w-5" />
                  <span>Audio Settings</span>
                </CardTitle>
                <CardDescription>Configure text-to-speech and audio preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Audio Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Text-to-Speech</Label>
                    <p className="text-sm text-muted-foreground">Allow audio playback of study content</p>
                  </div>
                  <Switch checked={audioEnabled} onCheckedChange={setAudioEnabled} />
                </div>

                {audioEnabled && (
                  <>
                    {/* Audio Volume */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Volume</Label>
                        <span className="text-sm text-muted-foreground">{audioVolume}%</span>
                      </div>
                      <Slider value={audioVolume} min={0} max={100} step={1} onValueChange={setAudioVolume} />
                    </div>

                    {/* Voice Selection */}
                    <div className="space-y-2">
                      <Label>Voice</Label>
                      <Select value={audioVoice} onValueChange={setAudioVoice}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select voice" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Speech Rate */}
                    <div className="space-y-2">
                      <Label>Speech Rate</Label>
                      <Select value={audioSpeed} onValueChange={setAudioSpeed}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select speech rate" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.5">0.5x (Slow)</SelectItem>
                          <SelectItem value="0.75">0.75x</SelectItem>
                          <SelectItem value="1">1x (Normal)</SelectItem>
                          <SelectItem value="1.25">1.25x</SelectItem>
                          <SelectItem value="1.5">1.5x</SelectItem>
                          <SelectItem value="2">2x (Fast)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Keyboard className="h-5 w-5" />
                  <span>Keyboard Shortcuts</span>
                </CardTitle>
                <CardDescription>Keyboard shortcuts to improve your workflow</CardDescription>
              </CardHeader>
              <CardContent>
                <KeyboardShortcuts />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Review Intervals</span>
                </CardTitle>
                <CardDescription>Customize your spaced repetition schedule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Daily Interval */}
                <div className="space-y-2">
                  <Label htmlFor="daily-interval">Daily Phase (days)</Label>
                  <p className="text-sm text-muted-foreground">Comma-separated days for the daily review phase</p>
                  <Input
                    id="daily-interval"
                    value={dailyInterval}
                    onChange={(e) => setDailyInterval(e.target.value)}
                    placeholder="e.g., 1,2,4"
                  />
                </div>

                {/* Weekly Interval */}
                <div className="space-y-2">
                  <Label htmlFor="weekly-interval">Weekly Phase (days)</Label>
                  <p className="text-sm text-muted-foreground">Comma-separated days for the weekly review phase</p>
                  <Input
                    id="weekly-interval"
                    value={weeklyInterval}
                    onChange={(e) => setWeeklyInterval(e.target.value)}
                    placeholder="e.g., 7,14,21"
                  />
                </div>

                {/* Monthly Interval */}
                <div className="space-y-2">
                  <Label htmlFor="monthly-interval">Monthly Phase (days)</Label>
                  <p className="text-sm text-muted-foreground">Comma-separated days for the monthly review phase</p>
                  <Input
                    id="monthly-interval"
                    value={monthlyInterval}
                    onChange={(e) => setMonthlyInterval(e.target.value)}
                    placeholder="e.g., 30,60,90"
                  />
                </div>

                {/* Yearly Interval */}
                <div className="space-y-2">
                  <Label htmlFor="yearly-interval">Yearly Phase (days)</Label>
                  <p className="text-sm text-muted-foreground">Comma-separated days for the yearly review phase</p>
                  <Input
                    id="yearly-interval"
                    value={yearlyInterval}
                    onChange={(e) => setYearlyInterval(e.target.value)}
                    placeholder="e.g., 365,730,1095"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Review Timing</span>
                </CardTitle>
                <CardDescription>Configure when you want to study</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Weekend Reviews */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekend Reviews</Label>
                    <p className="text-sm text-muted-foreground">Include items for review on weekends</p>
                  </div>
                  <Switch checked={weekendReviews} onCheckedChange={setWeekendReviews} />
                </div>

                {/* Preferred Time */}
                <div className="space-y-2">
                  <Label>Preferred Study Time</Label>
                  <Select value={preferredTime} onValueChange={setPreferredTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preferred time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (6am - 12pm)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12pm - 6pm)</SelectItem>
                      <SelectItem value="evening">Evening (6pm - 10pm)</SelectItem>
                      <SelectItem value="night">Night (10pm - 6am)</SelectItem>
                      <SelectItem value="anytime">Anytime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Holiday Mode */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Holiday Mode</Label>
                    <p className="text-sm text-muted-foreground">Pause scheduling during breaks</p>
                  </div>
                  <Switch checked={holidayMode} onCheckedChange={setHolidayMode} />
                </div>

                {holidayMode && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="holiday-start">Start Date</Label>
                      <Input id="holiday-start" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="holiday-end">End Date</Label>
                      <Input id="holiday-end" type="date" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Data Management</span>
                </CardTitle>
                <CardDescription>Export, import, and manage your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Export Data */}
                <div className="space-y-2">
                  <Label>Export Data</Label>
                  <p className="text-sm text-muted-foreground">Download all your study data and settings</p>
                  <Button variant="outline" className="w-full" onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export as JSON
                  </Button>
                </div>

                <Separator />

                {/* Import Data */}
                <div className="space-y-2">
                  <Label>Import Data</Label>
                  <p className="text-sm text-muted-foreground">Restore from a previously exported backup</p>
                  <div className="grid grid-cols-1 gap-2">
                    <Input id="import-file" type="file" accept=".json" />
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Data
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Clear Data */}
                <div className="space-y-2">
                  <Label>Clear Data</Label>
                  <p className="text-sm text-muted-foreground">Delete all your study data and reset settings</p>
                  <Dialog open={showClearDataDialog} onOpenChange={setShowClearDataDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All Data
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete all your study items, progress, and
                          settings.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="bg-destructive/10 p-4 rounded-md border border-destructive">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                          <div>
                            <h4 className="font-medium text-destructive">Warning</h4>
                            <p className="text-sm text-muted-foreground">You will lose:</p>
                            <ul className="text-sm text-muted-foreground list-disc pl-5 mt-2">
                              <li>1,247 study items</li>
                              <li>All progress and statistics</li>
                              <li>Your 47-day streak</li>
                              <li>All custom settings</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowClearDataDialog(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleClearData}>
                          Yes, Clear All Data
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Account & Sync</span>
                </CardTitle>
                <CardDescription>Manage your account and sync settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Account Status */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Account Status</Label>
                    <p className="text-sm text-muted-foreground">Your current account status</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                    <Check className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>

                {/* Auto Sync */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Sync</Label>
                    <p className="text-sm text-muted-foreground">Automatically sync data across devices</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                {/* Sync Frequency */}
                <div className="space-y-2">
                  <Label>Sync Frequency</Label>
                  <Select defaultValue="realtime">
                    <SelectTrigger>
                      <SelectValue placeholder="Select sync frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="manual">Manual only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Last Sync */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Last Sync</Label>
                    <p className="text-sm text-muted-foreground">When your data was last synchronized</p>
                  </div>
                  <span className="text-sm">Today, 2:45 PM</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Settings</span>
                </CardTitle>
                <CardDescription>Configure how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive daily review reminders via email</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>

                {/* Browser Notifications */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Browser Notifications</Label>
                    <p className="text-sm text-muted-foreground">Show desktop notifications for due reviews</p>
                  </div>
                  <Switch checked={browserNotifications} onCheckedChange={setBrowserNotifications} />
                </div>

                {/* Reminder Time */}
                <div className="space-y-2">
                  <Label htmlFor="reminder-time">Daily Reminder Time</Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                  />
                </div>

                {/* Notification Types */}
                <div className="space-y-2">
                  <Label>Notification Types</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="due-reviews" defaultChecked />
                      <Label htmlFor="due-reviews">Due reviews</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="streak-reminders" defaultChecked />
                      <Label htmlFor="streak-reminders">Streak reminders</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="achievement-alerts" defaultChecked />
                      <Label htmlFor="achievement-alerts">Achievement alerts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="tips-suggestions" defaultChecked />
                      <Label htmlFor="tips-suggestions">Tips & suggestions</Label>
                    </div>
                  </div>
                </div>

                {/* Test Notification */}
                <Button variant="outline" className="w-full">
                  <Bell className="h-4 w-4 mr-2" />
                  Send Test Notification
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Calendar Integration</span>
                </CardTitle>
                <CardDescription>Connect your calendar for review scheduling</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Calendar Integration */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Google Calendar</Label>
                    <p className="text-sm text-muted-foreground">Sync review sessions with Google Calendar</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Apple Calendar</Label>
                    <p className="text-sm text-muted-foreground">Sync review sessions with Apple Calendar</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Outlook Calendar</Label>
                    <p className="text-sm text-muted-foreground">Sync review sessions with Outlook Calendar</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>

                {/* Calendar Event Settings */}
                <div className="space-y-2">
                  <Label>Calendar Event Title</Label>
                  <Input defaultValue="StudyFlow Review Session" />
                </div>

                <div className="space-y-2">
                  <Label>Default Event Duration</Label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
