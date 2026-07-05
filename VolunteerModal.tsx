/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, CheckCircle, Heart, User, Phone, Mail, Award, Edit3, Send, Copy, Check } from 'lucide-react';
import { VolunteerSubmission } from '../types';

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VolunteerModal({ isOpen, onClose }: VolunteerModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('translation');
  const [motivation, setMotivation] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedData, setSubmittedData] = useState<{
    fullName: string;
    phone: string;
    email: string;
    specialtyName: string;
    motivation: string;
  } | null>(null);

  const getSpecialtyName = (key: string) => {
    switch (key) {
      case 'translation': return 'الترجمة الفورية واللغات (الإنجليزية / الفرنسية / لغات أخرى)';
      case 'design': return 'التصميم الجرافيكي والموشن وصناعة الميديا والمونتاج';
      case 'programming': return 'البرمجة وإدارة المواقع والمنصات والتطبيقات الدعوية';
      case 'editing': return 'التدقيق الشرعي واللغوي وضبط وتفريغ المتون والدروس';
      case 'coordination': return 'الإشراف التربوي والتنسيق الإداري والمتابعة الدعوية';
      default: return key;
    }
  };

  if (!isOpen) return null;

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!fullName.trim()) tempErrors.fullName = 'الرجاء إدخال الاسم الكامل لفضيلتكم';
    if (!phone.trim()) tempErrors.phone = 'الرجاء إدخال رقم هاتف صالح للتواصل';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'الرجاء إدخال بريد إلكتروني صحيح';
    if (!motivation.trim()) tempErrors.motivation = 'الرجاء كتابة نبذة عن دافعكم للتطوع وخبراتكم السابقة';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submission: VolunteerSubmission = {
      id: Math.random().toString(36).substring(2, 9),
      fullName,
      phone,
      email,
      specialty,
      motivation,
      submissionDate: new Date().toISOString(),
    };

    // Store in LocalStorage to persist
    const existing: VolunteerSubmission[] = JSON.parse(localStorage.getItem('volunteer_submissions') || '[]');
    existing.push(submission);
    localStorage.setItem('volunteer_submissions', JSON.stringify(existing));

    // Save submitted data to display in the success view
    setSubmittedData({
      fullName,
      phone,
      email,
      specialtyName: getSpecialtyName(specialty),
      motivation,
    });

    setIsSubmitted(true);
    setIsCopied(false);
    
    // Clear Form inputs
    setFullName('');
    setPhone('');
    setEmail('');
    setSpecialty('translation');
    setMotivation('');
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSubmittedData(null);
    setIsCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto" id="volunteer-modal-container">
      <div 
        className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#c5a059]/30 overflow-hidden"
        id="volunteer-modal"
        dir="rtl"
      >
        {/* Top Islamic Styled Header */}
        <div className="bg-[#8c5e3c] text-[#faf9f6] p-6 relative border-b border-[#c5a059]/30">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#b38f36] via-[#e2c17c] to-[#c5a059]"></div>
          <button 
            onClick={onClose}
            className="absolute top-6 left-6 p-1.5 text-amber-200/80 hover:text-white hover:bg-amber-900/40 rounded-full transition-colors cursor-pointer"
            aria-label="إغلاق"
            id="close-modal-btn"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-3">
            <Heart className="text-[#e2c17c] fill-[#e2c17c]/20" size={24} />
            <div>
              <h3 className="font-serif font-bold text-lg text-[#e2c17c]">التطوع للعمل مع فضيلة الشيخ</h3>
              <p className="text-xs text-amber-50 mt-1 font-serif">ساهم معنا في خدمة العلم الشريف ونشر المعرفة الإسلامية الرصينة</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-gray-700 leading-relaxed bg-[#faf9f6] p-4 rounded-xl border border-[#c5a059]/20 mb-2 font-serif">
                يرحب فضيلة الدكتور نصر بركات بالمتطوعين والأقلام المبدعة والخبرات التقنية للمساهمة في تحقيق كتبه، أو ترجمة محاضراته، أو تصميم وإنتاج مواده المرئية. يرجى ملء الاستمارة أدناه وسنتواصل معكم قريباً عبر تليجرام أو واتساب.
              </p>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                  <User size={14} className="text-[#8c5e3c]" />
                  الاسم الكامل لفضيلتكم
                </label>
                <input 
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#8c5e3c] focus:border-[#8c5e3c] bg-[#faf9f6]/30 transition-all"
                  placeholder="محمد بن عبد الله..."
                  id="volunteer-name-input"
                />
                {errors.fullName && <p className="text-[11px] text-rose-600 mt-1">{errors.fullName}</p>}
              </div>

              {/* Phone & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                    <Phone size={14} className="text-[#8c5e3c]" />
                    رقم الهاتف (مع رمز البلد والواتساب)
                  </label>
                  <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#8c5e3c] focus:border-[#8c5e3c] bg-[#faf9f6]/30 text-left transition-all"
                    placeholder="+966 50 000 0000"
                    id="volunteer-phone-input"
                  />
                  {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                    <Mail size={14} className="text-[#8c5e3c]" />
                    البريد الإلكتروني
                  </label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#8c5e3c] focus:border-[#8c5e3c] bg-[#faf9f6]/30 text-left transition-all"
                    placeholder="example@mail.com"
                    id="volunteer-email-input"
                  />
                  {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Specialty */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                  <Award size={14} className="text-[#8c5e3c]" />
                  مجال المساهمة والتطوع الرئيس
                </label>
                <select 
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#8c5e3c] focus:border-[#8c5e3c] bg-[#faf9f6]/30 cursor-pointer transition-all"
                  id="volunteer-specialty-select"
                >
                  <option value="translation">الترجمة الفورية واللغات (الإنجليزية / الفرنسية / لغات أخرى)</option>
                  <option value="design">التصميم الجرافيكي والموشن وصناعة الميديا والمونتاج</option>
                  <option value="programming">البرمجة وإدارة المواقع والمنصات والتطبيقات الدعوية</option>
                  <option value="editing">التدقيق الشرعي واللغوي وضبط وتفريغ المتون والدروس</option>
                  <option value="coordination">الإشراف التربوي والتنسيق الإداري والمتابعة الدعوية</option>
                </select>
              </div>

              {/* Motivation */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                  <Edit3 size={14} className="text-[#8c5e3c]" />
                  مؤهلاتكم ودوافعكم الفاضلة للتطوع
                </label>
                <textarea 
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#8c5e3c] focus:border-[#8c5e3c] bg-[#faf9f6]/30 transition-all"
                  placeholder="أذكر باختصار تخصصكم الأكاديمي، خبراتكم السابقة، والوقت المتاح لديكم أسبوعياً للمساهمة..."
                  id="volunteer-motivation-textarea"
                />
                {errors.motivation && <p className="text-[11px] text-rose-600 mt-1">{errors.motivation}</p>}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  type="submit"
                  className="flex-1 bg-[#8c5e3c] hover:bg-[#66462c] text-[#faf9f6] py-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  id="volunteer-submit-btn"
                >
                  <Heart size={15} className="fill-[#e2c17c] text-[#e2c17c]" />
                  تقديم طلب التطوع المبارك
                </button>
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-[#faf9f6] transition-colors cursor-pointer"
                  id="volunteer-cancel-btn"
                >
                  إلغاء
                </button>
              </div>
            </form>
          ) : (
            <div className="py-6 space-y-5 text-right" id="volunteer-success-view" dir="rtl">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-3 bg-emerald-50 rounded-full text-emerald-600 mb-1 border border-emerald-100">
                  <CheckCircle size={40} className="animate-pulse" />
                </div>
                <h4 className="text-base font-serif font-bold text-gray-950">تم تسجيل طلبكم محلياً بنجاح!</h4>
                <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed font-serif">
                  تقبل الله منكم صالح النوايا والجهد. بناءً على رغبتكم، يمكنك الآن إرسال هذا الطلب مباشرةً لحساب فضيلة الشيخ الشخصي على التليجرام لسرعة التواصل والتنسيق المباشر.
                </p>
              </div>

              {submittedData && (
                <div className="bg-gray-50 border border-gray-150 p-4 rounded-xl space-y-2.5 text-xs">
                  <div className="border-b border-gray-250/60 pb-1.5 flex justify-between items-center">
                    <span className="font-bold text-gray-800">بيانات طلب التطوع الخاص بكم:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const msgText = `السلام عليكم ورحمة الله وبركاته فضيلة الشيخ د. نصر بركات،\nأرغب في التطوع والتعاون معكم في خدمة العلم الشريف والدعوة المباركة.\n\nبيانات طلبي:\n• الاسم: ${submittedData.fullName}\n• الهاتف: ${submittedData.phone}\n• البريد: ${submittedData.email}\n• مجال المساهمة: ${submittedData.specialtyName}\n• الخبرات والدافع:\n${submittedData.motivation}`;
                        navigator.clipboard.writeText(msgText);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }}
                      className="text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 cursor-pointer bg-white px-2 py-1 rounded-md border border-gray-200"
                    >
                      {isCopied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                      <span>{isCopied ? 'تم النسخ' : 'نسخ النص'}</span>
                    </button>
                  </div>
                  <div className="space-y-1.5 text-gray-700 font-serif leading-relaxed">
                    <p>• <strong className="font-sans">الاسم:</strong> {submittedData.fullName}</p>
                    <p>• <strong className="font-sans">الهاتف:</strong> {submittedData.phone}</p>
                    <p>• <strong className="font-sans">البريد:</strong> {submittedData.email}</p>
                    <p>• <strong className="font-sans">المجال:</strong> {submittedData.specialtyName}</p>
                    <p className="whitespace-pre-line bg-white/65 p-2.5 rounded-lg border border-gray-100 text-[11px] mt-1 italic">
                      " {submittedData.motivation} "
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons to direct to Telegram */}
              <div className="space-y-2 pt-1">
                <a
                  href={`https://t.me/Nasr_Barakat?text=${encodeURIComponent(
                    submittedData 
                      ? `السلام عليكم ورحمة الله وبركاته فضيلة الشيخ د. نصر بركات،\nأرغب في التطوع والتعاون معكم في خدمة العلم الشريف والدعوة المباركة.\n\nبيانات طلبي:\n• الاسم: ${submittedData.fullName}\n• الهاتف: ${submittedData.phone}\n• البريد: ${submittedData.email}\n• مجال المساهمة: ${submittedData.specialtyName}\n• الخبرات والدافع:\n${submittedData.motivation}`
                      : 'السلام عليكم ورحمة الله وبركاته فضيلة الشيخ د. نصر بركات، أرغب في التطوع معكم.'
                  )}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="w-full bg-[#229ED9] hover:bg-[#1d82b3] text-white py-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md text-center"
                >
                  <Send size={15} className="-rotate-12" />
                  <span>إرسال الطلب عبر تليجرام للشيخ (@Nasr_Barakat)</span>
                </a>

                <div className="text-center font-serif text-[10px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-100 leading-relaxed">
                  * سيقوم الرابط أعلاه بفتح تطبيق تليجرام والانتقال مباشرة لمحادثة فضيلة الشيخ وتجهيز رسالتك للإرسال بنقرة واحدة.
                </div>
              </div>

              <div className="flex justify-center border-t border-gray-100 pt-3">
                <button 
                  onClick={handleReset}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  id="volunteer-success-done-btn"
                >
                  عودة للمدونة
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
