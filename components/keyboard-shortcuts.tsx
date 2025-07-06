"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function KeyboardShortcuts() {
  const shortcuts = [
    {
      key: "Ctrl + B",
      description: "Toggle sidebar",
    },
    {
      key: "Ctrl + N",
      description: "Add new content",
    },
    {
      key: "Ctrl + S",
      description: "Save current content",
    },
    {
      key: "Ctrl + Enter",
      description: "Start review session",
    },
    {
      key: "Space",
      description: "Show answer (during review)",
    },
    {
      key: "1-4",
      description: "Rate item difficulty (1=Again, 4=Easy)",
    },
    {
      key: "→",
      description: "Next item (during review)",
    },
    {
      key: "←",
      description: "Previous item (during review)",
    },
    {
      key: "Esc",
      description: "Pause review session",
    },
    {
      key: "Ctrl + F",
      description: "Search content",
    },
  ]

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[150px]">Shortcut</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shortcuts.map((shortcut, index) => (
          <TableRow key={index}>
            <TableCell className="font-mono">{shortcut.key}</TableCell>
            <TableCell>{shortcut.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
