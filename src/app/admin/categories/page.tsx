"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { Category } from "@/lib/types";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { slugify } from "@/lib/utils";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);

  // 폼 상태
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setSortOrder(cat.sort_order);
    setShowNew(false);
  }

  function startNew() {
    setShowNew(true);
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setSortOrder(categories.length);
  }

  function cancel() {
    setEditingId(null);
    setShowNew(false);
  }

  async function handleSave() {
    if (!name) return;
    const finalSlug = slug || slugify(name);

    if (editingId) {
      const res = await fetch(`/api/admin/categories/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: finalSlug, description, sort_order: sortOrder }),
      });
      if (res.ok) {
        await fetchCategories();
        setEditingId(null);
      }
    } else {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: finalSlug, description, sort_order: sortOrder }),
      });
      if (res.ok) {
        await fetchCategories();
        setShowNew(false);
      }
    }
  }

  async function handleDelete(id: number, catName: string) {
    if (!confirm(`"${catName}" 카테고리를 삭제하시겠습니까?`)) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  }

  function CategoryForm() {
    return (
      <tr className="border-b border-dark-border bg-dark/50">
        <td className="px-4 py-2">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!editingId) setSlug(slugify(e.target.value));
            }}
            placeholder="카테고리명"
            className="w-full bg-dark border border-dark-border rounded px-2 py-1 text-sm text-text focus:outline-none focus:border-gold"
            autoFocus
          />
        </td>
        <td className="px-4 py-2">
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="slug"
            className="w-full bg-dark border border-dark-border rounded px-2 py-1 text-sm text-text-muted focus:outline-none focus:border-gold"
          />
        </td>
        <td className="px-4 py-2 hidden md:table-cell">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="설명"
            className="w-full bg-dark border border-dark-border rounded px-2 py-1 text-sm text-text-muted focus:outline-none focus:border-gold"
          />
        </td>
        <td className="px-4 py-2">
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-16 bg-dark border border-dark-border rounded px-2 py-1 text-sm text-text-muted text-center focus:outline-none focus:border-gold"
          />
        </td>
        <td className="px-4 py-2 text-right">
          <div className="flex items-center justify-end gap-1">
            <button onClick={handleSave} className="p-1.5 text-gold hover:bg-dark rounded transition">
              <Save size={14} />
            </button>
            <button onClick={cancel} className="p-1.5 text-text-muted hover:text-red-400 hover:bg-dark rounded transition">
              <X size={14} />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <>
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-serif font-bold text-white">카테고리 관리</h1>
          <button
            onClick={startNew}
            className="flex items-center gap-1.5 bg-gold text-dark px-4 py-2 rounded-lg text-sm font-medium hover:bg-gold-light transition"
          >
            <Plus size={16} />
            추가
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-text-muted">불러오는 중...</div>
        ) : (
          <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border text-left">
                  <th className="px-4 py-3 text-xs text-text-muted font-medium">이름</th>
                  <th className="px-4 py-3 text-xs text-text-muted font-medium">슬러그</th>
                  <th className="px-4 py-3 text-xs text-text-muted font-medium hidden md:table-cell">설명</th>
                  <th className="px-4 py-3 text-xs text-text-muted font-medium text-center">순서</th>
                  <th className="px-4 py-3 text-xs text-text-muted font-medium text-right">관리</th>
                </tr>
              </thead>
              <tbody>
                {showNew && <CategoryForm />}
                {categories.map((cat) =>
                  editingId === cat.id ? (
                    <CategoryForm key={cat.id} />
                  ) : (
                    <tr key={cat.id} className="border-b border-dark-border/50 hover:bg-dark/30">
                      <td className="px-4 py-3 text-sm text-white">{cat.name}</td>
                      <td className="px-4 py-3 text-xs text-text-muted">{cat.slug}</td>
                      <td className="px-4 py-3 text-xs text-text-muted hidden md:table-cell">{cat.description}</td>
                      <td className="px-4 py-3 text-xs text-text-muted text-center">{cat.sort_order}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(cat)}
                            className="p-1.5 text-text-muted hover:text-gold hover:bg-dark rounded transition"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id, cat.name)}
                            className="p-1.5 text-text-muted hover:text-red-400 hover:bg-dark rounded transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
