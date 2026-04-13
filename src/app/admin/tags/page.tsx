"use client";
import React, { useEffect, useState } from "react";

interface Tag {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

const TagsAdminPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState({ name: "", slug: "" });
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editValues, setEditValues] = useState({ name: "", slug: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tags");
      const data = await res.json();
      setTags(data.tags || []);
    } catch (e) {
      setError("Failed to fetch tags");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!newTag.name.trim() || !newTag.slug.trim()) {
      setError("Name and slug are required");
      return;
    }
    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTag),
      });
      if (res.ok) {
        setNewTag({ name: "", slug: "" });
        setSuccess("Tag created");
        fetchTags();
      } else {
        const err = await res.json();
        setError(err.error || "Failed to create tag");
      }
    } catch {
      setError("Failed to create tag");
    }
  };

  const startEdit = (tag: Tag) => {
    setEditingTag(tag);
    setEditValues({ name: tag.name, slug: tag.slug });
    setError("");
    setSuccess("");
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag) return;
    setError("");
    setSuccess("");
    if (!editValues.name.trim() || !editValues.slug.trim()) {
      setError("Name and slug are required");
      return;
    }
    try {
      const res = await fetch("/api/admin/tags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingTag.id, ...editValues }),
      });
      if (res.ok) {
        setEditingTag(null);
        setSuccess("Tag updated");
        fetchTags();
      } else {
        const err = await res.json();
        setError(err.error || "Failed to update tag");
      }
    } catch {
      setError("Failed to update tag");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this tag?")) return;
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/tags", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setSuccess("Tag deleted");
        fetchTags();
      } else {
        const err = await res.json();
        setError(err.error || "Failed to delete tag");
      }
    } catch {
      setError("Failed to delete tag");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[10px] shadow-1 p-6">
        <h1 className="text-2xl font-semibold text-dark mb-1">Tag Management</h1>
        <p className="text-gray-6">Create, edit, and delete tags for blog posts.</p>
      </div>
      <div className="bg-white rounded-[10px] shadow-1 p-6">
        <h2 className="text-lg font-semibold text-dark mb-4">Create New Tag</h2>
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-7 mb-1">Name</label>
            <input
              type="text"
              value={newTag.name}
              onChange={e => setNewTag({ ...newTag, name: e.target.value })}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
              placeholder="Tag name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-7 mb-1">Slug</label>
            <input
              type="text"
              value={newTag.slug}
              onChange={e => setNewTag({ ...newTag, slug: e.target.value })}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
              placeholder="tag-slug"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-forest text-white rounded-md hover:bg-dark/90 disabled:opacity-50"
            disabled={loading}
          >
            Add Tag
          </button>
        </form>
        {error && <p className="text-red mt-2">{error}</p>}
        {success && <p className="text-green-700 mt-2">{success}</p>}
      </div>
      <div className="bg-white rounded-[10px] shadow-1 p-6">
        <h2 className="text-lg font-semibold text-dark mb-4">All Tags</h2>
        {loading ? (
          <div>Loading...</div>
        ) : tags.length === 0 ? (
          <div className="text-gray-6">No tags found.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2 font-medium text-gray-6">Name</th>
                <th className="text-left p-2 font-medium text-gray-6">Slug</th>
                <th className="text-left p-2 font-medium text-gray-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tags.map(tag => (
                <tr key={tag.id} className="border-b border-gray-3">
                  <td className="p-2">
                    {editingTag?.id === tag.id ? (
                      <input
                        type="text"
                        value={editValues.name}
                        onChange={e => setEditValues(v => ({ ...v, name: e.target.value }))}
                        className="px-2 py-1 border rounded-md"
                      />
                    ) : (
                      tag.name
                    )}
                  </td>
                  <td className="p-2">
                    {editingTag?.id === tag.id ? (
                      <input
                        type="text"
                        value={editValues.slug}
                        onChange={e => setEditValues(v => ({ ...v, slug: e.target.value }))}
                        className="px-2 py-1 border rounded-md"
                      />
                    ) : (
                      tag.slug
                    )}
                  </td>
                  <td className="p-2">
                    {editingTag?.id === tag.id ? (
                      <>
                        <button
                          onClick={handleEdit}
                          className="px-3 py-1 bg-green-600 text-white rounded-md mr-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingTag(null)}
                          className="px-3 py-1 bg-gray-3 text-dark rounded-md"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(tag)}
                          className="px-3 py-1 bg-forest text-white rounded-md mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tag.id)}
                          className="px-3 py-1 bg-red text-white rounded-md"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TagsAdminPage;
