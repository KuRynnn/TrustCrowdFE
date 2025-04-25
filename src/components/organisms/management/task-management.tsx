"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { ClipboardList, ClipboardPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

// Mock data
const mockTasks = [
  {
    id: "1",
    title: "Customer Sentiment Analysis",
    description: "Analyze customer reviews to determine sentiment",
    question: "What is the sentiment of this review?",
    answers: [
      { answer: "Positive" },
      { answer: "Negative" },
      { answer: "Neutral" }
    ]
  },
  {
    id: "2",
    title: "Image Classification",
    description: "Classify images into different categories",
    question: "What object is shown in this image?",
    answers: [
      { answer: "Car" },
      { answer: "Building" },
      { answer: "Person" }
    ]
  },
];

type Task = {
  id: string;
  title: string;
  description: string;
  question: string;
  answers: { answer: string; stats?: string }[];
};

type CreateTask = {
  title: string;
  description: string;
  question: string;
  answers: { answer: string }[];
};

export default function TaskManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<CreateTask>({
    title: "",
    description: "",
    question: "",
    answers: [{ answer: "" }],
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleCreateTask = () => {
    console.log("Create task:", newTask);
    setNewTask({
      title: "",
      description: "",
      question: "",
      answers: [{ answer: "" }],
    });
    setIsModalOpen(false);
  };

  const handleDeleteTask = (id: string) => {
    console.log("Delete task:", id);
  };

  const handleGetTaskById = (id: string) => {
    const task = mockTasks.find(t => t.id === id);
    if (task) {
      setSelectedTask(task);
      setIsDetailModalOpen(true);
    }
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="flex justify-end items-center mb-6">
        <Button className="bg-[#001333]" onClick={() => setIsModalOpen(true)}>
          <ClipboardList size={16} /> Create Task
        </Button>
      </div>

      <Dialog
        open={isModalOpen}
        onOpenChange={() => setIsModalOpen(!isModalOpen)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            <Input
              type="text"
              placeholder="Title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
            />
            <Textarea
              placeholder="Description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />
            <Textarea
              placeholder="Question"
              value={newTask.question}
              onChange={(e) =>
                setNewTask({ ...newTask, question: e.target.value })
              }
            />
            {newTask.answers.map((answer, idx) => (
              <div key={idx} className="mb-3 gap-2 flex items-center">
                <Input
                  type="text"
                  placeholder={`Answer - ${idx + 1}`}
                  value={answer.answer}
                  onChange={(e) => {
                    const updatedAnswers = [...newTask.answers];
                    updatedAnswers[idx].answer = e.target.value;
                    setNewTask({ ...newTask, answers: updatedAnswers });
                  }}
                />

                <Button
                  variant="destructive"
                  onClick={() => {
                    const updatedAnswers = newTask.answers.filter(
                      (_, index) => index !== idx
                    );
                    setNewTask({ ...newTask, answers: updatedAnswers });
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            <Button
              onClick={() =>
                setNewTask({
                  ...newTask,
                  answers: [...newTask.answers, { answer: "" }],
                })
              }
            >
              <ClipboardPlus size={16} /> Add Answer
            </Button>
            <div className="flex justify-end space-x-4">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateTask}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDetailModalOpen}
        onOpenChange={() => setIsDetailModalOpen(!isDetailModalOpen)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Task</DialogTitle>
          </DialogHeader>

          <section>
            <div className="grid grid-cols-2">
              <p className="font-semibold">Title </p>
              <p>: {selectedTask?.title}</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="font-semibold">Description </p>
              <p>: {selectedTask?.description}</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="font-semibold">Question </p>
              <p>: {selectedTask?.question}</p>
            </div>
            <p className="my-6 font-semibold">Answers</p>
            <ul className="list-disc">
              {selectedTask?.answers.map((answer, idx) => (
                <li className="flex list-disc items-center gap-2" key={idx}>
                  <p>
                    <strong>Answer:</strong> {answer.answer ?? "-"}
                  </p>
                  <p>
                    <strong>Stats:</strong> {answer.stats ?? "-"}
                  </p>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => setIsDetailModalOpen(false)}
              className="mt-8 w-full"
            >
              Close
            </Button>
          </section>
        </DialogContent>
      </Dialog>

      <div className="bg-white p-6 border rounded shadow">
        <Table>
          <TableCaption>A list of task.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold text-primary">
                Title
              </TableHead>
              <TableHead className="font-semibold text-primary">
                Description
              </TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.title}</TableCell>
                <TableCell>
                  <span>{task.description}</span>
                </TableCell>
                <TableCell className="text-right space-x-2 flex items-center justify-end">
                  <Button
                    onClick={() => handleGetTaskById(task.id)}
                    className="bg-[#0a1e5e]"
                  >
                    View
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}