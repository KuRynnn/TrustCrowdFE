"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

interface TaskResultProps {
  taskId: string;
  answer: string;
  taskData?: {
    id: string;
    question: string;
    description?: string;
    answers?: Array<{ answer: string; stats?: string }>;
  };
  loading?: boolean;
}

export default function TaskResult({
  taskId,
  answer,
  taskData = {
    id: taskId,
    question: "Sample question text for this task?",
    description: "This is a sample task description",
    answers: [
      { answer: "Option A", stats: "45%" },
      { answer: "Option B", stats: "30%" },
      { answer: "Option C", stats: "25%" },
    ]
  },
  loading = false,
}: TaskResultProps) {
  const [openModal, setOpenModal] = useState(false);

  if (loading) {
    return (
      <div className="bg-white/10 p-4 rounded-lg">
        <p className="text-gray-300">Loading task...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 p-4 rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-white">
            Task Question: {taskData?.question || "No question"}
          </h3>
          <p className="text-sm text-gray-300">Your answer: {answer}</p>
        </div>
        <Button onClick={() => setOpenModal(true)} size="sm" className="bg-purple-800 hover:bg-purple-700">
          View Task
        </Button>
      </div>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Task Detail</DialogTitle>
          </DialogHeader>
          {taskData ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Question:</label>
                <p className="font-medium">{taskData.question}</p>
              </div>
              
              {taskData.description && (
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">Description:</label>
                  <p className="text-gray-300">{taskData.description}</p>
                </div>
              )}
              
              {/* Fixed the TypeScript error by checking if answers exists AND has length */}
              {taskData.answers && taskData.answers.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Answer Options:</label>
                  <ul className="space-y-2">
                    {taskData.answers.map((ans, idx) => (
                      <li key={idx} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                        <span>{ans.answer}</span>
                        {ans.stats && <span className="text-sm text-gray-400">{ans.stats}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="space-y-1 bg-purple-900/30 p-3 rounded-lg border border-purple-800">
                <label className="text-sm text-purple-300">Your Answer:</label>
                <p className="font-medium text-white">{answer}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Task not found</p>
          )}
          <DialogFooter>
            <Button onClick={() => setOpenModal(false)} className="bg-gray-700 hover:bg-gray-600">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}