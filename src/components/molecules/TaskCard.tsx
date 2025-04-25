import Link from "next/link";

type Task = {
  id: string;
  title: string;
  description: string;
  question: string;
};

type TaskCardProps = {
  task: Task;
};

export default function TaskCard({ task }: TaskCardProps) {
  return (
    <Link
      href={`/eval/${task.id}`}
      className="bg-white/10 p-4 rounded-lg shadow-md hover:shadow-lg transition hover:bg-white/20 block"
    >
      <h2 className="text-xl font-semibold mb-2 text-white">{task.title}</h2>
      <p className="text-gray-300 mb-4">{task.description}</p>
      <p className="text-sm text-gray-400">Question: {task.question}</p>
    </Link>
  );
}