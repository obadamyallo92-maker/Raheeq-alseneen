/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MessageSquare, HelpCircle, Lightbulb, User, Trash2, Send, Clock } from 'lucide-react';

export interface Comment {
  id: string;
  itemId: string;
  authorName: string;
  type: 'question' | 'benefit';
  content: string;
  timestamp: string;
}

interface ItemCommentsProps {
  itemId: string;
  itemTitle: string;
}

export default function ItemComments({ itemId, itemTitle }: ItemCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  // Form State
  const [authorName, setAuthorName] = useState(() => {
    return localStorage.getItem('commenter_name') || '';
  });
  const [type, setType] = useState<'question' | 'benefit'>('question');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  // Load comments
  useEffect(() => {
    const loadComments = () => {
      const allComments: Comment[] = JSON.parse(localStorage.getItem('item_comments_data') || '[]');
      const filtered = allComments.filter(c => c.itemId === itemId);
      setComments(filtered);
    };
    loadComments();

    // Listen for storage changes if multiple components are open
    const handleStorageChange = () => loadComments();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [itemId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!authorName.trim()) {
      setError('الرجاء إدخال اسمكم الكريم أو كتابة (طالب علم)');
      return;
    }
    if (!content.trim()) {
      setError('الرجاء كتابة نص السؤال أو الفائدة');
      return;
    }

    const newComment: Comment = {
      id: Math.random().toString(36).substring(2, 9),
      itemId,
      authorName: authorName.trim(),
      type,
      content: content.trim(),
      timestamp: new Date().toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // Save persistent name
    localStorage.setItem('commenter_name', authorName.trim());

    // Update localStorage
    const allComments: Comment[] = JSON.parse(localStorage.getItem('item_comments_data') || '[]');
    allComments.unshift(newComment);
    localStorage.setItem('item_comments_data', JSON.stringify(allComments));

    // Update state
    setComments(prev => [newComment, ...prev]);
    setContent('');
  };

  const handleDelete = (commentId: string) => {
    const allComments: Comment[] = JSON.parse(localStorage.getItem('item_comments_data') || '[]');
    const updated = allComments.filter(c => c.id !== commentId);
    localStorage.setItem('item_comments_data', JSON.stringify(updated));
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  return (
    <div className="border-t border-gray-100 pt-4 mt-4" dir="rtl">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs font-bold text-gray-700 hover:text-[#0c2e24] flex items-center gap-2 bg-gray-50 hover:bg-[#0c2e24]/5 px-3 py-1.5 rounded-lg border border-gray-200/50 transition-all cursor-pointer"
        id={`toggle-comments-${itemId}`}
      >
        <MessageSquare size={14} className="text-[#c5a059]" />
        <span>الأسئلة والفوائد المستفادة</span>
        <span className="bg-[#8c5e3c]/15 text-[#8c5e3c] px-1.5 py-0.5 rounded-md font-mono text-[10px] font-black">
          {comments.length}
        </span>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="mt-4 space-y-4 animate-fade-in">
          {/* Comments List */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-[11px] text-gray-400 text-center py-4 font-serif bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                لا توجد أسئلة أو فوائد مكتوبة حالياً. كن أول من يضيف فائدة أو يطرح سؤالاً!
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-3.5 rounded-xl border text-xs relative group transition-all ${
                    comment.type === 'question'
                      ? 'bg-amber-50/40 border-amber-100/70'
                      : 'bg-[#faf9f6] border-[#c5a059]/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-md ${
                        comment.type === 'question' ? 'bg-amber-100 text-amber-800' : 'bg-[#e2c17c]/20 text-[#8c5e3c]'
                      }`}>
                        {comment.type === 'question' ? <HelpCircle size={12} /> : <Lightbulb size={12} />}
                      </div>
                      <span className="font-bold text-gray-900">{comment.authorName}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold bg-white shadow-xs border border-gray-100">
                        {comment.type === 'question' ? 'سؤال استفساري' : 'فائدة مستخلصة'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-gray-400 flex items-center gap-1">
                        <Clock size={10} />
                        {comment.timestamp}
                      </span>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded-sm transition-all cursor-pointer"
                        title="حذف التعليق"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 font-serif leading-relaxed text-right pr-6 whitespace-pre-line">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Form to add a comment */}
          <form onSubmit={handleSubmit} className="bg-gray-50/60 border border-gray-150 p-4 rounded-xl space-y-3">
            <h5 className="font-sans font-bold text-[11px] text-[#0c2e24]">طرح سؤال أو تدوين فائدة مستفادة:</h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Author Name */}
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1">الاسم الكريم (أو طالب علم)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 pointer-events-none">
                    <User size={12} />
                  </span>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="مثال: طالب علم / أحمد العتيبي"
                    className="w-full pr-8 pl-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-hidden focus:ring-1 focus:ring-[#8c5e3c]"
                  />
                </div>
              </div>

              {/* Comment Type */}
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1">نوع المشاركة</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('question')}
                    className={`py-2 text-[11px] font-bold rounded-lg border text-center transition-all cursor-pointer ${
                      type === 'question'
                        ? 'bg-amber-150 text-amber-950 border-amber-300 shadow-xs'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    سؤال واستفسار
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('benefit')}
                    className={`py-2 text-[11px] font-bold rounded-lg border text-center transition-all cursor-pointer ${
                      type === 'benefit'
                        ? 'bg-[#e2c17c]/20 text-[#8c5e3c] border-[#e2c17c]/60 shadow-xs'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    فائدة مستفادة
                  </button>
                </div>
              </div>
            </div>

            {/* Comment Content */}
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-1">نص الرسالة</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  type === 'question'
                    ? 'اكتب سؤالك لفضيلة الشيخ نصر بركات حول مضمون هذه المادة العلمية...'
                    : 'دون الفائدة التي استخلصتها لتعم المنفعة والبركة بين إخوانك طلاب العلم...'
                }
                rows={3}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-hidden focus:ring-1 focus:ring-[#8c5e3c] leading-relaxed font-serif"
              />
            </div>

            {error && <p className="text-[10px] text-rose-600 font-bold">{error}</p>}

            <button
              type="submit"
              className="w-full bg-[#8c5e3c] hover:bg-[#66462c] text-white py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Send size={12} className="-rotate-12" />
              <span>نشر المشاركة</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
