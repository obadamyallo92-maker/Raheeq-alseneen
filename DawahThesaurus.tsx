/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Lightbulb, DollarSign, Users, Briefcase, Plus, Search, Trash2, Check, Sparkles, X } from 'lucide-react';
import { DawahIdea, DawahIdeaRole } from '../types';
import { DAWAH_IDEAS_DATA } from '../data';

export default function DawahThesaurus() {
  const [ideas, setIdeas] = useState<DawahIdea[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // New Idea Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newPeopleCount, setNewPeopleCount] = useState(1);
  const [newRoles, setNewRoles] = useState<DawahIdeaRole[]>([{ roleName: '', qualifications: '' }]);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load ideas on mount
  useEffect(() => {
    const saved: DawahIdea[] = JSON.parse(localStorage.getItem('dawah_ideas') || '[]');
    if (saved.length === 0) {
      // Seed with initial data
      localStorage.setItem('dawah_ideas', JSON.stringify(DAWAH_IDEAS_DATA));
      setIdeas(DAWAH_IDEAS_DATA);
    } else {
      setIdeas(saved);
    }
  }, []);

  // Sync to local storage on changes
  const saveToLocalStorage = (updated: DawahIdea[]) => {
    localStorage.setItem('dawah_ideas', JSON.stringify(updated));
    setIdeas(updated);
  };

  const handleAddRoleField = () => {
    setNewRoles([...newRoles, { roleName: '', qualifications: '' }]);
  };

  const handleRemoveRoleField = (index: number) => {
    if (newRoles.length === 1) return;
    setNewRoles(newRoles.filter((_, idx) => idx !== index));
  };

  const handleRoleChange = (index: number, field: keyof DawahIdeaRole, value: string) => {
    const updated = [...newRoles];
    updated[index][field] = value;
    setNewRoles(updated);
  };

  const handleCreateIdea = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!newTitle.trim()) {
      setFormError('يرجى كتابة عنوان الفكرة الدعوية');
      return;
    }
    if (!newDescription.trim()) {
      setFormError('يرجى وصف الفكرة الدعوية وكيفية تطبيقها');
      return;
    }
    if (!newBudget.trim()) {
      setFormError('يرجى تحديد الميزانية المطلوبة (أو كتابة ميزانية يسيرة / صفرية)');
      return;
    }

    // Check if any role is empty
    const invalidRole = newRoles.some(r => !r.roleName.trim() || !r.qualifications.trim());
    if (invalidRole) {
      setFormError('يرجى كتابة اسم الوظيفة والمؤهلات المطلوبة لكل دور مضاف');
      return;
    }

    const newIdea: DawahIdea = {
      id: 'custom_' + Math.random().toString(36).substring(2, 9),
      title: newTitle,
      description: newDescription,
      budget: newBudget,
      peopleCount: newPeopleCount,
      roles: newRoles,
    };

    const updated = [newIdea, ...ideas];
    saveToLocalStorage(updated);

    // Reset Form
    setNewTitle('');
    setNewDescription('');
    setNewBudget('');
    setNewPeopleCount(1);
    setNewRoles([{ roleName: '', qualifications: '' }]);
    setSuccessMessage('تمت إضافة فكرتكم الدعوية بنجاح لمكنز الأفكار!');
    setIsAddingNew(false);

    // Clear success message after 4 seconds
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleDeleteIdea = (id: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذه الفكرة من المكنز الشخصي؟')) {
      const updated = ideas.filter(idea => idea.id !== id);
      saveToLocalStorage(updated);
    }
  };

  const handleResetThesaurus = () => {
    if (confirm('هل ترغب في إعادة ضبط مكنز الأفكار وحذف جميع الأفكار المضافة يدوياً؟')) {
      localStorage.setItem('dawah_ideas', JSON.stringify(DAWAH_IDEAS_DATA));
      setIdeas(DAWAH_IDEAS_DATA);
    }
  };

  const filteredIdeas = ideas.filter(idea => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      idea.title.toLowerCase().includes(term) ||
      idea.description.toLowerCase().includes(term) ||
      idea.budget.toLowerCase().includes(term) ||
      idea.roles.some(role => 
        role.roleName.toLowerCase().includes(term) || 
        role.qualifications.toLowerCase().includes(term)
      )
    );
  });

  return (
    <div className="space-y-6" id="dawah-thesaurus-container" dir="rtl">
      
      {/* Top Controls: Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#faf9f6] p-5 rounded-2xl border border-gray-200/60">
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8c5e3c]" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3.5 pr-10 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#8c5e3c] focus:border-[#8c5e3c] bg-white transition-all"
            placeholder="البحث في مكنز الأفكار (عن فكرة، وظيفة، مؤهل، ميزانية)..."
            id="thesaurus-search-input"
          />
        </div>
        
        <div className="flex gap-2.5 w-full sm:w-auto">
          <button 
            onClick={() => {
              setIsAddingNew(!isAddingNew);
              setFormError('');
              setSuccessMessage('');
            }}
            className="flex-1 sm:flex-none bg-[#8c5e3c] hover:bg-[#66462c] text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            id="thesaurus-add-btn"
          >
            {isAddingNew ? <X size={15} /> : <Plus size={15} />}
            {isAddingNew ? 'إغلاق نافذة الإضافة' : 'اقترح فكرة دعوية جديدة'}
          </button>
          
          {ideas.length !== DAWAH_IDEAS_DATA.length && (
            <button 
              onClick={handleResetThesaurus}
              className="px-3.5 py-2.5 border border-gray-200 text-[#8c5e3c] hover:bg-[#faf9f6] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="إعادة ضبط المكنز للمحتوى الأصلي"
              id="thesaurus-reset-btn"
            >
              إعادة ضبط
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-amber-50 border border-amber-100 text-[#8c5e3c] p-4 rounded-xl flex items-center gap-3 animate-fade-in" id="thesaurus-success-banner">
          <Sparkles className="text-[#c5a059] animate-pulse" size={18} />
          <p className="text-xs font-semibold">{successMessage}</p>
        </div>
      )}

      {/* Suggestion Form Section */}
      {isAddingNew && (
        <div className="bg-[#faf9f6] p-6 rounded-2xl border border-gray-200 space-y-4 animate-fade-in" id="thesaurus-add-form-container">
          <div className="flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-2.5 mb-2">
            <Lightbulb className="text-[#c5a059]" size={18} />
            <h4 className="font-serif font-bold text-sm">اقترح فكرة دعوية لإضافتها لمكنز الأفكار</h4>
          </div>

          {formError && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 px-3.5 py-2 rounded-xl text-xs">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateIdea} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Idea Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-800 mb-1">اسم الفكرة الدعوية المقترحة</label>
                <input 
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl bg-white"
                  placeholder="مثال: منصة ترجمة مقاطع الفيديوهات القصيرة للغة الصينية"
                  id="idea-title-input"
                />
              </div>

              {/* Budget */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1">الميزانية التقديرية المطلوبة</label>
                <input 
                  type="text"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl bg-white"
                  placeholder="مثال: 3000 دولار (أو صفرية / يسيرة)"
                  id="idea-budget-input"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">شرح وتفاصيل الفكرة الدعوية</label>
              <textarea 
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl bg-white"
                placeholder="اشرح فكرتك، وما المشكلة التي تعالجها، وكيف يمكن تطبيقها على أرض الواقع..."
                id="idea-desc-textarea"
              />
            </div>

            {/* People Count Slider */}
            <div className="bg-white p-4 rounded-xl border border-gray-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-900">عدد الأشخاص المطلوب لتنفيذ المبادرة</label>
                <p className="text-[11px] text-gray-500 mt-0.5 font-serif">حدد إجمالي فريق العمل الميداني أو التقني</p>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="range"
                  min="1"
                  max="10"
                  value={newPeopleCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setNewPeopleCount(val);
                  }}
                  className="w-32 cursor-pointer accent-[#8c5e3c]"
                  id="idea-people-range"
                />
                <span className="bg-[#8c5e3c] text-[#faf9f6] font-mono font-bold px-3 py-1 rounded-lg text-xs">
                  {newPeopleCount} {newPeopleCount > 2 ? 'أشخاص' : 'شخص'}
                </span>
              </div>
            </div>

            {/* Roles and Qualifications list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                <label className="block text-xs font-bold text-gray-800">تحديد أدوار ومؤهلات كل شخص مطلوب للعمل:</label>
                <button 
                  type="button"
                  onClick={handleAddRoleField}
                  className="text-xs text-[#8c5e3c] hover:text-[#c5a059] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  id="idea-add-role-field-btn"
                >
                  <Plus size={14} /> إضافة دور وظيفي آخر
                </button>
              </div>

              {newRoles.map((role, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-xl border border-gray-100 relative shadow-xs">
                  <div className="sm:col-span-5">
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1">اسم الدور / الوظيفة (مثال: باحث، مصمم)</label>
                    <input 
                      type="text"
                      value={role.roleName}
                      onChange={(e) => handleRoleChange(idx, 'roleName', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
                      placeholder="الوظيفة (مثلاً: مترجم لغة أوردو)"
                      id={`idea-role-name-${idx}`}
                    />
                  </div>
                  <div className="sm:col-span-6">
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">المؤهلات المطلوبة (مثال: بكالوريوس لغات، خبرة سنة)</label>
                    <input 
                      type="text"
                      value={role.qualifications}
                      onChange={(e) => handleRoleChange(idx, 'qualifications', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
                      placeholder="المؤهلات والخبرات اللازمة..."
                      id={`idea-role-qual-${idx}`}
                    />
                  </div>
                  <div className="sm:col-span-1 flex items-end justify-center pb-1">
                    <button 
                      type="button"
                      disabled={newRoles.length === 1}
                      onClick={() => handleRemoveRoleField(idx)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                      title="حذف هذا الدور"
                      id={`idea-remove-role-btn-${idx}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="submit"
                className="flex-1 bg-[#8c5e3c] hover:bg-[#66462c] text-white py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                id="idea-submit-btn"
              >
                <Check size={16} />
                حفظ وإضافة المقترح للمكنز
              </button>
              <button 
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                id="idea-cancel-btn"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ideas Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="thesaurus-ideas-grid">
        {filteredIdeas.length > 0 ? (
          filteredIdeas.map((idea) => {
            const isCustom = idea.id.startsWith('custom_');
            return (
              <div 
                key={idea.id} 
                className="bg-white rounded-2xl border border-gray-200/60 shadow-premium shadow-premium-hover transition-all flex flex-col overflow-hidden relative group"
                id={`idea-card-${idea.id}`}
              >
                {/* Decorative Amber Left Border */}
                <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-gradient-to-b from-[#b38f36] to-[#c5a059]"></div>

                <div className="p-6 sm:p-7 flex-1 space-y-4">
                  {/* Card Header */}
                  <div className="flex justify-between items-start gap-2 pr-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-[#faf9f6] rounded-xl text-[#c5a059] border border-[#c5a059]/10">
                        <Lightbulb size={18} className="fill-[#c5a059]/10" />
                      </div>
                      <h4 className="font-sans font-bold text-gray-950 text-base leading-snug">{idea.title}</h4>
                    </div>
                    
                    {isCustom && (
                      <button 
                        onClick={() => handleDeleteIdea(idea.id)}
                        className="text-rose-600 hover:bg-rose-50 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="حذف الفكرة المضافة"
                        id={`delete-idea-btn-${idea.id}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed pr-2 font-serif">{idea.description}</p>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-3 bg-[#faf9f6] p-3 rounded-xl border border-gray-100 pr-4">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-[#8c5e3c]" />
                      <div className="text-right">
                        <span className="block text-[9px] text-gray-400 font-semibold uppercase">الميزانية المطلوبة</span>
                        <span className="text-xs font-bold text-gray-950 font-mono">{idea.budget}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-[#8c5e3c]" />
                      <div className="text-right">
                        <span className="block text-[9px] text-gray-400 font-semibold uppercase">طاقم العمل الكلي</span>
                        <span className="text-xs font-bold text-gray-950">{idea.peopleCount} {idea.peopleCount > 2 ? 'أفراد' : 'شخص'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Roles and Job Descriptions */}
                  <div className="space-y-2.5 pr-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                      <Briefcase size={14} className="text-[#c5a059]" />
                      <span>الأدوار والمؤهلات المطلوبة للتنفيذ:</span>
                    </div>

                    <div className="space-y-2">
                      {idea.roles.map((role, idx) => (
                        <div key={idx} className="bg-gray-50/50 p-3 rounded-xl border border-gray-100/60 text-xs">
                          <div className="font-bold text-[#8c5e3c] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                            {role.roleName}
                          </div>
                          <div className="text-gray-600 mt-1 leading-relaxed pl-1">
                            <span className="font-semibold text-[10px] text-gray-400 block mb-0.5">المؤهلات المطلوبة والوظيفة:</span>
                            {role.qualifications}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 space-y-2 animate-fade-in" id="thesaurus-empty-view">
            <Lightbulb size={36} className="mx-auto text-gray-300" />
            <p className="text-xs font-semibold">لم نجد أي أفكار دعوية تطابق بحثك الحالي في المكنز.</p>
            <p className="text-xs text-gray-400">جرب البحث بكلمات أبسط أو أضف فكرة دعوية جديدة لتراها هنا!</p>
          </div>
        )}
      </div>

    </div>
  );
}
