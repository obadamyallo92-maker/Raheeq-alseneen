/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Sparkles, 
  Volume2, 
  Layers, 
  Mic, 
  PenTool, 
  Compass, 
  TrendingUp, 
  Award, 
  Lightbulb, 
  Search, 
  Heart, 
  Phone, 
  Send, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  MapPin, 
  Clock, 
  Download, 
  ExternalLink,
  BookMarked,
  MessageSquare,
  ThumbsUp,
  Share2,
  Bookmark,
  Activity,
  CheckCircle,
  HelpCircle,
  Lock,
  Play,
  Pause,
  Music,
  Volume1,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getFile } from './lib/indexedDb';

// Data and Types
import { ContentType, Book, Speech, Lecture, LessonSeries, Article } from './types';
import { 
  BIOGRAPHY_DATA, 
  BOOKS_DATA, 
  ARTICLES_DATA, 
  BOOK_SUMMARIES_DATA, 
  SPEECHES_DATA, 
  LESSON_SERIES_DATA, 
  LECTURES_DATA, 
  TWEETS_DATA, 
  UMMAH_EVENTS_DATA, 
  DAWAH_PROJECTS_DATA, 
  EDUCATION_PLANS_DATA 
} from './data';

// Components
import VolunteerModal from './components/VolunteerModal';
import DawahThesaurus from './components/DawahThesaurus';
import AdminPanel from './components/AdminPanel';
import ItemComments from './components/ItemComments';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isVolunteerOpen, setIsVolunteerOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});
  const [bookmarkedItems, setBookmarkedItems] = useState<Record<string, boolean>>({});
  const [tweetsLikes, setTweetsLikes] = useState<Record<string, number>>({});
  const [tweetsRetweets, setTweetsRetweets] = useState<Record<string, number>>({});

  // Schedules state for upcoming lessons, lectures, and speeches
  const [schedules, setSchedules] = useState(() => {
    const saved = localStorage.getItem('schedules_data');
    return saved ? JSON.parse(saved) : [
      {
        id: 'sc1',
        title: 'شرح سنن الترمذي (كتاب العلم والمنهجية العلمية)',
        type: 'lesson',
        typeName: 'درس علمي مؤصل',
        dateText: 'كل يوم أحد (أسبوعي)',
        time: 'بعد صلاة المغرب (7:30 مساءً بتوقيت مكة المكرمة)',
        location: 'جامع الوعي الكبير بمكة المكرمة وبث مباشر عبر المدونة والمنصات',
        topic: 'شرح باب ما جاء في فضل الفقه في الدين وعلو كعب طالب العلم وحفظ السنة',
        status: 'upcoming',
        isOnline: true
      },
      {
        id: 'sc2',
        title: 'محاضرة: مستجدات الذكاء الاصطناعي في الميزان الفقهي والمقاصدي المعاصر',
        type: 'lecture',
        typeName: 'محاضرة عامة',
        dateText: 'الأربعاء القادم 22 ذو الحجة 1447 هـ',
        time: 'الساعة 8:30 مساءً بتوقيت مكة المكرمة',
        location: 'القاعة الكبرى لمركز المؤتمرات - جامعة الأزهر الشريف',
        topic: 'تأصيل شرعي للتعامل مع الذكاء التوليدي، قضايا التزييف العميق وحفظ الخصوصيات والمقاصد الخمسة',
        status: 'upcoming',
        isOnline: true
      },
      {
        id: 'sc3',
        title: 'خطبة الجمعة: الأمانة الاجتماعية ودور الأسرة في بناء السلم الحضاري للشباب',
        type: 'speech',
        typeName: 'خطبة جمعة منبرية',
        dateText: 'الجمعة القادم 24 ذو الحجة 1447 هـ',
        time: 'صلاة الجمعة (12:20 ظهراً بتوقيت مكة المكرمة)',
        location: 'جامع الوعي الكبير بمكة المكرمة',
        topic: 'الوقوف على ثغور التربية الصادقة، تعزيز روح الانتماء للدين وحفظ المجتمعات من الأفكار الدخيلة',
        status: 'upcoming',
        isOnline: false
      },
      {
        id: 'sc4',
        title: 'اللقاء التفاعلي المفتوح: فقه السفر وأحكام المغتربين والطلبة في الخارج',
        type: 'lecture',
        typeName: 'لقاء حواري مفتوح',
        dateText: 'السبت الأول من كل شهر هجري',
        time: 'الساعة 9:00 مساءً بتوقيت مكة المكرمة',
        location: 'مكتبة فضيلة الشيخ الرقمية - بث مباشر عبر تطبيق زووم واليوتيوب',
        topic: 'الإجابة عن أسئلة طلاب العلم والمبتعثين، تيسيرات العبادات والمعاملات المالية المعاصرة في ديار الاغتراب',
        status: 'upcoming',
        isOnline: true
      }
    ];
  });

  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'lesson' | 'lecture' | 'speech'>('all');
  const [copiedScheduleId, setCopiedScheduleId] = useState<string | null>(null);
  const [reminderScheduleId, setReminderScheduleId] = useState<string | null>(null);

  // Audio Player States
  const [currentAudio, setCurrentAudio] = useState<{ title: string; url: string; isLive?: boolean } | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.play().catch(err => {
          console.error("Audio playback failed:", err);
          setIsAudioPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isAudioPlaying, currentAudio]);

  const handlePlayAudio = async (title: string, fileIdOrMock: string) => {
    try {
      // If it is an uploaded file in IndexedDB
      if (fileIdOrMock && fileIdOrMock.startsWith('file_')) {
        const fileData = await getFile(fileIdOrMock);
        if (fileData) {
          const url = URL.createObjectURL(fileData);
          setCurrentAudio({ title, url, isLive: false });
          setIsAudioPlaying(true);
          return;
        }
      }
      
      // Fallback for preloaded/mock files: play a gorgeous serene Quran recitation stream
      const fallbackUrl = 'https://backup.qurango.net/radio/tarfeeh';
      setCurrentAudio({ title, url: fallbackUrl, isLive: true });
      setIsAudioPlaying(true);
    } catch (err) {
      console.error("Error playing audio:", err);
      alert("تعذر تشغيل المادة الصوتية حالياً.");
    }
  };

  const handleDownloadBook = async (book: any) => {
    try {
      if (book.downloadUrl && book.downloadUrl.startsWith('file_')) {
        const fileId = book.downloadUrl;
        const fileData = await getFile(fileId);
        if (fileData) {
          const url = URL.createObjectURL(fileData);
          const a = document.createElement('a');
          a.href = url;
          a.download = (fileData as File).name || `${book.title}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          return;
        }
      }

      // Generate text file as elegant reading fallback
      const textContent = `========================================
مدونة رحيق السنين للأستاذ الدكتور نصر بن إبراهيم بركات
========================================

عنوان المادة العلمية: ${book.title}
----------------------------------------
وصف المادة:
${book.description}

----------------------------------------
معلومات النشر والتوثيق:
تأليف وتحقيق: أ.د. نصر بن إبراهيم بركات
الصفحات المقدرة: ${book.pages || 120} صفحة
سنة النشر: ${book.publishYear || 'حديثاً'}

----------------------------------------
تم تحميل هذا الملف بنجاح وبشكل كامل من المدونة الرسمية لفضيلة الشيخ.
نسأل الله العلي القدير أن ينفعنا وإياكم بالعلم النافع والعمل الصالح.
========================================`;
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${book.title}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading book:", err);
      alert("حدث خطأ أثناء تحميل الملف.");
    }
  };

  // Dynamic Data States initialized from localStorage
  const [biography, setBiography] = useState(() => {
    const saved = localStorage.getItem('biography_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.title = 'أستاذ الحديث وعلوم السنة بجامعة الأزهر الشريف';
      localStorage.setItem('biography_data', JSON.stringify(parsed));
      return parsed;
    }
    return BIOGRAPHY_DATA;
  });

  const [books, setBooks] = useState(() => {
    const saved = localStorage.getItem('books_data');
    return saved ? JSON.parse(saved) : BOOKS_DATA;
  });

  const [articles, setArticles] = useState(() => {
    const saved = localStorage.getItem('articles_data');
    return saved ? JSON.parse(saved) : ARTICLES_DATA;
  });

  const [bookSummaries, setBookSummaries] = useState(() => {
    const saved = localStorage.getItem('book_summaries_data');
    return saved ? JSON.parse(saved) : BOOK_SUMMARIES_DATA;
  });

  const [speeches, setSpeeches] = useState(() => {
    const saved = localStorage.getItem('speeches_data');
    return saved ? JSON.parse(saved) : SPEECHES_DATA;
  });

  const [lessonSeries, setLessonSeries] = useState(() => {
    const saved = localStorage.getItem('lesson_series_data');
    return saved ? JSON.parse(saved) : LESSON_SERIES_DATA;
  });

  const [lectures, setLectures] = useState(() => {
    const saved = localStorage.getItem('lectures_data');
    return saved ? JSON.parse(saved) : LECTURES_DATA;
  });

  const [tweets, setTweets] = useState(() => {
    const saved = localStorage.getItem('tweets_data');
    return saved ? JSON.parse(saved) : TWEETS_DATA;
  });

  const [isSyncingTelegram, setIsSyncingTelegram] = useState(false);
  const [telegramSyncError, setTelegramSyncError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTelegramFeed = async () => {
      setIsSyncingTelegram(true);
      setTelegramSyncError(null);
      try {
        const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://t.me/s/Nasr_Barakat_ch'));
        if (!response.ok) throw new Error('Failed to fetch Telegram content');
        const data = await response.json();
        const html = data.contents;
        
        if (!html) throw new Error('Empty response from proxy');

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const messageWraps = doc.querySelectorAll('.tgme_widget_message');

        if (messageWraps.length > 0) {
          const parsedTweets: any[] = [];

          messageWraps.forEach((wrap) => {
            const textEl = wrap.querySelector('.tgme_widget_message_text');
            if (!textEl) return;

            // Extract content and handle formatting
            let content = textEl.innerHTML
              .replace(/<br\s*\/?>/gi, '\n')
              .replace(/<[^>]+>/g, '')
              .trim();

            const txt = document.createElement('textarea');
            txt.innerHTML = content;
            content = txt.value;

            // Date & Time
            const timeEl = wrap.querySelector('.tgme_widget_message_date time');
            const dateStr = timeEl ? timeEl.textContent || '' : 'منذ فترة';
            const datetimeAttr = timeEl ? timeEl.getAttribute('datetime') || '' : '';

            // Post Link & ID
            const linkEl = wrap.querySelector('.tgme_widget_message_date');
            const link = linkEl ? linkEl.getAttribute('href') || 'https://t.me/Nasr_Barakat_ch' : 'https://t.me/Nasr_Barakat_ch';
            const match = link.match(/\/(\d+)$/);
            const id = match ? `telegram-${match[1]}` : `telegram-${Math.random()}`;

            // Image attachment
            let imageUrl: string | undefined = undefined;
            const photoEl = wrap.querySelector('.tgme_widget_message_photo_wrap');
            if (photoEl) {
              const style = photoEl.getAttribute('style') || '';
              const imgMatch = style.match(/background-image:\s*url\(['\"]?(.*?)['\"]?\)/);
              if (imgMatch && imgMatch[1]) {
                imageUrl = imgMatch[1];
              }
            }

            // View Count as dynamic base for likes/shares
            const viewsEl = wrap.querySelector('.tgme_widget_message_views');
            const viewsText = viewsEl ? viewsEl.textContent || '' : '';
            const viewsCount = parseInt(viewsText.replace(/[^\d]/g, '')) || Math.floor(Math.random() * 80) + 20;

            parsedTweets.push({
              id,
              content,
              date: dateStr,
              datetime: datetimeAttr,
              likes: viewsCount,
              retweets: Math.floor(viewsCount * 0.12) + 2,
              imageUrl,
              isTelegram: true,
              link
            });
          });

          if (parsedTweets.length > 0) {
            setTweets(prev => {
              const merged = [...parsedTweets];
              prev.forEach(item => {
                if (!merged.some(m => m.id === item.id)) {
                  merged.push(item);
                }
              });
              localStorage.setItem('tweets_data', JSON.stringify(merged));
              return merged;
            });
          }
        }
      } catch (err) {
        console.error('Error syncing Telegram:', err);
        setTelegramSyncError('تعذر المزامنة الحية؛ يتم عرض البيانات المحفوظة محلياً.');
      } finally {
        setIsSyncingTelegram(false);
      }
    };

    fetchTelegramFeed();
  }, []);

  const [ummahEvents, setUmmahEvents] = useState(() => {
    const saved = localStorage.getItem('ummah_events_data');
    return saved ? JSON.parse(saved) : UMMAH_EVENTS_DATA;
  });

  const [dawahProjects, setDawahProjects] = useState(() => {
    const saved = localStorage.getItem('dawah_projects_data');
    return saved ? JSON.parse(saved) : DAWAH_PROJECTS_DATA;
  });

  const [educationPlans, setEducationPlans] = useState(() => {
    const saved = localStorage.getItem('education_plans_data');
    return saved ? JSON.parse(saved) : EDUCATION_PLANS_DATA;
  });

  const [uploadedFiles, setUploadedFiles] = useState(() => {
    const saved = localStorage.getItem('uploaded_files_data');
    return saved ? JSON.parse(saved) : [];
  });

  // Toggle Lesson expansion
  const toggleLessons = (seriesId: string) => {
    setExpandedLessons(prev => ({
      ...prev,
      [seriesId]: !prev[seriesId]
    }));
  };

  // Bookmark toggling for extra user interactivity
  const toggleBookmark = (id: string) => {
    setBookmarkedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleLikeTweet = (id: string) => {
    setTweetsLikes(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const handleRetweet = (id: string) => {
    setTweetsRetweets(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  // Count items for each classification to display in the smart list
  const categories = [
    { id: 'all', label: 'عرض جميع الأركان', count: 13, icon: Compass, color: 'text-amber-600 bg-amber-50', description: 'تصفح جميع المواد والمحتوى العلمي للشيخ', bgLight: 'bg-amber-50 border-amber-200 text-amber-950 hover:bg-amber-100' },
    { id: 'schedule', label: 'جدول المواعيد والدروس القادمة', count: schedules.length, icon: Calendar, color: 'text-amber-600 bg-amber-50', description: 'جدول الدروس العلمية والخطب والمحاضرات القادمة لفضيلة الشيخ', bgLight: 'bg-amber-50 border-amber-200 text-amber-950 hover:bg-amber-100' },
    { id: 'biography', label: 'السيرة الذاتية للشيخ', count: 1, icon: GraduationCap, color: 'text-blue-600 bg-blue-50', description: 'التعريف الأكاديمي والرحلة العلمية لفضيلته', bgLight: 'bg-blue-50 border-blue-200 text-blue-950 hover:bg-blue-100' },
    { id: 'books', label: 'الكتب', count: books.length, icon: BookOpen, color: 'text-[#8c5e3c] bg-amber-50/40', description: 'مؤلفات وتحقيقات علمية رصينة ومؤصلة للشيخ', bgLight: 'bg-emerald-50 border-emerald-200 text-emerald-950 hover:bg-emerald-100' },
    { id: 'articles', label: 'البحوث والمقالات', count: articles.length, icon: FileText, color: 'text-purple-600 bg-purple-50', description: 'دراسات معاصرة ومقالات منشورة لفضيلته', bgLight: 'bg-purple-50 border-purple-200 text-purple-950 hover:bg-purple-100' },
    { id: 'summaries', label: 'عصير الكتب', count: bookSummaries.length, icon: Sparkles, color: 'text-orange-600 bg-orange-50', description: 'خلاصات وافية لأمهات المراجع والكتب الثقافية والعلمية', bgLight: 'bg-orange-50 border-orange-200 text-orange-950 hover:bg-orange-100' },
    { id: 'speeches', label: 'منبر خطب الجمعة', count: speeches.length, icon: Volume2, color: 'text-cyan-600 bg-cyan-50', description: 'أرشيف الخطب المنبرية والتوجيهات الإيمانية', bgLight: 'bg-cyan-50 border-cyan-200 text-cyan-950 hover:bg-cyan-100' },
    { id: 'lessons', label: 'سلاسل الدروس العلمية', count: lessonSeries.length, icon: Layers, color: 'text-indigo-600 bg-indigo-50', description: 'شروح منهجية متكاملة لمتون العلم الشريف والمختلف التخصصات', bgLight: 'bg-indigo-50 border-indigo-200 text-indigo-950 hover:bg-indigo-100' },
    { id: 'lectures', label: 'المحاضرات العامة والندوات', count: lectures.length, icon: Mic, color: 'text-violet-600 bg-violet-50', description: 'الندوات الفكرية والمحاضرات العامة المصنفة', bgLight: 'bg-violet-50 border-violet-200 text-violet-950 hover:bg-violet-100' },
    { id: 'tweets', label: 'تغريدات وتأملات تربوية', count: tweets.length, icon: PenTool, color: 'text-sky-600 bg-sky-50', description: 'خواطر وقيم تربوية بأسلوب معاصر', bgLight: 'bg-sky-50 border-sky-200 text-sky-950 hover:bg-sky-100' },
    { id: 'events', label: 'أحداث قضايا الأمة الكبرى', count: ummahEvents.length, icon: Compass, color: 'text-rose-600 bg-rose-50', description: 'تعليقات الشيخ على قضايا الأمة والمجتمعات المعاصرة', bgLight: 'bg-rose-50 border-rose-200 text-rose-950 hover:bg-rose-100' },
    { id: 'projects', label: 'مشاريع دعوية', count: dawahProjects.length, icon: TrendingUp, color: 'text-teal-600 bg-teal-50', description: 'مبادرات عملية ومشاريع لخدمة العمل المجتمعي والدعوي', bgLight: 'bg-teal-50 border-teal-200 text-teal-950 hover:bg-teal-100' },
    { id: 'plans', label: 'خطط تعليمية لطلاب العلم', count: educationPlans.length, icon: Award, color: 'text-amber-700 bg-amber-50', description: 'مناهج وبرامج لتأصيل وبناء طالب العلم في شتى المجالات', bgLight: 'bg-amber-50 border-amber-200 text-amber-950 hover:bg-amber-100' },
    { id: 'thesaurus', label: 'مكنز الأفكار الدعوية', count: 3, icon: Lightbulb, color: 'text-yellow-600 bg-yellow-50', description: 'بنك تفاعلي للأفكار والمشاريع الدعوية المقترحة', bgLight: 'bg-yellow-50 border-[#c5a059]/40 text-yellow-950 hover:bg-yellow-100' },
  ];

  // Global advanced search filtering logic
  const query = searchQuery.trim().toLowerCase();
  
  const matchesSearch = (text: string) => {
    if (!query) return true;
    return text.toLowerCase().includes(query);
  };

  // Filter content across categories
  const showBio = (activeCategory === 'all' || activeCategory === 'biography') && matchesSearch(biography.about + ' ' + biography.name + ' ' + biography.title);
  
  const filteredBooks = books.filter(b => 
    (activeCategory === 'all' || activeCategory === 'books') && 
    (matchesSearch(b.title) || matchesSearch(b.description))
  );

  const filteredArticles = articles.filter(a => 
    (activeCategory === 'all' || activeCategory === 'articles') && 
    (matchesSearch(a.title) || matchesSearch(a.content) || matchesSearch(a.category))
  );

  const filteredSummaries = bookSummaries.filter(s => 
    (activeCategory === 'all' || activeCategory === 'summaries') && 
    (matchesSearch(s.bookTitle) || matchesSearch(s.author) || matchesSearch(s.keyTakeaway) || s.summaryPoints.some(matchesSearch))
  );

  const filteredSpeeches = speeches.filter(s => 
    (activeCategory === 'all' || activeCategory === 'speeches') && 
    (matchesSearch(s.title) || matchesSearch(s.transcript) || matchesSearch(s.location))
  );

  const filteredLessons = lessonSeries.filter(s => 
    (activeCategory === 'all' || activeCategory === 'lessons') && 
    (matchesSearch(s.title) || matchesSearch(s.description) || s.lessons.some(l => matchesSearch(l.title) || matchesSearch(l.summary)))
  );

  const filteredLectures = lectures.filter(l => 
    (activeCategory === 'all' || activeCategory === 'lectures') && 
    (matchesSearch(l.title) || matchesSearch(l.location) || l.topics.some(matchesSearch))
  );

  const filteredTweets = tweets.filter(t => 
    (activeCategory === 'all' || activeCategory === 'tweets') && 
    matchesSearch(t.content)
  );

  const filteredEvents = ummahEvents.filter(e => 
    (activeCategory === 'all' || activeCategory === 'events') && 
    (matchesSearch(e.title) || matchesSearch(e.content) || matchesSearch(e.category))
  );

  const filteredProjects = dawahProjects.filter(p => 
    (activeCategory === 'all' || activeCategory === 'projects') && 
    (matchesSearch(p.title) || matchesSearch(p.description) || matchesSearch(p.howToHelp) || p.goals.some(matchesSearch))
  );

  const filteredPlans = educationPlans.filter(p => 
    (activeCategory === 'all' || activeCategory === 'plans') && 
    (matchesSearch(p.title) || matchesSearch(p.targetGroup) || p.stages.some(st => matchesSearch(st.stageTitle) || st.books.some(matchesSearch) || st.objectives.some(matchesSearch)))
  );

  const filteredSchedules = schedules.filter(s =>
    (activeCategory === 'all' || activeCategory === 'schedule') &&
    (matchesSearch(s.title) || matchesSearch(s.topic) || matchesSearch(s.location) || matchesSearch(s.typeName) || matchesSearch(s.dateText))
  );

  const showThesaurus = activeCategory === 'all' || activeCategory === 'thesaurus';

  // Check if any results were found
  const hasResults = showBio || 
    filteredSchedules.length > 0 ||
    filteredBooks.length > 0 || 
    filteredArticles.length > 0 || 
    filteredSummaries.length > 0 || 
    filteredSpeeches.length > 0 || 
    filteredLessons.length > 0 || 
    filteredLectures.length > 0 || 
    filteredTweets.length > 0 || 
    filteredEvents.length > 0 || 
    filteredProjects.length > 0 || 
    filteredPlans.length > 0 || 
    (showThesaurus && query === '');

  return (
    <div className="min-h-screen bg-[#faf9f6] text-gray-800 selection:bg-amber-100 selection:text-amber-950 flex flex-col font-sans" dir="rtl" id="app-root">
      
      {/* 1. TOP ISLAMIC HEADER & CALLIGRAPHY */}
      <header className="relative bg-gradient-to-b from-[#3d2411] via-[#1f1107] to-[#120a04] text-[#faf9f6] overflow-hidden border-b-2 border-[#c5a059]/40 shadow-xl" id="header-section">
        {/* Decorative Gold Top Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#b38f36] via-[#f5e4bd] to-[#c5a059] z-20"></div>
        
        {/* Intricate Islamic Star Pattern Wallpaper Overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none z-0">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="islamic-star-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                {/* 8-pointed star path */}
                <path d="M 30 5 L 37 23 L 55 30 L 37 37 L 30 55 L 23 37 L 5 30 L 23 23 Z" fill="none" stroke="#e2c17c" strokeWidth="1" strokeOpacity="0.35" />
                {/* Intersecting squares / geometry */}
                <rect x="15" y="15" width="30" height="30" fill="none" stroke="#c5a059" strokeWidth="0.75" strokeOpacity="0.25" transform="rotate(45, 30, 30)" />
                <rect x="15" y="15" width="30" height="30" fill="none" stroke="#c5a059" strokeWidth="0.75" strokeOpacity="0.25" />
                {/* Connecting grid dots */}
                <circle cx="30" cy="30" r="1.5" fill="#e2c17c" fillOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#islamic-star-pattern)" />
          </svg>
        </div>

        {/* Illuminated Central Radial Light behind text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[200px] sm:h-[350px] bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-amber-500/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none z-0"></div>

        {/* Continuous Islamic Geometric star borders on top and bottom of the header */}
        <div className="absolute top-3 inset-x-0 flex items-center justify-center gap-1.5 opacity-30 text-[#e2c17c] pointer-events-none z-10 overflow-hidden select-none" dir="ltr">
          {Array.from({ length: 48 }).map((_, i) => (
            <svg key={i} className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M12 2L15 8H21L16 12L18 18L12 15L6 18L8 12L3 8H9L12 2Z" />
              <circle cx="12" cy="11" r="2.5" />
            </svg>
          ))}
        </div>

        <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 opacity-30 text-[#e2c17c] pointer-events-none z-10 overflow-hidden select-none" dir="ltr">
          {Array.from({ length: 48 }).map((_, i) => (
            <svg key={i} className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M12 2L15 8H21L16 12L18 18L12 15L6 18L8 12L3 8H9L12 2Z" />
              <circle cx="12" cy="11" r="2.5" />
            </svg>
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-20 md:pt-20 md:pb-24 relative z-10 flex flex-col items-center justify-center text-center">
          
          <div className="space-y-3.5 max-w-4xl mx-auto">
            {/* Extremely Bold Large Blog Name filling the container */}
            <h1 className="pt-6 sm:pt-10 font-serif font-black text-7xl sm:text-8xl md:text-9xl lg:text-[8.5rem] xl:text-[9.5rem] text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#f5e4bd] to-[#c5a059] tracking-wider leading-none select-none drop-shadow-[0_6px_20px_rgba(0,0,0,0.65)] relative animate-fade-in" id="blog-title-heading">
              رحيق السِّنِين
            </h1>

            {/* Elegant Calligraphic Flourish Separator */}
            <div className="flex items-center justify-center gap-6 pt-3 pb-1">
              <div className="h-[1px] w-28 bg-gradient-to-r from-transparent via-[#c5a059]/60 to-[#c5a059]"></div>
              <span className="text-[#e2c17c] text-sm sm:text-base opacity-80 select-none">◆ ۞ ◆</span>
              <div className="h-[1px] w-28 bg-gradient-to-l from-transparent via-[#c5a059]/60 to-[#c5a059]"></div>
            </div>

            {/* Doctor's Name & Academic Position Container */}
            <div className="pt-1 -mt-3 sm:-mt-4 flex flex-col items-center justify-center text-center space-y-3">
              {/* Doctor's Name */}
              <p className="text-2xl sm:text-3xl md:text-4xl text-[#faf9f6] font-serif font-black tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                {biography.name}
              </p>

              {/* Academic Position Capsule */}
              <p className="text-[10px] sm:text-[11px] md:text-xs text-[#e2c17c] font-sans tracking-widest font-extrabold bg-[#3d2411]/70 border border-[#c5a059]/35 px-4.5 py-1.5 rounded-full inline-block max-w-max mx-auto shadow-lg transition-transform hover:scale-102">
                {biography.title}
              </p>
            </div>
          </div>

          {/* Action Buttons: Absolute on desktop bottom-left, nicely centered below on mobile */}
          <div className="md:absolute md:bottom-12 md:left-8 flex flex-col sm:flex-row items-center gap-3 pt-8 md:pt-0 mt-8 md:mt-0 z-20">
            <button 
              onClick={() => setIsVolunteerOpen(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-[#c5a059] via-[#e2c17c] to-[#b38f36] hover:brightness-110 text-gray-950 font-black text-xs px-4.5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer group border border-white/15 active:scale-98"
              id="header-volunteer-trigger"
            >
              <Heart className="fill-gray-950/15 text-gray-950 group-hover:scale-110 transition-transform" size={13} />
              <span>تطوع للعمل مع الشيخ</span>
            </button>
            
            <a 
              href="#thesaurus" 
              onClick={() => setActiveCategory('thesaurus')}
              className="w-full sm:w-auto bg-gradient-to-r from-[#c5a059] via-[#e2c17c] to-[#b38f36] hover:brightness-110 text-gray-950 font-black text-xs px-4.5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer group border border-white/15 active:scale-98"
            >
              <Lightbulb className="text-gray-950" size={13} strokeWidth={2.5} />
              <span>مكنز الأفكار الدعوية</span>
            </a>
          </div>
        </div>
      </header>

      {/* 2. ADVANCED SEARCH AREA */}
      <section className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 py-5 sticky top-0 z-30 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.02)]" id="search-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#8c5e3c]">
              <Search size={20} />
            </div>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 text-sm sm:text-base border border-gray-200 hover:border-[#c5a059]/50 focus:border-[#8c5e3c] rounded-xl focus:outline-hidden bg-[#faf9f6]/70 text-gray-950 placeholder:text-gray-400/80 transition-all shadow-inner focus:ring-1 focus:ring-[#8c5e3c]"
              placeholder="ابحث في كامل مدونة رحيق السنين (سيرة ذاتية، كتب، بحوث، مقالات)..."
            />
          </div>
        </div>
      </section>

      {/* 3. BLOG CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10" id="blog-categories-grid">
        <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-100 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-5 gap-4">
            <div>
              <h2 className="font-serif font-extrabold text-xl sm:text-2xl text-[#8c5e3c] flex items-center gap-2.5">
                <Compass className="text-[#c5a059]" size={22} />
                أركان وتصنيفات المدونة العلمية
              </h2>
              <p className="text-xs text-gray-500 mt-1.5 font-serif">
                انقر على أي ركن لعرض المواد المتخصصة وتصفيتها بالأسفل
              </p>
            </div>
            
            <button
              onClick={() => {
                setActiveCategory('all');
                document.getElementById('feed-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[#0c2e24] text-[#faf9f6] border-[#0c2e24] shadow-md shadow-emerald-950/10'
                  : 'bg-white hover:bg-[#faf9f6] text-gray-700 border-gray-200'
              }`}
              id="view-all-categories-btn"
            >
              <Compass size={14} />
              <span>عرض جميع الأركان معاً</span>
            </button>
          </div>

          {/* Special Separate Biography Card at the Top */}
          {(() => {
            const bioCat = categories.find(c => c.id === 'biography');
            if (!bioCat) return null;
            const BioIcon = bioCat.icon;
            const isActive = activeCategory === bioCat.id;
            return (
              <div className="flex justify-center mb-8 pb-8 border-b border-gray-100">
                <button
                  onClick={() => {
                    setActiveCategory(bioCat.id);
                    document.getElementById('feed-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`relative w-full max-w-2xl flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-7 rounded-2xl border text-right transition-all duration-300 group cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-br from-[#0c2e24] via-[#09221b] to-[#051712] text-[#faf9f6] border-2 border-[#e2c17c] shadow-xl shadow-emerald-950/30 scale-102'
                      : 'bg-[#fbfaf8] border border-[#c5a059]/20 text-[#0c2e24] hover:bg-gradient-to-br hover:from-[#0c2e24] hover:to-[#071f18] hover:text-[#faf9f6] hover:border-[#e2c17c] hover:shadow-xl hover:shadow-emerald-950/20 hover:scale-101'
                  }`}
                  id={`grid-cat-btn-${bioCat.id}`}
                >
                  {/* Premium Islamic Corner Ornaments */}
                  <div className={`absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 rounded-tr-xs transition-colors duration-300 ${
                    isActive ? 'border-[#e2c17c]' : 'border-[#c5a059]/30 group-hover:border-[#e2c17c]'
                  }`}></div>
                  <div className={`absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 rounded-tl-xs transition-colors duration-300 ${
                    isActive ? 'border-[#e2c17c]' : 'border-[#c5a059]/30 group-hover:border-[#e2c17c]'
                  }`}></div>
                  <div className={`absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 rounded-br-xs transition-colors duration-300 ${
                    isActive ? 'border-[#e2c17c]' : 'border-[#c5a059]/30 group-hover:border-[#e2c17c]'
                  }`}></div>
                  <div className={`absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 rounded-bl-xs transition-colors duration-300 ${
                    isActive ? 'border-[#e2c17c]' : 'border-[#c5a059]/30 group-hover:border-[#e2c17c]'
                  }`}></div>

                  {/* Top Golden Light Strip */}
                  <div className={`absolute top-0 inset-x-0 h-1 rounded-t-2xl transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#b38f36] via-[#e2c17c] to-[#c5a059] opacity-100' 
                      : 'bg-transparent group-hover:bg-[#c5a059] opacity-0 group-hover:opacity-100'
                  }`}></div>

                  {/* Islamic 8-Point Star Icon Wrapper (Rub el Hizb) */}
                  <div className="relative w-16 h-16 flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110">
                    {/* Square 1 */}
                    <div className={`absolute w-12 h-12 rotate-45 border transition-all duration-500 rounded-sm ${
                      isActive 
                        ? 'bg-[#e2c17c] border-[#e2c17c] shadow-md' 
                        : 'bg-white border-[#c5a059]/30 group-hover:bg-[#e2c17c] group-hover:border-[#e2c17c]'
                    }`}></div>
                    {/* Square 2 */}
                    <div className={`absolute w-12 h-12 rotate-0 border transition-all duration-500 rounded-sm ${
                      isActive 
                        ? 'bg-[#0c2e24] border-[#e2c17c]' 
                        : 'bg-[#faf9f6] border-[#c5a059]/30 group-hover:bg-[#0c2e24] group-hover:border-[#e2c17c]'
                    }`}></div>
                    {/* Centered Icon */}
                    <div className={`relative z-10 transition-colors duration-300 ${
                      isActive ? 'text-[#e2c17c]' : 'text-[#8c5e3c] group-hover:text-[#e2c17c]'
                    }`}>
                      <BioIcon size={24} strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="space-y-1.5 flex-1 text-center sm:text-right">
                    <span className={`block font-serif font-black text-lg sm:text-xl leading-none transition-all ${
                      isActive ? 'text-[#e2c17c]' : 'text-[#0c2e24] group-hover:text-[#e2c17c]'
                    }`}>
                      {bioCat.label}
                    </span>
                    <p className={`text-xs leading-relaxed font-serif transition-colors duration-300 ${
                      isActive ? 'text-amber-50/85' : 'text-gray-600 group-hover:text-amber-50/85'
                    }`}>
                      {bioCat.description}
                    </p>
                  </div>

                  {/* Badge Counter */}
                  <div className={`text-[11px] px-3.5 py-1.5 rounded-full font-mono font-black transition-all duration-300 shrink-0 ${
                    isActive 
                      ? 'bg-[#0c2e24]/60 text-[#e2c17c] border border-[#e2c17c]/25' 
                      : 'bg-white text-gray-500 border border-gray-200 group-hover:bg-[#0c2e24]/40 group-hover:text-[#e2c17c] group-hover:border-[#e2c17c]/25'
                  }`}>
                    {bioCat.count} تعريف
                  </div>
                </button>
              </div>
            );
          })()}

          {/* Grid of Remaining Categories (Beautiful Islamic Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" id="categories-boxes-grid">
            {categories.filter(cat => cat.id !== 'all' && cat.id !== 'biography').map((cat) => {
              const CategoryIcon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    // Smooth scroll down to the active feed section
                    document.getElementById('feed-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`relative py-6 px-5 rounded-2xl border flex flex-col items-center justify-between min-h-[210px] text-center transition-all duration-300 group cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-br from-[#0c2e24] via-[#09221b] to-[#051712] text-[#faf9f6] border-2 border-[#e2c17c] shadow-xl shadow-emerald-950/30 scale-102 z-10'
                      : 'bg-[#fbfaf8] border border-[#c5a059]/20 text-[#0c2e24] hover:bg-gradient-to-br hover:from-[#0c2e24] hover:to-[#071f18] hover:text-[#faf9f6] hover:border-[#e2c17c] hover:shadow-xl hover:shadow-emerald-950/20 hover:scale-102'
                  }`}
                  id={`grid-cat-btn-${cat.id}`}
                >
                  {/* Premium Islamic Corner Ornaments */}
                  <div className={`absolute top-2 right-2 w-3.5 h-3.5 border-t border-r rounded-tr-xs transition-colors duration-300 ${
                    isActive ? 'border-[#e2c17c]' : 'border-[#c5a059]/30 group-hover:border-[#e2c17c]'
                  }`}></div>
                  <div className={`absolute top-2 left-2 w-3.5 h-3.5 border-t border-l rounded-tl-xs transition-colors duration-300 ${
                    isActive ? 'border-[#e2c17c]' : 'border-[#c5a059]/30 group-hover:border-[#e2c17c]'
                  }`}></div>
                  <div className={`absolute bottom-2 right-2 w-3.5 h-3.5 border-b border-r rounded-br-xs transition-colors duration-300 ${
                    isActive ? 'border-[#e2c17c]' : 'border-[#c5a059]/30 group-hover:border-[#e2c17c]'
                  }`}></div>
                  <div className={`absolute bottom-2 left-2 w-3.5 h-3.5 border-b border-l rounded-bl-xs transition-colors duration-300 ${
                    isActive ? 'border-[#e2c17c]' : 'border-[#c5a059]/30 group-hover:border-[#e2c17c]'
                  }`}></div>

                  {/* Top Golden Light Strip */}
                  <div className={`absolute top-0 inset-x-0 h-1 rounded-t-2xl transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#b38f36] via-[#e2c17c] to-[#c5a059] opacity-100' 
                      : 'bg-transparent group-hover:bg-[#c5a059] opacity-0 group-hover:opacity-100'
                  }`}></div>

                  {/* Islamic 8-Point Star Icon Wrapper (Rub el Hizb) */}
                  <div className="relative w-14 h-14 flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110">
                    {/* Square 1 */}
                    <div className={`absolute w-10 h-10 rotate-45 border transition-all duration-500 rounded-sm ${
                      isActive 
                        ? 'bg-[#e2c17c] border-[#e2c17c] shadow-md' 
                        : 'bg-white border-[#c5a059]/30 group-hover:bg-[#e2c17c] group-hover:border-[#e2c17c]'
                    }`}></div>
                    {/* Square 2 */}
                    <div className={`absolute w-10 h-10 rotate-0 border transition-all duration-500 rounded-sm ${
                      isActive 
                        ? 'bg-[#0c2e24] border-[#e2c17c]' 
                        : 'bg-[#faf9f6] border-[#c5a059]/30 group-hover:bg-[#0c2e24] group-hover:border-[#e2c17c]'
                    }`}></div>
                    {/* Centered Icon */}
                    <div className={`relative z-10 transition-colors duration-300 ${
                      isActive ? 'text-[#e2c17c]' : 'text-[#8c5e3c] group-hover:text-[#e2c17c]'
                    }`}>
                      <CategoryIcon size={20} strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Text Container */}
                  <div className="space-y-1 py-1.5 flex-1 flex flex-col justify-center">
                    <span className={`block font-serif font-black text-sm sm:text-base leading-snug transition-all ${
                      isActive ? 'text-[#e2c17c]' : 'text-gray-950 group-hover:text-[#e2c17c]'
                    }`}>
                      {cat.label}
                    </span>
                    
                    {/* Elegant Golden Divider Line */}
                    <div className={`w-10 h-[1.5px] mx-auto rounded-full transition-all duration-300 ${
                      isActive ? 'bg-[#e2c17c]/30' : 'bg-[#c5a059]/15 group-hover:bg-[#e2c17c]/30'
                    }`}></div>

                    <p className={`text-[11px] leading-relaxed max-w-[210px] mx-auto font-serif line-clamp-2 transition-colors duration-300 ${
                      isActive ? 'text-amber-50/85' : 'text-gray-500 group-hover:text-amber-50/85'
                    }`}>
                      {cat.description}
                    </p>
                  </div>

                  {/* Badge Counter */}
                  <div className={`text-[10px] px-3.5 py-1 rounded-full font-mono font-black transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#0c2e24]/60 text-[#e2c17c] border border-[#e2c17c]/25' 
                      : 'bg-white text-gray-500 border border-gray-100 shadow-sm group-hover:bg-[#0c2e24]/40 group-hover:text-[#e2c17c] group-hover:border-[#e2c17c]/25'
                  }`}>
                    {cat.count} {cat.count > 2 && cat.count < 11 ? 'مواد' : 'مادة'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. MAIN WORKSPACE */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col lg:flex-row gap-8" id="main-content">
        
        {/* COLUMN A: SELECTED CLASSIFICATION DETAILS & INTERACTIVE WIDGETS */}
        <aside className="w-full lg:w-1/4 space-y-6 lg:sticky lg:top-28 lg:h-[fit-content]" id="sidebar-aside">
          
          {/* Active Category Display Card */}
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-[0_8px_30px_rgba(15,52,41,0.02)] overflow-hidden">
            <div className="bg-[#8c5e3c] p-4 text-[#faf9f6] border-b border-[#c5a059]/30 flex items-center justify-between">
              <span className="font-sans font-bold text-xs text-[#e2c17c] flex items-center gap-2">
                <Compass size={16} />
                الركن المختار حالياً
              </span>
              <span className="bg-[#4a3118] text-[#e2c17c] font-mono text-[9px] px-2 py-0.5 rounded-full font-bold">
                تصفية نشطة
              </span>
            </div>

            <div className="p-6 text-center space-y-4">
              {(() => {
                const activeCat = categories.find(c => c.id === activeCategory);
                if (!activeCat) return null;
                const CatIcon = activeCat.icon;
                return (
                  <>
                    <div className="w-14 h-14 mx-auto bg-[#faf9f6] text-[#8c5e3c] border border-[#c5a059]/15 rounded-2xl flex items-center justify-center shadow-xs">
                      <CatIcon size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-sm text-gray-950">{activeCat.label}</h4>
                      <p className="text-[11px] text-gray-500 leading-relaxed max-w-[200px] mx-auto font-serif">{activeCat.description}</p>
                    </div>
                    {activeCategory !== 'all' && (
                      <button
                        onClick={() => setActiveCategory('all')}
                        className="w-full bg-[#faf9f6] hover:bg-gray-100 text-gray-700 text-xs font-semibold py-2 rounded-xl transition-colors border border-gray-150 cursor-pointer"
                        id="sidebar-reset-filter-btn"
                      >
                        عرض جميع الأركان
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Micro Card: Quick Contact & Volunteer Link */}
          <div className="bg-gradient-to-br from-[#8c5e3c] to-[#4a3118] rounded-2xl p-6 text-[#faf9f6] border border-[#c5a059]/15 text-center space-y-4 shadow-[0_12px_40px_rgba(15,52,41,0.08)]">
            <div className="w-12 h-12 bg-[#c5a059]/10 rounded-full flex items-center justify-center mx-auto text-[#e2c17c] border border-[#c5a059]/20">
              <Heart size={20} className="fill-[#e2c17c]/10 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="font-sans font-bold text-sm text-[#e2c17c]">ساهم في نشر العلم</h4>
              <p className="text-[11px] text-amber-100 leading-relaxed">
                هل تجد في نفسك الكفاءة اللغوية أو الفنية لتفريغ أو ترجمة دروس فضيلة الشيخ؟
              </p>
            </div>
            <button 
              onClick={() => setIsVolunteerOpen(true)}
              className="w-full bg-[#c5a059] hover:bg-[#e2c17c] text-gray-950 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md border border-white/10 active:scale-98"
              id="sidebar-volunteer-btn"
            >
              <Heart size={14} className="fill-gray-950/10" />
              <span>تقديم طلب مساهمة</span>
            </button>
          </div>

        </aside>

        {/* COLUMN B: DYNAMIC MAIN CONTENT FEED */}
        <section className="w-full lg:w-3/4 space-y-10" id="feed-section">
          
          <AnimatePresence mode="wait">
            {!hasResults ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white p-12 text-center rounded-2xl border border-gray-200/60 text-gray-500 space-y-5 shadow-premium"
                id="search-empty-state"
              >
                <div className="w-16 h-16 bg-[#c5a059]/10 rounded-full flex items-center justify-center mx-auto text-[#c5a059]">
                  <Search size={32} />
                </div>
                <h3 className="font-sans font-bold text-lg text-[#0c2e24]">عذراً، لم نجد أي نتائج متطابقة</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                  لم نعثر على أي كتب أو مقالات أو دروس تطابق كلمتكم الدلالية "<strong>{searchQuery}</strong>". يرجى المحاولة باستخدام كلمات بحث أخرى أو مسح صندوق البحث لرؤية كافة الأقسام.
                </p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="bg-[#0c2e24] hover:bg-emerald-950 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
                  id="reset-search-btn"
                >
                  إعادة تعيين البحث
                </button>
              </motion.div>
            ) : (
              <div className="space-y-12">

                {/* ======================================================== */}
                {/* 1. BIOGRAPHY SECTION */}
                {/* ======================================================== */}
                {showBio && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-200/60 shadow-premium overflow-hidden"
                    id="biography-card"
                  >
                    <div className="bg-[#0c2e24] p-5 border-b border-[#c5a059]/20 flex items-center justify-between">
                      <h3 className="font-serif font-bold text-lg text-[#faf9f6] flex items-center gap-2.5">
                        <GraduationCap className="text-[#c5a059]" size={20} />
                        السيرة الذاتية لفضيلة الشيخ
                      </h3>
                      <span className="text-[10px] font-bold text-[#e2c17c] bg-[#051a14] px-2.5 py-1 rounded-md">
                        التعريف الأكاديمي المعتمد
                      </span>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6">
                      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-right">
                        {/* Styled Avatar Placeholder */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-[#0c2e24] to-[#041a14] text-[#c5a059] font-serif font-bold text-3xl sm:text-4xl flex items-center justify-center border-2 border-[#c5a059] shadow-md select-none shrink-0">
                          {biography.avatarText || "د.ن"}
                        </div>
                        
                        <div className="space-y-2 flex-1">
                          <h4 className="font-sans font-extrabold text-xl sm:text-2xl text-gray-900">{biography.name}</h4>
                          <p className="text-xs sm:text-sm text-[#b38f36] font-bold">{biography.title}</p>
                          <p className="text-sm text-gray-700 leading-relaxed font-serif whitespace-pre-line pt-2">{biography.about}</p>
                        </div>
                      </div>

                      {/* Degrees Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                        <div>
                          <h5 className="font-sans font-bold text-xs text-[#0c2e24] mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-3 bg-[#c5a059] rounded-xs"></span>
                            الشهادات والألقاب الأكاديمية:
                          </h5>
                          <ul className="space-y-2.5 text-xs text-gray-600 list-inside pr-1">
                            {biography.degrees.map((deg: string, i: number) => (
                              <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                                <span className="text-[#c5a059] mt-1">✦</span>
                                <span>{deg}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-sans font-bold text-xs text-[#0c2e24] mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-3 bg-[#c5a059] rounded-xs"></span>
                            العضويات والخبرات العملية:
                          </h5>
                          <ul className="space-y-2.5 text-xs text-gray-600 list-inside pr-1">
                            {biography.positions.map((pos: string, i: number) => (
                              <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                                <span className="text-[#c5a059] mt-1">✦</span>
                                <span>{pos}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}


                {/* ======================================================== */}
                {/* 1.5. UPCOMING SCHEDULES / CALENDAR SECTION */}
                {/* ======================================================== */}
                {(activeCategory === 'all' || activeCategory === 'schedule') && filteredSchedules.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-200/60 shadow-premium overflow-hidden"
                    id="schedule-section"
                  >
                    <div className="bg-[#8c5e3c] p-5 border-b border-[#c5a059]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-[#faf9f6]/10 rounded-lg text-[#e2c17c] border border-[#faf9f6]/10 flex items-center justify-center">
                          <Calendar size={22} className="animate-pulse" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-serif font-black text-lg text-[#faf9f6]">
                            جدول المواعيد والدروس القادمة لفضيلة الشيخ
                          </h3>
                          <p className="text-xs text-amber-100/85 mt-0.5 font-serif">
                            أجندة الدروس المنهجية، المحاضرات العامة، ومواعيد الخطب المنبرية للشيخ
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[#faf9f6] bg-[#0c2e24] border border-[#c5a059]/35 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-inner shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        محدّث تلقائياً ومتاح للحضور والمتابعة
                      </span>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6">
                      {/* Interactive Section Header: Filters */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#faf9f6] p-3 rounded-xl border border-gray-150">
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: 'all', label: 'كافة المواعيد' },
                            { id: 'lesson', label: 'الدروس العلمية' },
                            { id: 'lecture', label: 'المحاضرات العامة' },
                            { id: 'speech', label: 'خطب الجمعة' }
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setScheduleFilter(tab.id as any)}
                              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                scheduleFilter === tab.id
                                  ? 'bg-[#0c2e24] text-[#e2c17c] shadow-sm'
                                  : 'text-gray-600 hover:text-gray-950 hover:bg-white/60'
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>

                        <div className="text-[11px] text-gray-500 font-serif font-medium">
                          يعرض <span className="text-[#8c5e3c] font-bold">
                            {filteredSchedules.filter(s => scheduleFilter === 'all' || s.type === scheduleFilter).length}
                          </span> موعداً قادماً للشيخ نصر
                        </div>
                      </div>

                      {/* Schedule List */}
                      <div className="space-y-4">
                        {filteredSchedules
                          .filter(s => scheduleFilter === 'all' || s.type === scheduleFilter)
                          .map((sc, idx) => {
                            const isCopied = copiedScheduleId === sc.id;
                            const isReminderSet = reminderScheduleId === sc.id;

                            return (
                              <motion.div
                                key={sc.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25, delay: idx * 0.05 }}
                                className="group relative bg-white hover:bg-[#faf9f6]/40 rounded-xl border border-gray-150 p-5 sm:p-6 transition-all hover:shadow-md hover:border-[#c5a059]/30 flex flex-col md:flex-row gap-5 items-start justify-between"
                              >
                                {/* Left Side: Details */}
                                <div className="space-y-3.5 flex-1 w-full text-right">
                                  <div className="flex flex-wrap items-center gap-2.5">
                                    {/* Event Type Badge */}
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-md tracking-wider ${
                                      sc.type === 'lesson'
                                        ? 'bg-[#0c2e24]/10 text-[#0c2e24] border border-[#0c2e24]/15'
                                        : sc.type === 'lecture'
                                        ? 'bg-[#8c5e3c]/10 text-[#8c5e3c] border border-[#8c5e3c]/15'
                                        : 'bg-rose-50 text-rose-800 border border-rose-100'
                                    }`}>
                                      {sc.typeName}
                                    </span>

                                    {/* Live/Online Indicator */}
                                    {sc.isOnline ? (
                                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-150 text-[9px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        بث مباشر متوفر
                                      </span>
                                    ) : (
                                      <span className="bg-amber-50 text-amber-800 border border-amber-150 text-[9px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                                        حضور ميداني
                                      </span>
                                    )}
                                  </div>

                                  {/* Title */}
                                  <h4 className="font-serif font-black text-base sm:text-lg text-gray-950 group-hover:text-[#8c5e3c] transition-colors leading-snug">
                                    {sc.title}
                                  </h4>

                                  {/* Details Grid */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                    <div className="flex items-start gap-2.5 text-xs text-gray-600 leading-normal">
                                      <Calendar className="text-[#c5a059] mt-0.5 shrink-0" size={14} />
                                      <div>
                                        <span className="font-bold block text-gray-800 mb-0.5">التاريخ والموعد:</span>
                                        <span>{sc.dateText}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-start gap-2.5 text-xs text-gray-600 leading-normal">
                                      <Clock className="text-[#c5a059] mt-0.5 shrink-0" size={14} />
                                      <div>
                                        <span className="font-bold block text-gray-800 mb-0.5">الوقت المحدد:</span>
                                        <span dir="rtl">{sc.time}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-start gap-2.5 text-xs text-gray-600 leading-normal sm:col-span-2">
                                      <MapPin className="text-[#c5a059] mt-0.5 shrink-0" size={14} />
                                      <div>
                                        <span className="font-bold block text-gray-800 mb-0.5">مكان إقامة المجلس:</span>
                                        <span>{sc.location}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-start gap-2.5 text-xs text-gray-600 leading-normal sm:col-span-2 bg-[#faf9f6]/80 p-3 rounded-lg border border-gray-150/50">
                                      <BookOpen className="text-[#c5a059] mt-0.5 shrink-0" size={14} />
                                      <div>
                                        <span className="font-bold block text-gray-800 mb-0.5">موضوع ومحور المجلس:</span>
                                        <span className="font-serif italic text-gray-700">{sc.topic}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Right Side Actions */}
                                <div className="flex md:flex-col items-center justify-end gap-2.5 w-full md:w-40 md:h-full md:justify-center border-t md:border-t-0 border-gray-100 pt-3.5 md:pt-0 shrink-0">
                                  <button
                                    onClick={() => {
                                      const textToCopy = `الموعد القادم لفضيلة د. نصر بركات:\n📌 ${sc.title}\n📅 ${sc.dateText}\n⏰ ${sc.time}\n📍 ${sc.location}\n📖 المبحث: ${sc.topic}`;
                                      navigator.clipboard.writeText(textToCopy);
                                      setCopiedScheduleId(sc.id);
                                      setTimeout(() => setCopiedScheduleId(null), 2500);
                                    }}
                                    className={`w-full sm:w-auto md:w-full text-center py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs border ${
                                      isCopied
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                                        : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                                    }`}
                                  >
                                    <CheckCircle size={13} className={isCopied ? 'block' : 'hidden'} />
                                    <span>{isCopied ? 'تم نسخ الموعد' : 'نسخ تفاصيل الموعد'}</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setReminderScheduleId(sc.id);
                                      setTimeout(() => setReminderScheduleId(null), 3000);
                                    }}
                                    className={`w-full sm:w-auto md:w-full text-center py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs border ${
                                      isReminderSet
                                        ? 'bg-[#0c2e24] text-[#e2c17c] border-[#0c2e24]'
                                        : 'bg-[#faf9f6] hover:bg-[#c5a059]/10 text-[#8c5e3c] border-[#c5a059]/30'
                                    }`}
                                  >
                                    <Activity size={13} className={isReminderSet ? 'animate-pulse' : ''} />
                                    <span>{isReminderSet ? 'تم تفعيل التذكير' : 'تنبيهي قبل البدء'}</span>
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })}

                        {filteredSchedules.filter(s => scheduleFilter === 'all' || s.type === scheduleFilter).length === 0 && (
                          <div className="py-10 text-center text-gray-500 font-serif">
                            لا توجد مواعيد قادمة متطابقة مع نوع التصفية المختار حالياً.
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}


                {/* ======================================================== */}
                {/* 2. BOOKS CORNER */}
                {/* ======================================================== */}
                {filteredBooks.length > 0 && (
                  <div className="space-y-5" id="books-section">
                    <div className="border-b border-[#0c2e24]/10 pb-2 flex items-center justify-between">
                      <h3 className="font-serif font-bold text-lg text-gray-900 flex items-center gap-2.5">
                        <BookOpen className="text-[#0c2e24]" size={20} />
                        ركن كتب ومؤلفات الشيخ
                      </h3>
                      <span className="text-xs text-gray-500">متوفرة للقراءة والتحميل المجاني</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredBooks.map((book) => {
                        const isBookmarked = bookmarkedItems[book.id];
                        return (
                          <div 
                            key={book.id} 
                            className="bg-white rounded-2xl border border-gray-200/60 p-5 flex gap-5 shadow-premium shadow-premium-hover transition-all group relative"
                            id={`book-item-${book.id}`}
                          >
                            {/* Decorative book mockup (dynamic styled cover) */}
                            <div className={`w-28 sm:w-32 h-40 rounded-lg shadow-md select-none shrink-0 relative overflow-hidden flex flex-col justify-between p-3 border-r-4 border-[#c5a059]/40 text-white ${
                              book.coverColor === 'emerald' ? 'bg-gradient-to-b from-[#0b3c2d] to-[#061f17]' :
                              book.coverColor === 'amber' ? 'bg-gradient-to-b from-[#854d0e] to-[#452805]' :
                              book.coverColor === 'slate' ? 'bg-gradient-to-b from-[#334155] to-[#1e293b]' : 'bg-gradient-to-b from-[#312e81] to-[#1e1b4b]'
                            }`}>
                              {/* Gold Frame Design */}
                              <div className="absolute inset-1.5 border border-[#c5a059]/30 rounded-xs pointer-events-none"></div>
                              <div className="absolute top-1.5 left-1.5 text-[8px] font-mono text-[#e2c17c] opacity-60">Barakat</div>
                              
                              <h5 className="font-serif font-bold text-xs leading-snug text-[#e2c17c] text-center pt-2 relative z-10">
                                {book.title}
                              </h5>
                              
                              <div className="text-center relative z-10">
                                <span className="block text-[7px] text-gray-200">تأليف د. نصر بركات</span>
                                <span className="block text-[7px] text-[#e2c17c] mt-1 font-mono">{book.publishYear}</span>
                              </div>
                            </div>

                            {/* Book text & actions */}
                            <div className="flex-1 flex flex-col justify-between py-1">
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-start gap-1">
                                  <h4 className="font-sans font-bold text-sm text-gray-900 group-hover:text-[#0c2e24] transition-colors leading-snug">
                                    {book.title}
                                  </h4>
                                  <button 
                                    onClick={() => toggleBookmark(book.id)}
                                    className="text-gray-400 hover:text-amber-500 p-1 rounded-md transition-colors cursor-pointer"
                                    title="حفظ للمفضلة"
                                    id={`bookmark-book-${book.id}`}
                                  >
                                    <Bookmark size={14} className={isBookmarked ? 'fill-amber-500 text-amber-500' : ''} />
                                  </button>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed font-serif line-clamp-3">
                                  {book.description}
                                </p>
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                                <span className="font-mono">{book.pages} صفحة</span>
                                <button 
                                  onClick={() => handleDownloadBook(book)}
                                  className="text-[#0c2e24] hover:text-white font-bold flex items-center gap-1 cursor-pointer bg-[#faf9f6] hover:bg-[#0c2e24] px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-[#0c2e24] transition-all"
                                  id={`download-book-btn-${book.id}`}
                                >
                                  <Download size={12} />
                                  <span>تحميل PDF</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}


                {/* ======================================================== */}
                {/* 3. RESEARCH AND ARTICLES */}
                {/* ======================================================== */}
                {filteredArticles.length > 0 && (
                  <div className="space-y-5" id="articles-section">
                    <div className="border-b border-[#0c2e24]/10 pb-2">
                      <h3 className="font-serif font-bold text-lg text-gray-900 flex items-center gap-2.5">
                        <FileText className="text-[#0c2e24]" size={20} />
                        البحوث والمقالات العامة
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {filteredArticles.map((art) => (
                        <article 
                          key={art.id} 
                          className="bg-white rounded-2xl border border-gray-200/60 p-6 sm:p-7 shadow-premium shadow-premium-hover transition-all space-y-4 relative group"
                          id={`article-item-${art.id}`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-50 pb-2.5">
                            <span className="inline-block bg-[#0c2e24]/5 text-[#0c2e24] text-[10px] font-bold px-3 py-1 rounded-md border border-[#0c2e24]/10">
                              {art.category}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                              <Calendar size={12} />
                              <span>تاريخ النشر: {art.publishDate}</span>
                            </div>
                          </div>

                          <h4 className="font-sans font-extrabold text-base sm:text-lg text-gray-950 group-hover:text-[#0c2e24] transition-colors">
                            {art.title}
                          </h4>

                          <p className="text-sm text-gray-700 leading-relaxed font-serif whitespace-pre-line">
                            {art.content}
                          </p>

                          <div className="pt-2 flex justify-end">
                            <button 
                              onClick={() => alert(`مشاركة المقال: ${art.title}`)}
                              className="text-gray-500 hover:text-[#0c2e24] text-[11px] font-bold flex items-center gap-1.5 bg-[#faf9f6] px-3 py-1.5 rounded-lg border border-gray-100 hover:border-gray-200 transition-all cursor-pointer"
                              id={`share-art-btn-${art.id}`}
                            >
                              <Share2 size={12} />
                              <span>مشاركة المقال</span>
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}


                {/* ======================================================== */}
                {/* 4. BOOK SUMMARIES (عصير الكتب) */}
                {/* ======================================================== */}
                {filteredSummaries.length > 0 && (
                  <div className="space-y-5" id="summaries-section">
                    <div className="border-b border-[#0c2e24]/10 pb-2">
                      <h3 className="font-serif font-bold text-lg text-gray-900 flex items-center gap-2.5">
                        <Sparkles className="text-[#0c2e24]" size={20} />
                        ركن عصير الكتب (ملخصات الكتب النافعة)
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {filteredSummaries.map((summary) => (
                        <div 
                          key={summary.id} 
                          className="bg-white rounded-2xl border border-gray-200/60 p-6 flex flex-col justify-between shadow-premium shadow-premium-hover transition-all space-y-4"
                          id={`summary-item-${summary.id}`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center gap-1.5 text-xs text-[#b38f36] font-bold">
                              <BookMarked size={14} />
                              <span>عصير الكتب والمؤلفات</span>
                            </div>
                            
                            <div className="space-y-0.5">
                              <h4 className="font-sans font-bold text-sm text-gray-900 leading-snug">{summary.bookTitle}</h4>
                              <p className="text-[10px] text-gray-400 font-medium">للمصنف: {summary.author}</p>
                            </div>

                            <ul className="space-y-2 text-xs text-gray-600 list-inside pt-3 border-t border-gray-100">
                              {summary.summaryPoints.slice(0, 3).map((point, idx) => (
                                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                                  <span className="text-[#c5a059] mt-1">•</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-[#faf9f6] p-3.5 rounded-xl border border-[#c5a059]/20 text-[11px] text-[#0c2e24] leading-relaxed font-serif mt-4">
                            <strong>الخلاصة الإيمانية:</strong> {summary.keyTakeaway}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {/* ======================================================== */}
                {/* 5. SPEECHES CORNER */}
                {/* ======================================================== */}
                {filteredSpeeches.length > 0 && (
                  <div className="space-y-5" id="speeches-section">
                    <div className="border-b border-[#0c2e24]/10 pb-2">
                      <h3 className="font-serif font-bold text-lg text-gray-900 flex items-center gap-2.5">
                        <Volume2 className="text-[#0c2e24]" size={20} />
                        ركن خطب الجمعة والتوجيهات المنبرية
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {filteredSpeeches.map((speech) => (
                        <div 
                          key={speech.id} 
                          className="bg-white rounded-2xl border border-gray-200/60 p-6 sm:p-7 shadow-premium shadow-premium-hover transition-all space-y-4"
                          id={`speech-item-${speech.id}`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-50 pb-2.5 text-xs text-gray-400">
                            <div className="flex items-center gap-1.5">
                              <MapPin size={12} className="text-[#0c2e24]" />
                              <span>الموقع: {speech.location}</span>
                            </div>
                            <div className="flex items-center gap-3 font-mono text-[10px]">
                              <span className="flex items-center gap-1"><Calendar size={11} /> {speech.date}</span>
                              <span className="flex items-center gap-1"><Clock size={11} /> {speech.audioDuration}</span>
                            </div>
                          </div>

                          <h4 className="font-sans font-bold text-base text-gray-950 leading-snug">{speech.title}</h4>
                          <p className="text-sm text-gray-700 font-serif leading-relaxed bg-[#faf9f6] p-5 rounded-2xl border-r-4 border-[#0c2e24] shadow-xs italic">
                            "{speech.transcript}"
                          </p>

                          <div className="flex items-center justify-between pt-1 text-[11px]">
                            <button 
                              onClick={() => handlePlayAudio(speech.title, speech.id.startsWith('s_uploaded_') ? speech.id.replace('s_uploaded_', '') : speech.id)}
                              className="text-[#0c2e24] hover:text-white font-bold flex items-center gap-2 bg-[#faf9f6] hover:bg-[#0c2e24] px-4 py-2.5 rounded-xl cursor-pointer border border-gray-200 hover:border-[#0c2e24] transition-all"
                              id={`listen-speech-btn-${speech.id}`}
                            >
                              <Volume2 size={13} />
                              <span>الاستماع للخطبة الصوتية</span>
                            </button>
                            
                            <button 
                              onClick={() => alert(`تم نسخ نص الخطبة للذاكرة`)}
                              className="text-gray-400 hover:text-[#0c2e24] cursor-pointer font-semibold transition-colors"
                              id={`copy-speech-btn-${speech.id}`}
                            >
                              نسخ النص
                            </button>
                          </div>

                          {/* Simple Comment / Benefit System */}
                          <ItemComments itemId={speech.id} itemTitle={speech.title} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {/* ======================================================== */}
                {/* 6. LESSON SERIES */}
                {/* ======================================================== */}
                {filteredLessons.length > 0 && (
                  <div className="space-y-5" id="lessons-section">
                    <div className="border-b border-[#0c2e24]/10 pb-2">
                      <h3 className="font-serif font-bold text-lg text-gray-900 flex items-center gap-2.5">
                        <Layers className="text-[#0c2e24]" size={20} />
                        ركن سلاسل الدروس العلمية المنهجية
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {filteredLessons.map((series) => {
                        const isExpanded = expandedLessons[series.id];
                        return (
                          <div 
                            key={series.id} 
                            className="bg-white rounded-2xl border border-gray-200/60 shadow-premium overflow-hidden"
                            id={`series-item-${series.id}`}
                          >
                            {/* Series Header */}
                            <div className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#faf9f6] border-b border-gray-100">
                              <div className="space-y-1">
                                <span className="inline-block bg-[#0c2e24]/5 text-[#0c2e24] text-[10px] font-bold px-2.5 py-1 rounded-md border border-[#0c2e24]/10">
                                  {series.level}
                                </span>
                                <h4 className="font-sans font-bold text-sm sm:text-base text-gray-950 mt-1">{series.title}</h4>
                                <p className="text-xs text-gray-500 leading-relaxed font-serif max-w-2xl mt-0.5">{series.description}</p>
                              </div>

                              <button 
                                onClick={() => toggleLessons(series.id)}
                                className="w-full sm:w-auto px-4 py-2.5 bg-[#0c2e24] hover:bg-emerald-950 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                                id={`series-toggle-btn-${series.id}`}
                              >
                                <span>{isExpanded ? 'طي الدروس' : `عرض الدروس (${series.lessons.length})`}</span>
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                            </div>

                            {/* Lessons List Expandable Container */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden border-t border-gray-100"
                                >
                                  <div className="p-4 sm:p-6 divide-y divide-gray-100/60 space-y-4">
                                    {series.lessons.map((lesson, idx) => (
                                      <div key={lesson.id} className="pt-4 first:pt-0 flex flex-col sm:flex-row justify-between gap-3 text-xs leading-relaxed">
                                        <div className="space-y-1 flex-1">
                                          <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#0c2e24]"></span>
                                            {lesson.title}
                                          </div>
                                          <p className="text-gray-500 pl-3 font-serif leading-relaxed">{lesson.summary}</p>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                                          <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-2.5 py-1 rounded-md flex items-center gap-1">
                                            <Clock size={10} />
                                            {lesson.duration}
                                          </span>
                                          <button 
                                            onClick={() => handlePlayAudio(lesson.title, lesson.id)}
                                            className="text-[#0c2e24] hover:text-[#c5a059] font-bold cursor-pointer transition-colors"
                                            id={`listen-lesson-btn-${lesson.id}`}
                                          >
                                            الاستماع
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}


                {/* ======================================================== */}
                {/* 7. LECTURES CORNER */}
                {/* ======================================================== */}
                {filteredLectures.length > 0 && (
                  <div className="space-y-5" id="lectures-section">
                    <div className="border-b border-[#0c2e24]/10 pb-2">
                      <h3 className="font-serif font-bold text-lg text-gray-900 flex items-center gap-2.5">
                        <Mic className="text-[#0c2e24]" size={20} />
                        ركن المحاضرات والندوات العامة
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredLectures.map((lec) => (
                        <div 
                          key={lec.id} 
                          className="bg-white rounded-2xl border border-gray-200/60 p-6 sm:p-7 shadow-premium shadow-premium-hover transition-all flex flex-col justify-between space-y-4"
                          id={`lecture-item-${lec.id}`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] text-gray-400">
                              <span className="flex items-center gap-1"><Calendar size={11} /> {lec.date}</span>
                              <span className="flex items-center gap-1"><Clock size={11} /> {lec.duration}</span>
                            </div>

                            <h4 className="font-sans font-bold text-sm text-gray-900 leading-snug">{lec.title}</h4>
                            <p className="text-[11px] text-gray-400 flex items-center gap-1">
                              <MapPin size={11} className="text-[#c5a059]" />
                              <span>{lec.location}</span>
                            </p>

                            <div className="space-y-1 pt-2">
                              <span className="block text-[10px] font-semibold text-gray-500">أبرز المحاور المطروحة:</span>
                              <ul className="space-y-1.5 text-xs text-gray-600 list-inside">
                                {lec.topics.map((top, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                                    <span className="text-[#c5a059] mt-1">•</span>
                                    <span>{top}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[10px] text-gray-400 font-mono">بث مرئي مسجل</span>
                            <button 
                              onClick={() => alert(`فتح رابط مشاهدة المحاضرة: ${lec.title}`)}
                              className="text-[#0c2e24] hover:text-[#c5a059] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                              id={`watch-lecture-btn-${lec.id}`}
                            >
                              <span>مشاهدة البث</span>
                              <ExternalLink size={12} />
                            </button>
                          </div>

                          {/* Simple Comment / Benefit System */}
                          <ItemComments itemId={lec.id} itemTitle={lec.title} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {/* ======================================================== */}
                {/* 8. TWEETS / SHORT NOTES */}
                {/* ======================================================== */}
                {filteredTweets.length > 0 && (
                  <div className="space-y-5" id="tweets-section">
                    <div className="border-b border-[#0c2e24]/10 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <h3 className="font-serif font-bold text-lg text-gray-900 flex items-center gap-2.5">
                        <Send className="text-sky-600 animate-pulse" size={20} />
                        تغريدات وفوائد الشيخ الدعوية (مزامنة فورية مع التليجرام)
                      </h3>
                      
                      <div className="flex items-center gap-2">
                        <a 
                          href="https://t.me/Nasr_Barakat_ch" 
                          target="_blank" 
                          rel="noreferrer noopener"
                          className="bg-sky-50 hover:bg-sky-100 border border-sky-200/60 text-sky-700 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Send size={11} className="-rotate-12" />
                          <span>قناة التليجرام الرسمية</span>
                          <ExternalLink size={9} />
                        </a>

                        <div className="bg-emerald-50 border border-emerald-150 text-[10px] text-emerald-800 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 select-none">
                          <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${isSyncingTelegram ? 'animate-ping' : 'animate-pulse'}`}></span>
                          <span>{isSyncingTelegram ? 'جاري المزامنة...' : 'متصل وتلقائي'}</span>
                        </div>
                      </div>
                    </div>

                    {telegramSyncError && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg font-serif">
                        ⚠️ {telegramSyncError}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {filteredTweets.map((tw) => {
                        const customLikes = tweetsLikes[tw.id] !== undefined ? tw.likes + tweetsLikes[tw.id] : tw.likes;
                        const customRetweets = tweetsRetweets[tw.id] !== undefined ? tw.retweets + tweetsRetweets[tw.id] : tw.retweets;
                        const isTgPost = tw.isTelegram || tw.id.startsWith('telegram-');
                        return (
                          <div 
                            key={tw.id} 
                            className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-premium shadow-premium-hover transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group text-right"
                            id={`tweet-item-${tw.id}`}
                          >
                            {isTgPost && (
                              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-sky-400 to-blue-500"></div>
                            )}

                            <div className="flex items-center justify-between border-b border-gray-50 pb-2.5">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-9 h-9 rounded-full font-serif font-bold text-xs flex items-center justify-center ${isTgPost ? 'bg-sky-500 text-white' : 'bg-[#0c2e24] text-[#c5a059]'}`}>
                                  {isTgPost ? <Send size={13} className="-rotate-12" /> : 'ن'}
                                </div>
                                <div className="text-right">
                                  <span className="block text-xs font-bold text-gray-900">د. نصر بركات</span>
                                  <span className="block text-[9px] text-gray-400 font-mono">
                                    {isTgPost ? 'تليجرام @Nasr_Barakat_ch' : '@Dr_NasrBarakat'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isTgPost && (
                                  <span className="bg-sky-50 text-sky-600 border border-sky-100 text-[8px] font-black px-2 py-0.5 rounded-md">
                                    منشور تليجرام
                                  </span>
                                )}
                                <span className="text-[10px] text-gray-400 font-mono">{tw.date}</span>
                              </div>
                            </div>

                            {tw.imageUrl && (
                              <div className="rounded-xl overflow-hidden border border-gray-100 max-h-48 flex items-center justify-center bg-gray-50">
                                <img src={tw.imageUrl} alt="مرفق تليجرام" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                            )}

                            <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-serif whitespace-pre-line">
                              {tw.content}
                            </p>

                            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2.5 border-t border-gray-50 pr-1">
                              <button 
                                onClick={() => handleLikeTweet(tw.id)}
                                className="flex items-center gap-1.5 hover:text-rose-600 transition-colors cursor-pointer font-bold"
                                id={`like-tweet-${tw.id}`}
                              >
                                <ThumbsUp size={12} />
                                <span className="font-mono">{customLikes}</span>
                              </button>
                              
                              <button 
                                onClick={() => handleRetweet(tw.id)}
                                className="flex items-center gap-1.5 hover:text-[#0c2e24] transition-colors cursor-pointer font-bold"
                                id={`retweet-${tw.id}`}
                              >
                                <Share2 size={12} />
                                <span className="font-mono">{customRetweets}</span>
                              </button>

                              {isTgPost ? (
                                <a 
                                  href={tw.link || 'https://t.me/Nasr_Barakat_ch'} 
                                  target="_blank" 
                                  rel="noreferrer noopener"
                                  className="text-sky-600 hover:text-sky-700 transition-colors text-[10px] font-black cursor-pointer flex items-center gap-1"
                                >
                                  <span>عرض بالتليجرام</span>
                                  <ExternalLink size={10} />
                                </a>
                              ) : (
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(tw.content);
                                    alert('تم نسخ الفائدة لمشاركتها');
                                  }}
                                  className="hover:text-[#0c2e24] transition-colors text-[10px] font-bold cursor-pointer"
                                  id={`share-tweet-${tw.id}`}
                                >
                                  نسخ الفائدة
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}


                {/* ======================================================== */}
                {/* 9. COMMENTARIES ON ISLAMIC WORLD EVENTS */}
                {/* ======================================================== */}
                {filteredEvents.length > 0 && (
                  <div className="space-y-5" id="events-section">
                    <div className="border-b border-[#0c2e24]/10 pb-2">
                      <h3 className="font-serif font-bold text-lg text-gray-900 flex items-center gap-2.5">
                        <Compass className="text-[#0c2e24]" size={20} />
                        التعليق على أحداث وقضايا العالم الإسلامي
                      </h3>
                    </div>

                    <div className="space-y-5">
                      {filteredEvents.map((evt) => (
                        <div 
                          key={evt.id} 
                          className="bg-white rounded-2xl border-2 border-rose-50/50 p-6 sm:p-7 shadow-premium shadow-premium-hover transition-all space-y-3 relative overflow-hidden"
                          id={`event-item-${evt.id}`}
                        >
                          {/* Accent corner line for topical importance */}
                          <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-rose-500/10 to-transparent pointer-events-none"></div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-50 pb-2.5">
                            <span className="inline-block bg-rose-50 text-rose-800 text-[10px] font-bold px-3 py-1 rounded-md border border-rose-100">
                              {evt.category}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                              <Calendar size={12} />
                              <span>تاريخ النشر: {evt.publishDate}</span>
                            </div>
                          </div>

                          <h4 className="font-sans font-extrabold text-base text-[#0c2e24]">{evt.title}</h4>
                          <p className="text-sm text-gray-700 font-serif leading-relaxed whitespace-pre-line">{evt.content}</p>

                          <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs">
                            <span className="text-[10px] text-gray-400">قلم د. نصر بن إبراهيم بركات</span>
                            <button 
                              onClick={() => alert(`مشاركة مقال التعقيب: ${evt.title}`)}
                              className="text-[#0c2e24] hover:text-[#c5a059] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                              id={`share-event-btn-${evt.id}`}
                            >
                              <Share2 size={12} />
                              <span>مشاركة التحليل</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {/* ======================================================== */}
                {/* 10. DAWAH PROJECTS */}
                {/* ======================================================== */}
                {filteredProjects.length > 0 && (
                  <div className="space-y-5" id="projects-section">
                    <div className="border-b border-[#0c2e24]/10 pb-2">
                      <h3 className="font-serif font-bold text-lg text-gray-900 flex items-center gap-2.5">
                        <TrendingUp className="text-[#0c2e24]" size={20} />
                        ركن المشاريع والمبادرات الدعوية والإنسانية
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredProjects.map((proj) => (
                        <div 
                          key={proj.id} 
                          className="bg-white rounded-2xl border border-gray-200/60 p-6 sm:p-7 shadow-premium shadow-premium-hover transition-all flex flex-col justify-between space-y-4"
                          id={`project-item-${proj.id}`}
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full ${
                                proj.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/50' :
                                proj.status === 'ongoing' ? 'bg-blue-50 text-blue-800 border border-blue-200/50' :
                                'bg-amber-50 text-amber-800 border border-amber-200/50'
                              }`}>
                                {proj.status === 'completed' ? 'منجز بفضل الله' : 
                                 proj.status === 'ongoing' ? 'قيد التنفيذ والمتابعة' : 'مشروع مخطط له'}
                              </span>
                              
                              <span className="text-[10px] font-mono font-bold text-emerald-900">{proj.progressPercentage}%</span>
                            </div>

                            <h4 className="font-sans font-bold text-sm sm:text-base text-gray-900 leading-snug">{proj.title}</h4>
                            <p className="text-xs text-gray-600 font-serif leading-relaxed">{proj.description}</p>

                            {/* Goals List */}
                            <div className="space-y-1.5 pt-2">
                              <span className="block text-[10px] font-bold text-gray-500">أبرز أهداف المشروع:</span>
                              <ul className="space-y-1 text-[11px] text-gray-600 list-inside">
                                {proj.goals.map((g, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                                    <span className="text-[#c5a059] mt-1">✓</span>
                                    <span>{g}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-3 pt-3 border-t border-gray-100">
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-[#0c2e24] to-[#c5a059] h-full rounded-full" 
                                style={{ width: `${proj.progressPercentage}%` }}
                              ></div>
                            </div>

                            <div className="bg-[#faf9f6] p-3 rounded-xl border border-gray-100 text-[10px] leading-relaxed">
                              <span className="font-bold text-emerald-950 block mb-0.5">كيف يمكنك المساعدة والتطوع:</span>
                              <p className="text-gray-700">{proj.howToHelp}</p>
                            </div>

                            <button 
                              onClick={() => setIsVolunteerOpen(true)}
                              className="w-full bg-[#0c2e24] hover:bg-emerald-950 text-[#faf9f6] py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                              id={`help-project-btn-${proj.id}`}
                            >
                              <span>ساهم معنا في هذا المشروع</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {/* ======================================================== */}
                {/* 11. EDUCATIONAL PLANS FOR STUDENTS OF KNOWLEDGE */}
                {/* ======================================================== */}
                {filteredPlans.length > 0 && (
                  <div className="space-y-5" id="plans-section">
                    <div className="border-b border-[#0c2e24]/10 pb-2">
                      <h3 className="font-serif font-bold text-lg text-gray-900 flex items-center gap-2.5">
                        <Award className="text-[#0c2e24]" size={20} />
                        خطط تعليمية ومسارات تأصيلية لطلاب العلم الشريف
                      </h3>
                    </div>

                    <div className="space-y-6">
                      {filteredPlans.map((plan) => (
                        <div 
                          key={plan.id} 
                          className="bg-white rounded-2xl border border-gray-200/60 p-6 sm:p-7 shadow-premium space-y-4"
                          id={`plan-item-${plan.id}`}
                        >
                          <div className="space-y-1">
                            <span className="inline-block bg-[#c5a059]/10 text-[#7c622d] text-[10px] font-bold px-3 py-1 rounded-md border border-[#c5a059]/20">
                              المدة الموصى بها: {plan.duration}
                            </span>
                            <h4 className="font-sans font-extrabold text-base text-gray-950 mt-1">{plan.title}</h4>
                            <p className="text-xs text-gray-500 leading-relaxed font-serif">
                              <strong>الفئة المستهدفة:</strong> {plan.targetGroup}
                            </p>
                          </div>

                          {/* Stages Timeline */}
                          <div className="space-y-4 pt-4 border-t border-gray-100">
                            {plan.stages.map((stage, sIdx) => (
                              <div key={sIdx} className="flex gap-4 relative">
                                {/* Timeline line */}
                                {sIdx !== plan.stages.length - 1 && (
                                  <div className="absolute top-6 right-3 bottom-0 w-0.5 bg-gray-100"></div>
                                )}
                                
                                {/* Timeline Circle */}
                                <div className="w-7 h-7 rounded-full bg-[#0c2e24] text-[#e2c17c] font-bold text-xs flex items-center justify-center border border-[#c5a059]/40 shrink-0 mt-1 relative z-10 font-mono shadow-xs">
                                  {sIdx + 1}
                                </div>

                                <div className="space-y-2 pb-2">
                                  <h5 className="font-sans font-bold text-xs text-gray-900">{stage.stageTitle}</h5>
                                  
                                  {/* Stage Books */}
                                  <div className="flex flex-wrap gap-1.5">
                                    {stage.books.map((b, bIdx) => (
                                      <span key={bIdx} className="bg-[#faf9f6] text-[#7c622d] text-[10px] font-bold px-2.5 py-1 rounded-md border border-[#c5a059]/25">
                                        📖 {b}
                                      </span>
                                    ))}
                                  </div>

                                  {/* Stage Objectives */}
                                  <div className="space-y-1">
                                    <span className="block text-[10px] font-semibold text-gray-500">أبرز ثمرات وأهداف المرحلة:</span>
                                    <ul className="space-y-1 text-xs text-gray-600">
                                      {stage.objectives.map((obj, oIdx) => (
                                        <li key={oIdx} className="flex items-start gap-1.5 leading-relaxed">
                                          <span className="text-[#0c2e24] mt-1">✓</span>
                                          <span>{obj}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-3 border-t border-gray-100 flex justify-end">
                            <button 
                              onClick={() => alert(`بدء تتبع خطتكم الدراسية مع منسق خطط الشيخ، تقبل الله خطاكم وسعيكم!`)}
                              className="text-[#0c2e24] hover:text-[#c5a059] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                              id={`start-plan-btn-${plan.id}`}
                            >
                              <span>اعتماد وتنزيل الخطة التعليمية</span>
                              <Download size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {/* ======================================================== */}
                {/* 12. DAWAH IDEAS THESAURUS */}
                {/* ======================================================== */}
                {showThesaurus && (
                  <div className="space-y-5" id="thesaurus">
                    <div className="border-b border-[#0c2e24]/10 pb-2">
                      <h3 className="font-serif font-bold text-lg text-gray-900 flex items-center gap-2.5">
                        <Lightbulb className="text-[#0c2e24]" size={20} />
                        مكنز الأفكار والمبادرات الدعوية التفاعلي
                      </h3>
                    </div>

                    {/* Highly interactive DawahThesaurus widget */}
                    <DawahThesaurus />
                  </div>
                )}

              </div>
            )}
          </AnimatePresence>

        </section>

      </main>

      {/* 4. FOOTER & CONTACT CHANNELS */}
      <footer className="bg-[#2d1a0a] text-gray-300 border-t border-[#c5a059]/45" id="footer-section">
        
        {/* Dynamic Pattern Line */}
        <div className="h-1 bg-gradient-to-r from-[#b38f36] via-[#e2c17c] to-[#c5a059]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10" dir="rtl">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center text-center md:text-right border-b border-[#4a3118] pb-10">
            
            {/* Column 1: App Info */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-lg text-[#e2c17c]">مدونة رحيق السنين</h4>
              <p className="text-xs text-amber-100/80 leading-relaxed max-w-sm">
                المنبر الرسمي الإلكتروني للتعليم والبحث والدعوة لفضيلة الدكتور نصر بن إبراهيم بركات. نسعى لنشر الفكر المعتدل والمعرفة الأصيلة وحفظ هويتنا الإسلامية في مواجهة التحديات المعاصرة.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="font-sans font-bold text-xs text-[#e2c17c] uppercase tracking-wide">الوصول السريع للأركان</h4>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <button 
                  onClick={() => setActiveCategory('biography')}
                  className="bg-[#4a3118] hover:bg-[#8c5e3c] text-xs px-3 py-1.5 rounded-lg text-[#e2c17c] border border-[#c5a059]/20 cursor-pointer transition-colors"
                  id="footer-link-bio"
                >
                  السيرة الذاتية
                </button>
                <button 
                  onClick={() => setActiveCategory('books')}
                  className="bg-[#4a3118] hover:bg-[#8c5e3c] text-xs px-3 py-1.5 rounded-lg text-[#e2c17c] border border-[#c5a059]/20 cursor-pointer transition-colors"
                  id="footer-link-books"
                >
                  ركن الكتب
                </button>
                <button 
                  onClick={() => setActiveCategory('thesaurus')}
                  className="bg-[#4a3118] hover:bg-[#8c5e3c] text-xs px-3 py-1.5 rounded-lg text-[#e2c17c] border border-[#c5a059]/20 cursor-pointer transition-colors"
                  id="footer-link-thesaurus"
                >
                  مكنز الأفكار
                </button>
                <button 
                  onClick={() => setIsVolunteerOpen(true)}
                  className="bg-[#4a3118] hover:bg-[#8c5e3c] text-xs px-3 py-1.5 rounded-lg text-[#e2c17c] border border-[#c5a059]/20 cursor-pointer transition-colors"
                  id="footer-link-volunteer"
                >
                  طلب التطوع والمساهمة
                </button>
              </div>
            </div>

            {/* Column 3: Contact Channels */}
            <div className="space-y-4">
              <h4 className="font-sans font-bold text-xs text-[#e2c17c] uppercase tracking-wide">تواصل مباشرة مع إدارة المدونة</h4>
              <p className="text-[11px] text-amber-100/60 leading-relaxed">
                يسعدنا تلقي استفساراتكم العلمية والتقنية وتنسيق مواعيد محاضرات الشيخ عبر القنوات المعتمدة المباشرة أدناه:
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-3 pt-1">
                {/* WhatsApp button */}
                <a 
                  href="https://wa.me/966501234567" 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-[#4a3118] hover:bg-[#128c7e] text-[#faf9f6] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-[#c5a059]/15 transition-colors cursor-pointer hover:shadow-md"
                  id="footer-whatsapp-btn"
                >
                  <MessageCircle size={15} className="fill-[#faf9f6]/10" />
                  <span>واتساب: +966 50 123 4567</span>
                </a>

                {/* Telegram button */}
                <a 
                  href="https://t.me/Dr_NasrBarakat" 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-[#4a3118] hover:bg-[#0088cc] text-[#faf9f6] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-[#c5a059]/15 transition-colors cursor-pointer hover:shadow-md"
                  id="footer-telegram-btn"
                >
                  <Send size={15} />
                  <span>تليجرام: @Dr_NasrBarakat</span>
                </a>
              </div>
            </div>

          </div>

          {/* Copyright details */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-amber-100/50">
            <div className="flex items-center gap-2">
              <Phone size={12} className="text-[#c5a059]" />
              <span>هاتف الإدارة والمكتب الدعوي: <span className="font-mono text-amber-50 font-semibold">+966 12 555 4321</span></span>
            </div>
            
            <p className="text-center font-serif text-[11px]">
              © {new Date().getFullYear()} مدونة رحيق السنين لفضيلة د. نصر بن إبراهيم بركات. كافة الحقوق محفوظة ومتاحة لوجه الله تعالى في نشر الدعوة المباركة.
            </p>
          </div>

        </div>

      </footer>

      {/* 5. VOLUNTEERING MODAL */}
      <VolunteerModal 
        isOpen={isVolunteerOpen} 
        onClose={() => setIsVolunteerOpen(false)} 
      />

      {/* 6. ADMIN SECURITY PANEL */}
      <AdminPanel 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        biography={biography}
        setBiography={setBiography}
        books={books}
        setBooks={setBooks}
        articles={articles}
        setArticles={setArticles}
        bookSummaries={bookSummaries}
        setBookSummaries={setBookSummaries}
        speeches={speeches}
        setSpeeches={setSpeeches}
        lessonSeries={lessonSeries}
        setLessonSeries={setLessonSeries}
        lectures={lectures}
        setLectures={setLectures}
        tweets={tweets}
        setTweets={setTweets}
        ummahEvents={ummahEvents}
        setUmmahEvents={setUmmahEvents}
        dawahProjects={dawahProjects}
        setDawahProjects={setDawahProjects}
        educationPlans={educationPlans}
        setEducationPlans={setEducationPlans}
        uploadedFiles={uploadedFiles}
        setUploadedFiles={setUploadedFiles}
      />

      {/* Floating Admin Key Access */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsAdminOpen(true)}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-[#8c5e3c] to-[#3d2411] text-[#e2c17c] hover:text-[#faf9f6] flex items-center justify-center shadow-lg border border-[#c5a059]/30 hover:shadow-[#c5a059]/20 hover:scale-110 active:scale-95 transition-all cursor-pointer group"
          title="لوحة التحكم الفنية الآمنة"
          id="floating-admin-trigger-btn"
        >
          <Lock size={18} className="group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* 7. FLOATING AUDIO MEDIA PLAYER */}
      <AnimatePresence>
        {currentAudio && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-6 right-6 md:right-auto md:max-w-md bg-[#0c2e24] text-white rounded-2xl shadow-2xl border border-[#c5a059]/40 p-4 z-50 flex items-center justify-between gap-4"
            dir="rtl"
            id="floating-audio-player"
          >
            {/* Audio Element */}
            <audio 
              ref={audioRef} 
              src={currentAudio.url} 
              onPlay={() => setIsAudioPlaying(true)} 
              onPause={() => setIsAudioPlaying(false)}
              onEnded={() => setIsAudioPlaying(false)}
              autoPlay
            />

            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-[#e2c17c]/20 text-[#e2c17c] flex items-center justify-center shrink-0 border border-[#c5a059]/20">
                {isAudioPlaying ? (
                  <span className="flex gap-0.5 items-end h-4">
                    <span className="w-0.75 bg-[#e2c17c] animate-[bounce_0.8s_infinite]"></span>
                    <span className="w-0.75 bg-[#e2c17c] animate-[bounce_0.8s_infinite_0.2s]"></span>
                    <span className="w-0.75 bg-[#e2c17c] animate-[bounce_0.8s_infinite_0.4s]"></span>
                  </span>
                ) : (
                  <Music size={16} />
                )}
              </div>
              <div className="overflow-hidden">
                <span className="block text-[9px] text-[#e2c17c] font-bold tracking-widest uppercase">
                  {currentAudio.isLive ? 'بث مباشر للمادة العلمية' : 'تشغيل مادة صوتية'}
                </span>
                <span className="block text-xs font-semibold truncate text-amber-50/95 leading-relaxed">
                  {currentAudio.title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                className="w-8 h-8 rounded-full bg-[#e2c17c] text-[#0c2e24] flex items-center justify-center shadow-md hover:bg-[#faf9f6] transition-colors cursor-pointer"
                title={isAudioPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              >
                {isAudioPlaying ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current ml-0.5" />}
              </button>
              <button
                onClick={() => {
                  setIsAudioPlaying(false);
                  setCurrentAudio(null);
                }}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="إغلاق المشغل"
              >
                <X size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
