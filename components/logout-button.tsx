"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
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
  const handleLogout = async () => {
    // Clear custom authentication data if any
    localStorage.removeItem("studyflow_auth")

    // Call NextAuth signOut
    await signOut({ callbackUrl: "/login" })
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
