"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function LogoutButton() {
  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("studyflow_auth")

    // In a real app, you would also:
    // 1. Revoke Google OAuth tokens
    // 2. Clear all user data from localStorage
    // 3. Clear cookies
    // 4. Notify your backend to invalidate the session

    // Redirect to login page
    window.location.href = "/login"
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign Out</DialogTitle>
          <DialogDescription>
            Are you sure you want to sign out? Your progress will be saved and synced to the cloud.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleLogout}>Sign Out</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
