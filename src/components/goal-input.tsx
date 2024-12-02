"use client"

import { useState } from "react"
import { Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface GoalInputProps {
  onAdd: (goal: string) => void
}

export function GoalInput({ onAdd }: GoalInputProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [goal, setGoal] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!goal) return

    onAdd(goal)
    setGoal("")
    setIsExpanded(false)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
      {!isExpanded ? (
        <Button
          onClick={() => setIsExpanded(true)}
          variant="outline"
          className="w-full h-12 border-dashed"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Goal
        </Button>
      ) : (
        <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm">
          <Input
            placeholder="Enter your learning goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="border-none text-lg font-medium placeholder:text-muted-foreground/60"
          />
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsExpanded(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Goal</Button>
          </div>
        </div>
      )}
    </form>
  )
}

