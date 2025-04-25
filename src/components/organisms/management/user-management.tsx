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
import { Trash2, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// Mock data
const mockUsers = [
  { id: "1", firstName: "John", lastName: "Doe", email: "john@example.com", role: "WORKER" },
  { id: "2", firstName: "Jane", lastName: "Smith", email: "jane@example.com", role: "ADMIN" },
  { id: "3", firstName: "Bob", lastName: "Johnson", email: "bob@example.com", role: "WORKER" },
];

export default function UserManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "WORKER",
  });

  const handleCreateUser = () => {
    console.log("Create user:", newUser);
    setIsModalOpen(false);
    setNewUser({ firstName: "", lastName: "", email: "", role: "WORKER" });
  };

  const handleDeleteUser = (id: string) => {
    console.log("Delete user:", id);
  };

  const handleViewUserDetails = (id: string) => {
    setSelectedUserId(id);
  };

  // Find selected user from mock data
  const selectedUser = mockUsers.find(user => user.id === selectedUserId);

  return (
    <div className={`p-6 bg-gray-50 ${selectedUserId ? "blur-sm" : ""}`}>
      <div className="flex justify-end items-center mb-6">
        <Button
          className="flex items-center gap-2 bg-[#001333] text-white rounded shadow"
          onClick={() => setIsModalOpen(true)}
        >
          <UserPlus size={16} /> Create User
        </Button>
      </div>

      <Dialog
        open={isModalOpen}
        onOpenChange={() => setIsModalOpen(!isModalOpen)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>

          <div className="bg-white mt-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="First Name"
                value={newUser.firstName}
                onChange={(e) =>
                  setNewUser({ ...newUser, firstName: e.target.value })
                }
                className="w-full p-3 mb-3 border rounded"
              />
              <Input
                type="text"
                placeholder="Last Name"
                value={newUser.lastName}
                onChange={(e) =>
                  setNewUser({ ...newUser, lastName: e.target.value })
                }
                className="w-full p-3 mb-3 border rounded"
              />
            </div>
            <Input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              className="w-full p-3 mb-3 border rounded"
            />

            <Select
              onValueChange={(value) =>
                setNewUser((prev) => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue className="bg-white" placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="WORKER">Worker</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="COMPANY_REPRESENTATIVE">
                  Company Representative
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="mt-8 gap-4 flex justify-end">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedUserId}
        onOpenChange={() => setSelectedUserId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail User</DialogTitle>
          </DialogHeader>
          <div className="mb-8">
            <div className="grid grid-cols-2">
              <p className="font-semibold">First Name </p>
              <p>: {selectedUser?.firstName}</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="font-semibold">Last Name </p>
              <p>: {selectedUser?.lastName}</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="font-semibold">Email </p>
              <p>: {selectedUser?.email}</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="font-semibold">Role </p>
              <p>: {selectedUser?.role}</p>
            </div>
          </div>
          <Button onClick={() => setSelectedUserId(null)}>Close</Button>
        </DialogContent>
      </Dialog>

      <div className="bg-white p-6 border rounded shadow">
        <Table>
          <TableCaption>A list of users.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold text-primary">Name</TableHead>
              <TableHead className="font-semibold text-primary">Email</TableHead>
              <TableHead className="font-semibold text-primary">Role</TableHead>
              <TableHead className="font-semibold text-right text-primary">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span
                    className={`text-sm px-4 py-1 rounded-lg ${
                      user.role === "WORKER"
                        ? "bg-green-500 text-white border border-green-700"
                        : "bg-orange-500 text-white border border-orange-700"
                    }`}
                  >
                    {user.role}
                  </span>
                </TableCell>
                <TableCell className="text-right flex items-center gap-2 justify-end">
                  <Button
                    onClick={() => handleViewUserDetails(user.id)}
                    className="bg-[#0a1e5e]"
                  >
                    View
                  </Button>
                  <Button
                    onClick={() => handleDeleteUser(user.id)}
                    variant="destructive"
                  >
                    <Trash2 size={14} />
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