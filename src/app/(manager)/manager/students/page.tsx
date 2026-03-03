"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  BookOpen,
  Loader2,
  Trash2,
  Edit,
  AlertTriangle,
  Mail,
  Phone,
  X,
  Upload,
  Download,
  Camera,
} from "lucide-react";

interface Student {
  _id: string;
  name: string;
  whatsappNumber: string;
  email?: string;
  status: string;
  profilePhoto?: string;
  profilePhotoThumbnail?: string;
  createdAt: string;
  skillLevel: string;
  city?: string;
  gender?: string;
  fideId?: string;
  totalStudyHours: number;
  totalCoursesCompleted: number;
}

export default function ManagerStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newProfilePhoto, setNewProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    setLoading(true);
    try {
      const res = await fetch("/api/manager/students");
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.whatsappNumber.includes(searchQuery) ||
      (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setNewProfilePhoto(null);
    setPhotoPreview(null);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingStudent(null);
    setNewProfilePhoto(null);
    setPhotoPreview(null);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    setIsSaving(true);
    try {
      let finalPhoto = editingStudent.profilePhoto;
      let finalThumbnail = editingStudent.profilePhotoThumbnail;

      if (newProfilePhoto) {
        // Upload photo first
        const photoFormData = new FormData();
        // Since we don't have a reliable way to make an ideal thumbnail on the frontend without canvas, we'll just send the same file for both for managers overriding it
        photoFormData.append("profilePicture", newProfilePhoto);
        photoFormData.append("profilePictureThumbnail", newProfilePhoto);

        const photoRes = await fetch(
          `/api/manager/students/${editingStudent._id}/photo`,
          {
            method: "POST",
            body: photoFormData,
          },
        );

        if (photoRes.ok) {
          const photoData = await photoRes.json();
          finalPhoto = photoData.profilePhoto;
          finalThumbnail = photoData.profilePhotoThumbnail;
        } else {
          console.error("Failed to upload photo");
          alert(
            "Failed to upload the profile picture, but we'll try saving the other details.",
          );
        }
      }

      const res = await fetch(`/api/manager/students/${editingStudent._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingStudent),
      });

      if (res.ok) {
        setStudents((prev) =>
          prev.map((s) =>
            s._id === editingStudent._id
              ? {
                  ...editingStudent,
                  profilePhoto: finalPhoto,
                  profilePhotoThumbnail: finalThumbnail,
                }
              : s,
          ),
        );
        closeEditModal();
      } else {
        alert("Failed to update student.");
      }
    } catch (error) {
      console.error("Error updating:", error);
      alert("Error saving updates.");
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteModal = (student: Student) => {
    setStudentToDelete(student);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setStudentToDelete(null);
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/manager/students/${studentToDelete._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setStudents((prev) =>
          prev.map((s) =>
            s._id === studentToDelete._id ? { ...s, status: "suspended" } : s,
          ),
        );
        closeDeleteModal();
      } else {
        alert("Failed to suspend student.");
      }
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 relative z-10 p-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
            Students
          </h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">
            Manage all student accounts, update details, or suspend users.
          </p>
        </div>
      </div>

      {/* Top Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-gray-900/5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search students by name, number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-500 transition-shadow sm:text-sm font-medium"
          />
        </div>
        <div className="text-sm font-medium text-gray-500 bg-gray-50 px-4 py-2 rounded-xl">
          Total {filteredStudents.length}{" "}
          {filteredStudents.length === 1 ? "student" : "students"}
        </div>
      </div>

      {/* Table Section */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 text-center">
          <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No students found</h3>
          <p className="text-gray-500 mt-2 text-sm max-w-sm mx-auto">
            {searchQuery
              ? `No users matching "${searchQuery}"`
              : "There are currently no students registered."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 overflow-hidden">
          <div className="hidden md:grid md:grid-cols-[1.5fr_1.5fr_1fr_1fr_120px] gap-4 px-8 py-4 bg-gray-50/80 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Student
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Contact
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Status
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Joined
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
              Action
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredStudents.map((student) => (
              <div
                key={student._id}
                className="grid grid-cols-1 md:grid-cols-[1.5fr_1.5fr_1fr_1fr_120px] gap-3 md:gap-4 px-8 py-5 items-center hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {student.profilePhotoThumbnail || student.profilePhoto ? (
                    <img
                      src={
                        student.profilePhotoThumbnail || student.profilePhoto
                      }
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-100 bg-white"
                    />
                  ) : (
                    <div className="w-10 h-10 shrink-0 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="truncate text-left w-full">
                    <div className="text-sm font-bold text-gray-900 truncate">
                      {student.name}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {student.skillLevel}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 truncate pr-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{student.whatsappNumber}</span>
                  </div>
                  {student.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  {student.status === "active" ? (
                    <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-200/50 uppercase tracking-widest">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold rounded-md border border-red-200/50 uppercase tracking-widest">
                      SUSPENDED
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  {new Date(student.createdAt).toLocaleDateString()}
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(student)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title="Edit Student"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(student)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Suspend Student"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-gray-900/10">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-extrabold text-gray-900">
                Edit Student Details
              </h2>
              <button
                onClick={closeEditModal}
                className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-6">
              {/* Profile Photo Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100 mb-2">
                <div className="relative group">
                  {photoPreview ||
                  editingStudent.profilePhotoThumbnail ||
                  editingStudent.profilePhoto ? (
                    <img
                      src={
                        photoPreview ||
                        editingStudent.profilePhotoThumbnail ||
                        editingStudent.profilePhoto
                      }
                      alt={editingStudent.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-3xl border-4 border-white shadow-lg">
                      {editingStudent.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <label className="absolute bottom-0 right-0 p-2 bg-red-600 text-white rounded-full cursor-pointer hover:bg-red-700 hover:scale-110 transition-all shadow-md">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h3 className="text-base font-bold text-gray-900">
                    Profile Picture
                  </h3>
                  <p className="text-xs text-gray-500">
                    Upload a new square image. JPG, PNG, or WebP.
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors">
                      <Upload className="w-3.5 h-3.5" /> Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>

                    {editingStudent.profilePhoto && (
                      <a
                        href={editingStudent.profilePhoto}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 shadow-sm border border-gray-200 rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Original
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editingStudent.name || ""}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={editingStudent.whatsappNumber || ""}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        whatsappNumber: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editingStudent.email || ""}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    value={editingStudent.city || ""}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        city: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Skill Level
                  </label>
                  <select
                    value={editingStudent.skillLevel || "beginner"}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        skillLevel: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Account Status
                  </label>
                  <select
                    value={editingStudent.status || "active"}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-6 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete/Suspend Modal */}
      {deleteModalOpen && studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl ring-1 ring-gray-900/10 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Suspend Student?
              </h3>
              <p className="text-gray-500 text-sm mb-8">
                Are you sure you want to suspend{" "}
                <strong className="text-gray-800">
                  {studentToDelete.name}
                </strong>
                ? They will no longer be able to log into the platform. You can
                reactivate them later by editing their profile.
              </p>

              <div className="flex w-full gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 py-3 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Suspend"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
