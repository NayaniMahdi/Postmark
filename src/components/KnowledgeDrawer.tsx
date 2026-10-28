'use client';

import React from 'react';
import { X, BookOpen, CheckCircle, Tag, Clock } from 'lucide-react';
import { KnowledgeArticle } from '@/types';

interface KnowledgeDrawerProps {
  article: KnowledgeArticle | null;
  onClose: () => void;
}

export const KnowledgeDrawer: React.FC<KnowledgeDrawerProps> = ({ article, onClose }) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full max-w-lg bg-[#FAF9F5] h-full shadow-2xl border-l border-[#E7E3DA] flex flex-col p-6 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#292B27] text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-[#A4A69D] uppercase">
                Grounded Knowledge Article
              </span>
              <h2 className="text-base font-bold text-[#292B27]">{article.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#777970] hover:text-[#292B27] hover:bg-black/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF3] text-[#027A48] border border-[#A6F4C5] flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-[#12B76A]" />
            <span>Approved (v{article.version})</span>
          </span>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-white text-[#50524B] border border-[#E7E3DA] flex items-center gap-1">
            <Tag className="w-3 h-3 text-[#777970]" />
            <span>{article.category}</span>
          </span>
          <span className="text-xs text-[#777970] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Updated {new Date(article.updated_at).toLocaleDateString()}</span>
          </span>
        </div>

        {/* Excerpt */}
        <div className="p-3.5 rounded-xl bg-white/80 border border-[#E7E3DA] text-xs font-medium text-[#50524B] italic">
          "{article.excerpt}"
        </div>

        {/* Full Article Content */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#292B27] uppercase tracking-wider">
            Approved Policy Content
          </h3>
          <div className="p-4 rounded-xl bg-white border border-[#E7E3DA] text-xs text-[#292B27] leading-relaxed whitespace-pre-wrap font-sans">
            {article.content}
          </div>
        </div>

        {/* Audit notice */}
        <div className="p-3 rounded-xl bg-[#F2EFE9] text-[11px] text-[#777970] leading-snug">
          This article version was explicitly attached as grounding context to the AI drafting model. No external or fabricated policies were introduced.
        </div>
      </div>
    </div>
  );
};
