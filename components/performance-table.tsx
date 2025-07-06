"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface PerformanceTableProps {
  data: {
    subject: string
    totalItems: number
    completionRate: number
    avgDifficulty: string
    avgTime: string
    retentionRate: number
  }[]
}

export function PerformanceTable({ data }: PerformanceTableProps) {
  const getDifficultyColor = (difficulty: string) => {
    if (!difficulty) return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"

    switch (difficulty.toLowerCase()) {
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

  const getRetentionColor = (rate: number) => {
    if (rate >= 90) return "text-green-600 dark:text-green-400"
    if (rate >= 80) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead className="text-right">Items</TableHead>
            <TableHead className="text-right">Completion</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead className="text-right">Avg. Time</TableHead>
            <TableHead className="text-right">Retention</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.subject}>
              <TableCell className="font-medium">{item.subject}</TableCell>
              <TableCell className="text-right">{item.totalItems}</TableCell>
              <TableCell className="text-right">{item.completionRate}%</TableCell>
              <TableCell>
                <Badge variant="outline" className={getDifficultyColor(item.avgDifficulty)}>
                  {item.avgDifficulty}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{item.avgTime}</TableCell>
              <TableCell className={`text-right font-medium ${getRetentionColor(item.retentionRate)}`}>
                {item.retentionRate}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
