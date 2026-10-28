'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  CheckCircle,
  Tag,
  Clock,
  Edit2,
  Trash2,
  FileText,
} from 'lucide-react';
import { KnowledgeArticle } from '@/types';

export const KnowledgeBaseView: React.FC = () => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<KnowledgeArticle['category']>('Billing');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');

  const loadArticles = () => {
    fetch('/api/knowledge')
      .then((res) => res.json())
      .then((data) => {
        if (data.articles) setArticles(data.articles);
      });
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const categories = ['All', 'Billing', 'Technical', 'Security', 'Sales', 'General'];

  const filtered = articles.filter((a) => {
    const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenEdit = (art: KnowledgeArticle) => {
    setSelectedArticle(art);
    setTitle(art.title);
    setCategory(art.category);
    setExcerpt(art.excerpt);
    setContent(art.content);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleOpenCreate = () => {
    setSelectedArticle(null);
    setTitle('');
    setCategory('Billing');
    setExcerpt('');
    setContent('');
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) {
      await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          excerpt,
          content,
          status: 'approved',
          version: 1,
        }),
      });
    } else if (selectedArticle) {
      await fetch(`/api/knowledge/${selectedArticle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, excerpt, content }),
      });
    }
    setIsEditing(false);
    setIsCreating(false);
    loadArticles();
  };

  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto select-none bg-white/40">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#292B27] tracking-tight">Approved Company Knowledge Base</h1>
          <p className="text-xs text-[#777970] mt-0.5">
            Only approved articles are used by the AI model to ground reply drafts and cite factual guidelines
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#292B27] text-white hover:bg-black transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </button>
      </div>

      {/* Search & Categories Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#777970]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search policies, refunds, troubleshooting..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#E7E3DA] text-xs text-[#292B27] focus:outline-none focus:border-[#292B27]"
          />
        </div>

        <div className="flex items-center gap-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                selectedCategory === c
                  ? 'bg-[#292B27] text-white shadow-xs'
                  : 'bg-white text-[#777970] hover:text-[#292B27] border border-[#E7E3DA]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((art) => (
          <div
            key={art.id}
            className="p-5 rounded-2xl bg-white border border-[#E7E3DA] hover:border-[#292B27] transition shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF3] text-[#027A48] border border-[#A6F4C5] flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-[#12B76A]" />
                  <span>v{art.version} Approved</span>
                </span>
                <span className="text-[11px] font-medium text-[#777970] bg-[#F2EFE9] px-2 py-0.5 rounded-full">
                  {art.category}
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#292B27] leading-snug">{art.title}</h3>
              <p className="text-xs text-[#777970] line-clamp-3 leading-relaxed">{art.excerpt}</p>
            </div>

            <div className="pt-3 border-t border-[#F2EFE9] flex items-center justify-between text-xs">
              <span className="text-[10px] text-[#A4A69D]">
                {new Date(art.updated_at).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleOpenEdit(art)}
                className="flex items-center gap-1 text-[#4F46E5] hover:underline font-semibold text-xs"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit & Version</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      {(isEditing || isCreating) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-[#FAF9F5] rounded-3xl shadow-2xl border border-[#E7E3DA] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E3DA] pb-3">
              <h2 className="text-sm font-bold text-[#292B27]">
                {isCreating ? 'Create Approved Knowledge Article' : `Update Article (v${selectedArticle?.version || 1})`}
              </h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setIsCreating(false);
                }}
                className="p-1 rounded-lg text-[#777970] hover:bg-black/5"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#50524B] font-semibold mb-1">Article Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Duplicate Payment Policy"
                  className="w-full bg-white p-2 rounded-xl border border-[#E7E3DA]"
                />
              </div>

              <div>
                <label className="block text-[#50524B] font-semibold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-white p-2 rounded-xl border border-[#E7E3DA]"
                >
                  <option value="Billing">Billing</option>
                  <option value="Technical">Technical</option>
                  <option value="Security">Security</option>
                  <option value="Sales">Sales</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-[#50524B] font-semibold mb-1">Short Summary / Excerpt</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  required
                  className="w-full bg-white p-2 rounded-xl border border-[#E7E3DA]"
                />
              </div>

              <div>
                <label className="block text-[#50524B] font-semibold mb-1">Authoritative Policy Text</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  required
                  className="w-full bg-white p-2 rounded-xl border border-[#E7E3DA] font-sans"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setIsCreating(false);
                  }}
                  className="px-4 py-1.5 rounded-full text-xs font-medium text-[#777970]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#292B27] text-white hover:bg-black"
                >
                  {isCreating ? 'Publish Article' : 'Save New Version'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
