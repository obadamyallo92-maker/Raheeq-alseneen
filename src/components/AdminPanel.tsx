import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Unlock, Plus, Trash2, Edit2, Check, FileText, BookOpen, Volume2, 
  Layers, Mic, PenTool, Compass, TrendingUp, Award, Lightbulb, CheckCircle, 
  Eye, Settings, LogOut, Users, RefreshCw, FileUp, AlertCircle, Save, Send, ExternalLink
} from 'lucide-react';
import { Book, Article, BookSummary, Speech, LessonSeries, Lecture, Tweet, DawahProject, EducationPlan } from '../types';
import { saveFile, deleteFile } from '../lib/indexedDb';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  biography: any;
  setBiography: React.Dispatch<React.SetStateAction<any>>;
  books: Book[];
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  bookSummaries: BookSummary[];
  setBookSummaries: React.Dispatch<React.SetStateAction<BookSummary[]>>;
  speeches: Speech[];
  setSpeeches: React.Dispatch<React.SetStateAction<Speech[]>>;
  lessonSeries: LessonSeries[];
  setLessonSeries: React.Dispatch<React.SetStateAction<LessonSeries[]>>;
  lectures: Lecture[];
  setLectures: React.Dispatch<React.SetStateAction<Lecture[]>>;
  tweets: Tweet[];
  setTweets: React.Dispatch<React.SetStateAction<Tweet[]>>;
  ummahEvents: Article[];
  setUmmahEvents: React.Dispatch<React.SetStateAction<Article[]>>;
  dawahProjects: DawahProject[];
  setDawahProjects: React.Dispatch<React.SetStateAction<DawahProject[]>>;
  educationPlans: EducationPlan[];
  setEducationPlans: React.Dispatch<React.SetStateAction<EducationPlan[]>>;
  uploadedFiles: any[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function AdminPanel({
  isOpen,
  onClose,
  biography,
  setBiography,
  books,
  setBooks,
  articles,
  setArticles,
  bookSummaries,
  setBookSummaries,
  speeches,
  setSpeeches,
  lessonSeries,
  setLessonSeries,
  lectures,
  setLectures,
  tweets,
  setTweets,
  ummahEvents,
  setUmmahEvents,
  dawahProjects,
  setDawahProjects,
  educationPlans,
  setEducationPlans,
  uploadedFiles,
  setUploadedFiles
}: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState(() => {
    return localStorage.getItem('admin_password') || '123456';
  });
  const [passwordError, setPasswordError] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'bio' | 'uploader' | 'books' | 'articles' | 'speeches' | 'volunteers' | 'security'>('stats');

  // Biography Form State
  const [bioName, setBioName] = useState(biography.name);
  const [bioTitle, setBioTitle] = useState(biography.title);
  const [bioAbout, setBioAbout] = useState(biography.about);
  const [bioDegreeInput, setBioDegreeInput] = useState('');
  const [bioDegrees, setBioDegrees] = useState<string[]>(biography.degrees || []);
  const [bioPositionInput, setBioPositionInput] = useState('');
  const [bioPositions, setBioPositions] = useState<string[]>(biography.positions || []);

  // Volunteer Submission State
  const [volunteers, setVolunteers] = useState<any[]>([]);

  // Password Settings State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  // File Upload State
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileTargetCategory, setFileTargetCategory] = useState<'books' | 'speeches' | 'articles'>('books');
  const [fileCustomTitle, setFileCustomTitle] = useState('');
  const [fileCustomDescription, setFileCustomDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(-1); // -1 means idle

  // Content Creators Forms
  const [newBook, setNewBook] = useState({ title: '', description: '', publishYear: '', pages: 200, coverColor: 'emerald' });
  const [bookPdfFile, setBookPdfFile] = useState<File | null>(null);
  const [newArticle, setNewArticle] = useState({ title: '', content: '', category: 'أصول الفقه', type: 'article' });
  const [newSpeech, setNewSpeech] = useState({ title: '', location: 'جامع الوعي بمكة المكرمة', transcript: '', audioDuration: '25 دقيقة' });

  useEffect(() => {
    if (isOpen) {
      // Reload volunteers from localStorage
      const savedVolunteers = JSON.parse(localStorage.getItem('volunteer_submissions') || '[]');
      setVolunteers(savedVolunteers);

      // Re-sync bio states
      setBioName(biography.name);
      setBioTitle(biography.title);
      setBioAbout(biography.about);
      setBioDegrees(biography.degrees || []);
      setBioPositions(biography.positions || []);
    }
  }, [isOpen, biography]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === currentPassword) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.');
    }
  };

  const handleSaveBio = () => {
    const updatedBio = {
      ...biography,
      name: bioName,
      title: bioTitle,
      about: bioAbout,
      degrees: bioDegrees,
      positions: bioPositions
    };
    setBiography(updatedBio);
    localStorage.setItem('biography_data', JSON.stringify(updatedBio));
    alert('تم حفظ البيانات الشخصية والأكاديمية بنجاح!');
  };

  // Add Item Helpers
  const addDegree = () => {
    if (bioDegreeInput.trim()) {
      setBioDegrees([...bioDegrees, bioDegreeInput.trim()]);
      setBioDegreeInput('');
    }
  };

  const removeDegree = (index: number) => {
    setBioDegrees(bioDegrees.filter((_, i) => i !== index));
  };

  const addPosition = () => {
    if (bioPositionInput.trim()) {
      setBioPositions([...bioPositions, bioPositionInput.trim()]);
      setBioPositionInput('');
    }
  };

  const removePosition = (index: number) => {
    setBioPositions(bioPositions.filter((_, i) => i !== index));
  };

  // Delete Material Helpers
  const handleDeleteBook = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الكتاب نهائياً؟')) {
      const updated = books.filter(b => b.id !== id);
      setBooks(updated);
      localStorage.setItem('books_data', JSON.stringify(updated));
    }
  };

  const handleDeleteArticle = (id: string, isEvent: boolean) => {
    if (confirm('هل أنت متأكد من حذف هذا المقال نهائياً؟')) {
      if (isEvent) {
        const updated = ummahEvents.filter(a => a.id !== id);
        setUmmahEvents(updated);
        localStorage.setItem('ummah_events_data', JSON.stringify(updated));
      } else {
        const updated = articles.filter(a => a.id !== id);
        setArticles(updated);
        localStorage.setItem('articles_data', JSON.stringify(updated));
      }
    }
  };

  const handleDeleteSpeech = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المادة الصوتية نهائياً؟')) {
      const updated = speeches.filter(s => s.id !== id);
      setSpeeches(updated);
      localStorage.setItem('speeches_data', JSON.stringify(updated));
    }
  };

  const handleDeleteVolunteer = (id: string) => {
    if (confirm('هل تريد حذف هذا المتطوع بعد التنسيق معه؟')) {
      const updated = volunteers.filter(v => v.id !== id);
      setVolunteers(updated);
      localStorage.setItem('volunteer_submissions', JSON.stringify(updated));
    }
  };

  const handleClearAllVolunteers = () => {
    if (confirm('تحذير: هل أنت متأكد من إفراغ جميع طلبات التوظيف والتطوع؟')) {
      setVolunteers([]);
      localStorage.removeItem('volunteer_submissions');
    }
  };

  // Add Book Form Handler
  const handleAddBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title.trim()) return;

    let fileId = '#';
    if (bookPdfFile) {
      fileId = 'file_' + Math.random().toString(36).substring(2, 9);
      await saveFile(fileId, bookPdfFile);

      const fileItem = {
        id: fileId,
        fileName: bookPdfFile.name,
        fileSize: (bookPdfFile.size / (1024 * 1024)).toFixed(2) + ' MB',
        fileType: bookPdfFile.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
        title: newBook.title,
        description: newBook.description || 'مؤلف علمي مرفوع حديثاً لفضيلة الشيخ.',
        uploadDate: new Date().toLocaleDateString('ar-EG'),
        category: 'books',
      };

      const updatedFilesList = [fileItem, ...uploadedFiles];
      setUploadedFiles(updatedFilesList);
      localStorage.setItem('uploaded_files_data', JSON.stringify(updatedFilesList));
    }

    const bookItem: Book = {
      id: 'b_custom_' + Math.random().toString(36).substring(2, 9),
      title: newBook.title,
      description: newBook.description,
      publishYear: newBook.publishYear || '1447 هـ',
      pages: Number(newBook.pages) || 150,
      coverColor: newBook.coverColor,
      downloadUrl: fileId
    };

    const updated = [bookItem, ...books];
    setBooks(updated);
    localStorage.setItem('books_data', JSON.stringify(updated));
    setNewBook({ title: '', description: '', publishYear: '', pages: 200, coverColor: 'emerald' });
    setBookPdfFile(null);
    alert('تم إضافة الكتاب بنجاح وحفظ الملف المرفق في المكتبة العلنية!');
  };

  // Add Article Form Handler
  const handleAddArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArticle.title.trim() || !newArticle.content.trim()) return;

    const articleItem: Article = {
      id: 'a_custom_' + Math.random().toString(36).substring(2, 9),
      title: newArticle.title,
      content: newArticle.content,
      publishDate: new Date().toISOString().split('T')[0],
      category: newArticle.category
    };

    if (newArticle.type === 'event') {
      const updated = [articleItem, ...ummahEvents];
      setUmmahEvents(updated);
      localStorage.setItem('ummah_events_data', JSON.stringify(updated));
    } else {
      const updated = [articleItem, ...articles];
      setArticles(updated);
      localStorage.setItem('articles_data', JSON.stringify(updated));
    }

    setNewArticle({ title: '', content: '', category: 'أصول الفقه', type: 'article' });
    alert('تم إضافة المقال/البحث بنجاح للمدونة!');
  };

  // Add Speech Form Handler
  const handleAddSpeechSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpeech.title.trim() || !newSpeech.transcript.trim()) return;

    const speechItem: Speech = {
      id: 's_custom_' + Math.random().toString(36).substring(2, 9),
      title: newSpeech.title,
      date: '1447 هـ',
      location: newSpeech.location,
      transcript: newSpeech.transcript,
      audioDuration: newSpeech.audioDuration
    };

    const updated = [speechItem, ...speeches];
    setSpeeches(updated);
    localStorage.setItem('speeches_data', JSON.stringify(updated));
    setNewSpeech({ title: '', location: 'جامع الوعي بمكة المكرمة', transcript: '', audioDuration: '25 دقيقة' });
    alert('تم إضافة الخطبة الصوتية بنجاح!');
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setFileCustomTitle(file.name.split('.')[0]);
    // Set appropriate target category based on extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'mp3' || extension === 'mp4') {
      setFileTargetCategory('speeches');
    } else if (extension === 'pdf' || extension === 'doc' || extension === 'docx') {
      setFileTargetCategory('books');
    }
  };

  // Simulated File Uploading
  const handleUploadFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    // Start progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Complete logic
          setTimeout(async () => {
            const fileId = 'file_' + Math.random().toString(36).substring(2, 9);
            const mockUrl = fileId; // We store the actual fileId so that downloading or playing it works
            
            // Save actual file data in IndexedDB
            await saveFile(fileId, selectedFile);

            const fileItem = {
              id: fileId,
              fileName: selectedFile.name,
              fileSize: (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB',
              fileType: selectedFile.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
              title: fileCustomTitle || selectedFile.name,
              description: fileCustomDescription || 'مادة علمية مرفوعة حديثاً من فضيلة الشيخ الدكتور نصر بركات.',
              uploadDate: new Date().toLocaleDateString('ar-SA'),
              category: fileTargetCategory,
              url: mockUrl
            };

            // Save to file registry
            const updatedFilesList = [fileItem, ...uploadedFiles];
            setUploadedFiles(updatedFilesList);
            localStorage.setItem('uploaded_files_data', JSON.stringify(updatedFilesList));

            // Integrate into corresponding public feed
            if (fileTargetCategory === 'books') {
              const newBookItem: Book = {
                id: 'b_uploaded_' + fileItem.id,
                title: fileItem.title,
                description: fileItem.description,
                publishYear: 'مرفوع حديثاً',
                pages: 120,
                coverColor: fileItem.fileType === 'PDF' ? 'slate' : 'indigo',
                downloadUrl: fileItem.id
              };
              const updatedBooks = [newBookItem, ...books];
              setBooks(updatedBooks);
              localStorage.setItem('books_data', JSON.stringify(updatedBooks));
            } else if (fileTargetCategory === 'speeches') {
              const newSpeechItem: Speech = {
                id: 's_uploaded_' + fileItem.id,
                title: fileItem.title,
                date: 'مرفوع حديثاً',
                location: 'الأرشيف الصوتي المرفوع',
                transcript: fileItem.description,
                audioDuration: fileItem.fileType === 'MP3' ? 'صوت MP3' : 'فيديو MP4'
              };
              const updatedSpeeches = [newSpeechItem, ...speeches];
              setSpeeches(updatedSpeeches);
              localStorage.setItem('speeches_data', JSON.stringify(updatedSpeeches));
            } else {
              // Add to articles
              const newArticleItem: Article = {
                id: 'a_uploaded_' + fileItem.id,
                title: fileItem.title,
                content: fileItem.description,
                publishDate: new Date().toISOString().split('T')[0],
                category: 'مستندات عامة'
              };
              const updatedArticles = [newArticleItem, ...articles];
              setArticles(updatedArticles);
              localStorage.setItem('articles_data', JSON.stringify(updatedArticles));
            }

            // Reset states
            setSelectedFile(null);
            setFileCustomTitle('');
            setFileCustomDescription('');
            setUploadProgress(-1);
            alert(`تم رفع الملف "${fileItem.fileName}" بنجاح تام، وحفظه في الذاكرة المحلية ومزامنته بجميع أقسام المدونة!`);
          }, 300);

          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setPasswordError('كلمة المرور يجب أن تكون 4 أحرف أو أرقام على الأقل.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('كلمتا المرور غير متطابقتين.');
      return;
    }

    setCurrentPassword(newPassword);
    localStorage.setItem('admin_password', newPassword);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setSecuritySuccess('تم تغيير كلمة السر بنجاح تام! يرجى استخدامها في المرات القادمة.');
    setTimeout(() => setSecuritySuccess(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-2 sm:p-4 overflow-y-auto" id="admin-panel-container">
      
      {!isAuthenticated ? (
        /* Login Dialog Panel */
        <div 
          className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#c5a059]/40 overflow-hidden relative p-6 sm:p-8 space-y-6"
          dir="rtl"
          id="admin-login-card"
        >
          {/* Top Islamic Styled Line */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#b38f36] via-[#f5e4bd] to-[#c5a059]"></div>
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-[#3d2411] text-[#e2c17c] rounded-full flex items-center justify-center mx-auto border border-[#c5a059]/30 shadow-md">
              <Lock size={24} />
            </div>
            <h3 className="font-serif font-bold text-xl text-gray-900">بوابة التحكم الآمنة</h3>
            <p className="text-xs text-gray-500 font-serif leading-relaxed">
              هذه اللوحة مخصصة لفضيلة الدكتور والمنسقين لإدارة المدونة ورفع الملفات وتعديل العناوين.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                أدخل كلمة مرور المدونة أو مفتاح القفل
              </label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-sm text-center font-mono tracking-widest border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#8c5e3c] focus:border-[#8c5e3c] rounded-xl bg-[#faf9f6]/40 transition-all text-gray-900"
                placeholder="••••••"
                autoFocus
                id="admin-password-input"
              />
              <p className="text-[10px] text-amber-800/80 mt-1.5 font-sans text-center bg-amber-50 border border-amber-200/50 p-2 rounded-lg">
                💡 مفتاح القفل الافتراضي للتجربة هو: <span className="font-bold text-amber-950 font-mono">123456</span>
              </p>
              {passwordError && (
                <p className="text-xs text-rose-600 mt-2 text-center font-semibold flex items-center justify-center gap-1">
                  <AlertCircle size={14} />
                  <span>{passwordError}</span>
                </p>
              )}
            </div>

            <div className="flex gap-2.5 pt-1">
              <button 
                type="submit"
                className="flex-1 bg-[#8c5e3c] hover:bg-[#66462c] text-[#faf9f6] py-3 rounded-xl text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
                id="admin-login-submit"
              >
                فتح لوحة التحكم
              </button>
              <button 
                type="button"
                onClick={onClose}
                className="px-5 py-3 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-100 transition-all cursor-pointer"
                id="admin-login-cancel"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Full Dashboard Admin Panel */
        <div 
          className="bg-[#faf9f6] w-full max-w-5xl h-[88vh] sm:h-[82vh] rounded-3xl shadow-2xl border border-[#c5a059]/40 overflow-hidden flex flex-col relative"
          dir="rtl"
          id="admin-dashboard-panel"
        >
          {/* Decorative Top Border */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#b38f36] via-[#f5e4bd] to-[#c5a059] z-20"></div>

          {/* Header */}
          <div className="bg-[#3d2411] text-[#faf9f6] px-6 py-4 border-b border-[#c5a059]/30 flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#e2c17c]/10 text-[#e2c17c] border border-[#e2c17c]/20 rounded-xl">
                <Settings size={20} className="animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-serif font-black text-base sm:text-lg text-[#e2c17c]">لوحة التحكم التفاعلية للمدونة</h3>
                <p className="text-[10px] text-amber-200/80">إدارة المحتوى وتعديل العناوين ورفع الوسائط والمستندات بكلمة سر آمنة</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsAuthenticated(false)}
                className="p-1.5 text-amber-200/70 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-all text-xs flex items-center gap-1 font-serif cursor-pointer"
                title="تسجيل الخروج وقفل اللوحة"
                id="admin-logout-btn"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">قفل اللوحة</span>
              </button>
              <button 
                onClick={onClose}
                className="p-1.5 text-amber-200/70 hover:text-white rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                id="admin-close-btn"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Workspace Grid */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
            
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-56 bg-white border-l border-gray-200/60 p-4 space-y-1.5 overflow-y-auto shrink-0 md:h-full flex flex-row md:flex-col gap-1.5 md:gap-0 sticky top-0 z-10 md:static">
              
              <button 
                onClick={() => setActiveTab('stats')}
                className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer shrink-0 ${
                  activeTab === 'stats' ? 'bg-[#8c5e3c] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <TrendingUp size={15} />
                <span>إحصائيات المدونة</span>
              </button>

              <button 
                onClick={() => setActiveTab('bio')}
                className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer shrink-0 ${
                  activeTab === 'bio' ? 'bg-[#8c5e3c] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users size={15} />
                <span>البيانات الشخصية والبيو</span>
              </button>

              <button 
                onClick={() => setActiveTab('uploader')}
                className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer shrink-0 ${
                  activeTab === 'uploader' ? 'bg-[#8c5e3c] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileUp size={15} />
                <span>رفع ملفات (PDF/MP3)</span>
              </button>

              <button 
                onClick={() => setActiveTab('books')}
                className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer shrink-0 ${
                  activeTab === 'books' ? 'bg-[#8c5e3c] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BookOpen size={15} />
                <span>إدارة الكتب والمؤلفات</span>
              </button>

              <button 
                onClick={() => setActiveTab('articles')}
                className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer shrink-0 ${
                  activeTab === 'articles' ? 'bg-[#8c5e3c] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText size={15} />
                <span>إدارة البحوث والمقالات</span>
              </button>

              <button 
                onClick={() => setActiveTab('speeches')}
                className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer shrink-0 ${
                  activeTab === 'speeches' ? 'bg-[#8c5e3c] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Volume2 size={15} />
                <span>إدارة الخطب والمواد</span>
              </button>

              <button 
                onClick={() => setActiveTab('volunteers')}
                className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-2.5 cursor-pointer shrink-0 ${
                  activeTab === 'volunteers' ? 'bg-[#8c5e3c] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Award size={15} />
                  <span>طلبات المتطوعين</span>
                </div>
                {volunteers.length > 0 && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'volunteers' ? 'bg-white text-amber-950' : 'bg-rose-500 text-white animate-pulse'}`}>
                    {volunteers.length}
                  </span>
                )}
              </button>

              <div className="hidden md:block flex-1"></div>

              <button 
                onClick={() => setActiveTab('security')}
                className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer shrink-0 ${
                  activeTab === 'security' ? 'bg-[#8c5e3c] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Lock size={15} />
                <span>قفل الأمان وكلمة السر</span>
              </button>

            </aside>

            {/* Main Tab Content */}
            <main className="flex-1 p-6 overflow-y-auto bg-gray-50/50 min-h-0">
              
              {/* 1. STATS TAB */}
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-serif font-bold text-base text-gray-950">إحصائيات المدونة العامة</h4>
                    <p className="text-xs text-gray-500 font-serif">مؤشرات محتوى ومساهمات مدونة رحيق السنين لفضيلة الشيخ</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-xs space-y-1 text-center">
                      <span className="text-gray-500 text-[10px] font-bold">إجمالي الكتب</span>
                      <p className="text-2xl font-black text-[#8c5e3c] font-mono">{books.length}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-xs space-y-1 text-center">
                      <span className="text-gray-500 text-[10px] font-bold">البحوث والمقالات</span>
                      <p className="text-2xl font-black text-purple-600 font-mono">{articles.length + ummahEvents.length}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-xs space-y-1 text-center">
                      <span className="text-gray-500 text-[10px] font-bold">الخطب والدروس العلمية</span>
                      <p className="text-2xl font-black text-cyan-600 font-mono">{speeches.length + lessonSeries.length}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-xs space-y-1 text-center">
                      <span className="text-gray-500 text-[10px] font-bold">طلبات التطوع النشطة</span>
                      <p className="text-2xl font-black text-rose-500 font-mono">{volunteers.length}</p>
                    </div>
                  </div>

                  {/* Quick Guidelines */}
                  <div className="bg-[#8c5e3c]/5 border border-[#c5a059]/25 p-5 rounded-2xl space-y-3">
                    <h5 className="font-serif font-bold text-sm text-[#8c5e3c] flex items-center gap-2">
                      <Award size={16} />
                      توجيهات فنية هامة لفضيلة الشيخ وإدارته
                    </h5>
                    <ul className="list-disc list-inside space-y-2 text-xs text-gray-700 font-serif leading-relaxed pr-2">
                      <li>تنعكس التعديلات التي تجريها في هذه اللوحة <span className="font-bold text-[#8c5e3c]">فوراً</span> على الموقع وتظهر لعامة الزوار.</li>
                      <li>تُحفظ كافة المواد الجديدة في <span className="font-bold text-gray-900">سجل المتصفح المحلي (localStorage)</span> بشكل دائم، مما يمنع ضياعها عند التحديث.</li>
                      <li>تأكد من اختيار مفتاح قفل قوي وتجنب مشاركته مع غير المنسقين الفنيين للمحافظة على موثوقية المواد العلمية المرفوعة.</li>
                    </ul>
                  </div>

                  {/* Uploaded Materials Log */}
                  <div className="bg-white rounded-2xl border border-gray-200/60 p-5 space-y-3">
                    <h5 className="font-serif font-bold text-sm text-gray-900">الملفات المرفوعة حديثاً باللوحة ({uploadedFiles.length})</h5>
                    {uploadedFiles.length === 0 ? (
                      <p className="text-xs text-gray-400 py-3 text-center">لا توجد ملفات مرفوعة حالياً. يمكنك التوجه لقسم الرفع لرفع مستنداتك أو ملفاتك الصوتية.</p>
                    ) : (
                      <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                        {uploadedFiles.map((f, idx) => (
                          <div key={f.id || idx} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <span className="bg-[#8c5e3c]/10 text-[#8c5e3c] px-2 py-0.5 rounded font-bold font-mono text-[9px]">{f.fileType}</span>
                              <span className="font-semibold text-gray-800">{f.title}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-400 font-mono text-[10px]">{f.fileSize} ({f.uploadDate})</span>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm(`هل أنت متأكد من حذف الملف "${f.title}" نهائياً من المدونة؟`)) {
                                    // 1. Delete from IndexedDB
                                    await deleteFile(f.id);
                                    // 2. Remove from list
                                    const updated = uploadedFiles.filter(item => item.id !== f.id);
                                    setUploadedFiles(updated);
                                    localStorage.setItem('uploaded_files_data', JSON.stringify(updated));
                                    
                                    // 3. Remove from public collections too!
                                    if (f.category === 'books') {
                                      const updatedBooks = books.filter(b => b.id !== 'b_uploaded_' + f.id);
                                      setBooks(updatedBooks);
                                      localStorage.setItem('books_data', JSON.stringify(updatedBooks));
                                    } else if (f.category === 'speeches') {
                                      const updatedSpeeches = speeches.filter(s => s.id !== 's_uploaded_' + f.id);
                                      setSpeeches(updatedSpeeches);
                                      localStorage.setItem('speeches_data', JSON.stringify(updatedSpeeches));
                                    } else {
                                      const updatedArticles = articles.filter(a => a.id !== 'a_uploaded_' + f.id);
                                      setArticles(updatedArticles);
                                      localStorage.setItem('articles_data', JSON.stringify(updatedArticles));
                                    }
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer flex items-center justify-center"
                                title="حذف الملف نهائياً"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. BIOGRAPHY TAB */}
              {activeTab === 'bio' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-serif font-bold text-base text-gray-950">تعديل البيانات التعريفية لفضيلة الشيخ</h4>
                    <p className="text-xs text-gray-500 font-serif">تعديل الاسم والمنصب الأكاديمي والرحلة العلمية للشيخ لتحديث الواجهة والبطاقة التعريفية</p>
                  </div>

                  <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-200/60">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">الاسم واللقب</label>
                        <input 
                          type="text" 
                          value={bioName} 
                          onChange={(e) => setBioName(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#8c5e3c] text-gray-900 bg-gray-50/50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">المنصب العلمي / الأكاديمي الرئيس</label>
                        <input 
                          type="text" 
                          value={bioTitle} 
                          onChange={(e) => setBioTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#8c5e3c] text-gray-900 bg-gray-50/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-700">نبذة ومقدمة السيرة الذاتية (عن الشيخ)</label>
                      <textarea 
                        value={bioAbout} 
                        onChange={(e) => setBioAbout(e.target.value)}
                        rows={6}
                        className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#8c5e3c] text-gray-900 bg-gray-50/50 leading-relaxed font-serif"
                      />
                    </div>

                    {/* Scientific Degrees */}
                    <div className="space-y-2 border-t border-gray-150 pt-4">
                      <label className="block text-xs font-semibold text-gray-800">الشهادات العلمية والإجازات</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={bioDegreeInput}
                          onChange={(e) => setBioDegreeInput(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-900"
                          placeholder="مثال: إجازة في القراءات العشر المتواترة من المقرئ د. فلان..."
                        />
                        <button 
                          type="button" 
                          onClick={addDegree}
                          className="bg-[#8c5e3c] hover:bg-[#66462c] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          إضافة
                        </button>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        {bioDegrees.map((deg, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded-lg border border-gray-150">
                            <span className="text-gray-800">{deg}</span>
                            <button onClick={() => removeDegree(idx)} className="text-rose-600 hover:text-rose-800 p-0.5 cursor-pointer">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Academic Positions */}
                    <div className="space-y-2 border-t border-gray-150 pt-4">
                      <label className="block text-xs font-semibold text-gray-800">العضويات والمناصب الحالية والسابقة</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={bioPositionInput}
                          onChange={(e) => setBioPositionInput(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-900"
                          placeholder="مثال: عضو المجمع الفقهي لرابطة العالم الإسلامي..."
                        />
                        <button 
                          type="button" 
                          onClick={addPosition}
                          className="bg-[#8c5e3c] hover:bg-[#66462c] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          إضافة
                        </button>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        {bioPositions.map((pos, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded-lg border border-gray-150">
                            <span className="text-gray-800">{pos}</span>
                            <button onClick={() => removePosition(idx)} className="text-rose-600 hover:text-rose-800 p-0.5 cursor-pointer">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                      <button 
                        onClick={handleSaveBio}
                        className="bg-[#8c5e3c] hover:bg-[#66462c] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save size={14} />
                        <span>حفظ التعديلات وتحديث السيرة العامة</span>
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* 3. UPLOADER TAB */}
              {activeTab === 'uploader' && (
                <div className="space-y-6">
                  <div className="bg-[#8c5e3c]/5 border border-[#c5a059]/20 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-serif font-black text-lg text-gray-950">مساعد الرفع الذكي والمبسط</h4>
                      <p className="text-xs text-gray-600 font-serif">انقر مباشرة على نوع الملف الذي ترغب في رفعه للبدء فوراً دون تعقيد</p>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full self-start sm:self-center">
                      ✓ معالجة تلقائية للامتدادات
                    </span>
                  </div>

                  {/* Three Big Category Buttons (Click to Upload Shortcut) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setFileTargetCategory('books');
                        document.getElementById('admin-file-selector')?.click();
                      }}
                      className={`p-5 rounded-2xl border text-right transition-all cursor-pointer group flex flex-col justify-between h-36 ${
                        fileTargetCategory === 'books' && selectedFile
                          ? 'bg-[#8c5e3c] text-white border-[#8c5e3c] shadow-lg'
                          : 'bg-white hover:bg-[#8c5e3c]/5 text-gray-800 border-gray-200 hover:border-[#c5a059]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-2 rounded-xl ${fileTargetCategory === 'books' && selectedFile ? 'bg-white/20 text-white' : 'bg-amber-50 text-[#8c5e3c]'}`}>
                          <BookOpen size={20} />
                        </div>
                        <span className="text-[10px] font-bold opacity-80">رفع فوري</span>
                      </div>
                      <div>
                        <h5 className="font-serif font-bold text-sm block">كتب ومؤلفات الشيخ</h5>
                        <p className={`text-[10px] mt-1 ${fileTargetCategory === 'books' && selectedFile ? 'text-amber-100' : 'text-gray-400'}`}>ارفع مستندات بصيغة PDF / DOC</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFileTargetCategory('speeches');
                        document.getElementById('admin-file-selector')?.click();
                      }}
                      className={`p-5 rounded-2xl border text-right transition-all cursor-pointer group flex flex-col justify-between h-36 ${
                        fileTargetCategory === 'speeches' && selectedFile
                          ? 'bg-cyan-700 text-white border-cyan-700 shadow-lg'
                          : 'bg-white hover:bg-cyan-50 text-gray-800 border-gray-200 hover:border-cyan-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-2 rounded-xl ${fileTargetCategory === 'speeches' && selectedFile ? 'bg-white/20 text-white' : 'bg-cyan-50 text-cyan-700'}`}>
                          <Volume2 size={20} />
                        </div>
                        <span className="text-[10px] font-bold opacity-80">رفع فوري</span>
                      </div>
                      <div>
                        <h5 className="font-serif font-bold text-sm block">دروس ومحاضرات الشيخ</h5>
                        <p className={`text-[10px] mt-1 ${fileTargetCategory === 'speeches' && selectedFile ? 'text-cyan-100' : 'text-gray-400'}`}>ارفع ملفات صوتية بصيغة MP3 / MP4</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFileTargetCategory('articles');
                        document.getElementById('admin-file-selector')?.click();
                      }}
                      className={`p-5 rounded-2xl border text-right transition-all cursor-pointer group flex flex-col justify-between h-36 ${
                        fileTargetCategory === 'articles' && selectedFile
                          ? 'bg-purple-700 text-white border-purple-700 shadow-lg'
                          : 'bg-white hover:bg-purple-50 text-gray-800 border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-2 rounded-xl ${fileTargetCategory === 'articles' && selectedFile ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-700'}`}>
                          <FileText size={20} />
                        </div>
                        <span className="text-[10px] font-bold opacity-80">رفع فوري</span>
                      </div>
                      <div>
                        <h5 className="font-serif font-bold text-sm block">البحوث والمقالات العامة</h5>
                        <p className={`text-[10px] mt-1 ${fileTargetCategory === 'articles' && selectedFile ? 'text-purple-100' : 'text-gray-400'}`}>ارفع مقالاً أو بحثاً مباشراً للمدونة</p>
                      </div>
                    </button>
                  </div>

                  <form onSubmit={handleUploadFileSubmit} className="space-y-5 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/60 shadow-xs relative">
                    
                    {/* Hidden Native Input */}
                    <input 
                      type="file" 
                      id="admin-file-selector"
                      className="hidden" 
                      accept=".pdf,.doc,.docx,.mp3,.mp4"
                      onChange={handleFileInputChange}
                    />

                    {/* Simple Drag & Drop or Click Zone */}
                    <div 
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                        dragActive ? 'border-[#8c5e3c] bg-[#8c5e3c]/5' : 'border-gray-200 hover:border-[#8c5e3c]/40 bg-gray-50/40'
                      }`}
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('admin-file-selector')?.click()}
                    >
                      <div className="space-y-2.5">
                        <div className="w-12 h-12 bg-amber-50 text-[#8c5e3c] rounded-full flex items-center justify-center mx-auto border border-amber-200">
                          <FileUp size={22} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-800">اسحب أي ملف وأفلته هنا، أو انقر لاختيار ملف من حاسوبك</p>
                          <p className="text-[10px] text-gray-400">يدعم الملفات الصوتية والمستندات بحد أقصى 50 ميجا بايت</p>
                        </div>
                      </div>

                      {selectedFile && (
                        <div className="mt-4 bg-[#8c5e3c]/10 border border-[#c5a059]/30 px-4 py-2.5 rounded-xl inline-flex items-center gap-2 max-w-full text-right shadow-xs">
                          <div className="text-xs font-serif text-[#8c5e3c] flex items-center gap-2">
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                            <div>
                              <span className="font-black">ملف محمل حالياً: </span>
                              <span className="font-mono text-[11px] text-gray-700 font-bold">{selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedFile && (
                      <div className="space-y-4 pt-4 border-t border-gray-150 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">تصنيف وقسم الملف المختار (تلقائي):</label>
                            <select 
                              value={fileTargetCategory}
                              onChange={(e) => setFileTargetCategory(e.target.value as any)}
                              className="w-full px-3.5 py-2.5 text-xs font-bold border border-gray-200 rounded-xl bg-gray-50 text-gray-800 focus:ring-1 focus:ring-[#8c5e3c] focus:outline-hidden"
                            >
                              <option value="books">المكتبة وركن كتب ومؤلفات الشيخ (PDF / DOC)</option>
                              <option value="speeches">منبر خطب ومحاضرات الشيخ (MP3 / MP4)</option>
                              <option value="articles">ركن البحوث والمقالات العامة بالمدونة</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">اسم المادة أو العنوان المعروض للجمهور:</label>
                            <input 
                              type="text" 
                              value={fileCustomTitle}
                              onChange={(e) => setFileCustomTitle(e.target.value)}
                              className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:ring-1 focus:ring-[#8c5e3c] focus:outline-hidden"
                              placeholder="أدخل اسماً واضحاً ومفهوماً للزوار..."
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-gray-700">وصف موجز للمادة العلمية المرفوعة:</label>
                          <textarea 
                            value={fileCustomDescription}
                            onChange={(e) => setFileCustomDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:ring-1 focus:ring-[#8c5e3c] focus:outline-hidden leading-relaxed"
                            placeholder="اكتب بضعة أسطر تشرح للزائر محتوى هذا الملف..."
                          />
                        </div>

                        {uploadProgress >= 0 ? (
                          <div className="space-y-1.5 pt-2">
                            <div className="flex justify-between text-xs font-mono font-bold text-[#8c5e3c]">
                              <span>جاري معالجة ورفع الملف ونشره...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#c5a059] to-[#8c5e3c] transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                          </div>
                        ) : (
                          <div className="pt-2 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedFile(null)}
                              className="px-5 py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl cursor-pointer"
                            >
                              إلغاء الملف
                            </button>
                            <button 
                              type="submit"
                              className="bg-[#8c5e3c] hover:bg-[#66462c] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <FileUp size={14} />
                              <span>انشر الملف فوراً بالموقع 🚀</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                  </form>
                </div>
              )}

              {/* 4. BOOKS MANAGEMENT TAB */}
              {activeTab === 'books' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-base text-gray-950">إدارة كتب ومؤلفات الشيخ</h4>
                      <p className="text-xs text-gray-500 font-serif">يمكنك إضافة كتب جديدة، أو تعديل وحذف الكتب والمؤلفات المنشورة في ركن المكتبة</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add Book Form */}
                    <form onSubmit={handleAddBookSubmit} className="bg-white p-5 rounded-2xl border border-gray-200/60 h-fit space-y-3.5">
                      <h5 className="font-serif font-bold text-xs text-[#8c5e3c] border-b border-gray-100 pb-2 flex items-center gap-1.5">
                        <Plus size={15} />
                        إضافة كتاب/مؤلف جديد
                      </h5>
                      
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-700">عنوان الكتاب</label>
                        <input 
                          type="text"
                          required
                          value={newBook.title}
                          onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50"
                          placeholder="عنوان الكتاب أو المؤلف العلمي..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-gray-700">سنة التأليف/النشر</label>
                          <input 
                            type="text"
                            value={newBook.publishYear}
                            onChange={(e) => setNewBook({ ...newBook, publishYear: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50"
                            placeholder="مثال: 1447 هـ"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-gray-700">عدد الصفحات</label>
                          <input 
                            type="number"
                            value={newBook.pages}
                            onChange={(e) => setNewBook({ ...newBook, pages: Number(e.target.value) })}
                            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-700">لون الغلاف في العرض</label>
                        <select 
                          value={newBook.coverColor}
                          onChange={(e) => setNewBook({ ...newBook, coverColor: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50"
                        >
                          <option value="emerald">أخضر زمردي (Emerald)</option>
                          <option value="amber">ذهبي/عنبري (Amber)</option>
                          <option value="slate">رمادي/فحمي (Slate)</option>
                          <option value="indigo">أزرق داكن (Indigo)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-700">وصف الكتاب ومحتواه</label>
                        <textarea 
                          required
                          value={newBook.description}
                          onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                          rows={4}
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 leading-relaxed"
                          placeholder="اكتب بضعة أسطر تلخص المواضيع والمسائل العلمية التي يعالجها الكتاب..."
                        />
                      </div>

                      {/* PDF File Upload Input */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-700">إرفاق ملف الكتاب (PDF)</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="file" 
                            accept=".pdf,application/pdf"
                            id="book-pdf-uploader"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setBookPdfFile(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById('book-pdf-uploader')?.click()}
                            className="flex-1 bg-amber-50 hover:bg-amber-100 text-[#8c5e3c] border border-dashed border-[#8c5e3c]/40 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <FileUp size={14} />
                            <span>{bookPdfFile ? 'تغيير ملف الـ PDF' : 'اختر ملف PDF للكتاب'}</span>
                          </button>
                          
                          {bookPdfFile && (
                            <button
                              type="button"
                              onClick={() => setBookPdfFile(null)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 p-2 rounded-xl text-xs transition-all flex items-center justify-center cursor-pointer"
                              title="إزالة الملف المحدد"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                        {bookPdfFile && (
                          <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            ملف جاهز للرفع: {bookPdfFile.name} ({(bookPdfFile.size / (1024 * 1024)).toFixed(2)} ميغابايت)
                          </p>
                        )}
                        {!bookPdfFile && (
                          <p className="text-[10px] text-gray-400">سيتم توليد ملف قراءة بديل تلقائياً في حال عدم إرفاق PDF.</p>
                        )}
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-[#8c5e3c] hover:bg-[#66462c] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>نشر وإدراج في المكتبة العامة</span>
                      </button>
                    </form>

                    {/* Books List for editing/deleting */}
                    <div className="lg:col-span-2 space-y-3">
                      <h5 className="font-serif font-bold text-xs text-gray-700 border-b border-gray-200 pb-2">قائمة الكتب والمؤلفات المنشورة حالياً ({books.length})</h5>
                      <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
                        {books.map((b) => (
                          <div key={b.id} className="bg-white p-4 rounded-xl border border-gray-150 flex items-start justify-between gap-4">
                            <div className="space-y-1 flex-1">
                              <h6 className="font-serif font-bold text-xs text-gray-950 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                {b.title}
                              </h6>
                              <p className="text-[10px] text-gray-500 leading-relaxed font-serif line-clamp-2">{b.description}</p>
                              <div className="flex items-center gap-3 text-[9px] text-gray-400 font-mono">
                                <span>الصفحات: {b.pages}</span>
                                <span>•</span>
                                <span>سنة النشر: {b.publishYear}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDeleteBook(b.id)}
                              className="text-rose-500 hover:text-rose-700 p-1 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all shrink-0 cursor-pointer"
                              title="حذف الكتاب"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. ARTICLES MANAGEMENT TAB */}
              {activeTab === 'articles' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-serif font-bold text-base text-gray-950">إدارة المقالات والأبحاث والأحداث</h4>
                    <p className="text-xs text-gray-500 font-serif">يمكنك إضافة وتعديل وحذف المقالات والبحوث المنشورة أو مقالات التعليق على قضايا الأمة</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add Article Form */}
                    <form onSubmit={handleAddArticleSubmit} className="bg-white p-5 rounded-2xl border border-gray-200/60 h-fit space-y-3.5">
                      <h5 className="font-serif font-bold text-xs text-[#8c5e3c] border-b border-gray-100 pb-2 flex items-center gap-1.5">
                        <Plus size={15} />
                        كتابة ونشر مقال/بحث جديد
                      </h5>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-700">نوع المقال / الركن</label>
                        <select 
                          value={newArticle.type}
                          onChange={(e) => setNewArticle({ ...newArticle, type: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50"
                        >
                          <option value="article">ركن البحوث والمقالات العامة</option>
                          <option value="event">أحداث وقضايا العالم المعاصر</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-700">عنوان المقال</label>
                        <input 
                          type="text"
                          required
                          value={newArticle.title}
                          onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50"
                          placeholder="اكتب عنواناً جذاباً ومهنياً..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-700">تصنيف البحث/المقال الفرعي</label>
                        <input 
                          type="text"
                          value={newArticle.category}
                          onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50"
                          placeholder="مثال: الفكر المعاصر، الأدب والأخلاق، التنمية والتربية..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-700">نص ومضمون المقال بالكامل</label>
                        <textarea 
                          required
                          value={newArticle.content}
                          onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                          rows={6}
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 leading-relaxed font-serif"
                          placeholder="اكتب تفاصيل ومقصد مقالك العلمي بأريحية..."
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-[#8c5e3c] hover:bg-[#66462c] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>نشر المقال وتحديث المدونة المباشرة</span>
                      </button>
                    </form>

                    {/* Articles List */}
                    <div className="lg:col-span-2 space-y-5">
                      {/* Section A: Main articles */}
                      <div className="space-y-2">
                        <h5 className="font-serif font-bold text-xs text-[#8c5e3c] border-b border-gray-200 pb-2">المقالات والبحوث القائمة ({articles.length})</h5>
                        <div className="space-y-2.5 max-h-[250px] overflow-y-auto">
                          {articles.map((a) => (
                            <div key={a.id} className="bg-white p-4 rounded-xl border border-gray-150 flex items-start justify-between gap-4">
                              <div className="space-y-1 flex-1">
                                <h6 className="font-serif font-bold text-xs text-gray-950">{a.title}</h6>
                                <p className="text-[10px] text-[#8c5e3c] font-bold font-serif">{a.category}</p>
                                <p className="text-[9px] text-gray-400 font-mono">نُشر في: {a.publishDate}</p>
                              </div>
                              <button 
                                onClick={() => handleDeleteArticle(a.id, false)}
                                className="text-rose-500 hover:text-rose-700 p-1 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all shrink-0 cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section B: Ummah Events articles */}
                      <div className="space-y-2">
                        <h5 className="font-serif font-bold text-xs text-rose-700 border-b border-gray-200 pb-2">أحداث وقضايا العالم الإسلامي القائمة ({ummahEvents.length})</h5>
                        <div className="space-y-2.5 max-h-[250px] overflow-y-auto">
                          {ummahEvents.map((a) => (
                            <div key={a.id} className="bg-white p-4 rounded-xl border border-gray-150 flex items-start justify-between gap-4">
                              <div className="space-y-1 flex-1">
                                <h6 className="font-serif font-bold text-xs text-gray-950">{a.title}</h6>
                                <p className="text-[10px] text-rose-600 font-bold font-serif">{a.category}</p>
                                <p className="text-[9px] text-gray-400 font-mono">نُشر في: {a.publishDate}</p>
                              </div>
                              <button 
                                onClick={() => handleDeleteArticle(a.id, true)}
                                className="text-rose-500 hover:text-rose-700 p-1 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all shrink-0 cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. SPEECHES MANAGEMENT TAB */}
              {activeTab === 'speeches' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-serif font-bold text-base text-gray-950">إدارة خطب الجمعة والمواد الصوتية</h4>
                    <p className="text-xs text-gray-500 font-serif">يمكنك نشر خطبة جديدة أو تفريغ وإضافة نصوص الخطب المذاعة في الجوامع الكبرى</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add Speech Form */}
                    <form onSubmit={handleAddSpeechSubmit} className="bg-white p-5 rounded-2xl border border-gray-200/60 h-fit space-y-3.5">
                      <h5 className="font-serif font-bold text-xs text-[#8c5e3c] border-b border-gray-100 pb-2 flex items-center gap-1.5">
                        <Plus size={15} />
                        إضافة خطبة منبرية جديدة
                      </h5>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-700">عنوان الخطبة</label>
                        <input 
                          type="text"
                          required
                          value={newSpeech.title}
                          onChange={(e) => setNewSpeech({ ...newSpeech, title: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50"
                          placeholder="مثال: توطين القلوب على طاعة الرحمن..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-gray-700">مكان الإلقاء</label>
                          <input 
                            type="text"
                            value={newSpeech.location}
                            onChange={(e) => setNewSpeech({ ...newSpeech, location: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-gray-700">مدة التسجيل المقررة</label>
                          <input 
                            type="text"
                            value={newSpeech.audioDuration}
                            onChange={(e) => setNewSpeech({ ...newSpeech, audioDuration: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-700">نص وتفريغ الخطبة بالكامل</label>
                        <textarea 
                          required
                          value={newSpeech.transcript}
                          onChange={(e) => setNewSpeech({ ...newSpeech, transcript: e.target.value })}
                          rows={6}
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 leading-relaxed font-serif"
                          placeholder="اكتب النص الحرفي لخطبة فضيلة الشيخ بالتأصيل..."
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-[#8c5e3c] hover:bg-[#66462c] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>نشر وإدراج بالمنبر الصوتي المباشر</span>
                      </button>
                    </form>

                    {/* Speeches List */}
                    <div className="lg:col-span-2 space-y-3">
                      <h5 className="font-serif font-bold text-xs text-gray-700 border-b border-gray-200 pb-2">خطب ومواد منبرية منشورة حالياً ({speeches.length})</h5>
                      <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
                        {speeches.map((s) => (
                          <div key={s.id} className="bg-white p-4 rounded-xl border border-gray-150 flex items-start justify-between gap-4">
                            <div className="space-y-1 flex-1">
                              <h6 className="font-serif font-bold text-xs text-gray-950 flex items-center gap-1.5">
                                <Volume2 size={13} className="text-[#c5a059]" />
                                {s.title}
                              </h6>
                              <p className="text-[10px] text-gray-500 font-serif line-clamp-2 leading-relaxed">{s.transcript}</p>
                              <div className="flex items-center gap-3 text-[9px] text-gray-400 font-mono">
                                <span>المكان: {s.location}</span>
                                <span>•</span>
                                <span>المدة: {s.audioDuration}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDeleteSpeech(s.id)}
                              className="text-rose-500 hover:text-rose-700 p-1 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all shrink-0 cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. VOLUNTEERS TAB */}
              {activeTab === 'volunteers' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-base text-gray-950">طلبات التطوع والمساهمة العلمية ({volunteers.length})</h4>
                      <p className="text-xs text-gray-500 font-serif">عرض بيانات طلاب العلم والمتطوعين الذين تقدموا للمساهمة عبر استمارة التطوع</p>
                    </div>
                    {volunteers.length > 0 && (
                      <button 
                        onClick={handleClearAllVolunteers}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-rose-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>إفراغ كامل الطلبات</span>
                      </button>
                    )}
                  </div>

                  {volunteers.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/60 text-gray-400 font-serif space-y-3">
                      <Users className="mx-auto text-gray-300 animate-pulse" size={38} />
                      <p className="text-xs">لم يتقدم أي متطوع بطلب مساهمة جديد حتى الآن.</p>
                      <p className="text-[10px] text-gray-400">ستظهر أي تقديمات يرسلها الزوار من نموذج التطوع في هذه المساحة فوراً.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {volunteers.map((vol) => (
                        <div key={vol.id} className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-xs space-y-3 relative overflow-hidden text-right">
                          {/* Decorative accent */}
                          <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#8c5e3c]"></div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h5 className="font-serif font-extrabold text-sm text-gray-900">{vol.fullName}</h5>
                              <p className="text-[10px] text-[#8c5e3c] font-bold">
                                مجال المساهمة المختار: {
                                  vol.specialty === 'translation' ? 'الترجمة الفورية واللغات' :
                                  vol.specialty === 'design' ? 'التصميم الجرافيكي وصناعة الميديا' :
                                  vol.specialty === 'programming' ? 'البرمجة وإدارة المواقع والتطبيقات' :
                                  vol.specialty === 'editing' ? 'التدقيق الشرعي واللغوي وتفريغ الدروس' : 'الإشراف التربوي والتنسيق الإداري'
                                }
                              </p>
                            </div>

                            <span className="text-[10px] text-gray-400 font-mono shrink-0">
                              تاريخ التقديم: {new Date(vol.submissionDate).toLocaleDateString('ar-SA')}
                            </span>
                          </div>

                          <div className="bg-gray-50/50 p-3.5 rounded-xl border border-gray-150 text-xs text-gray-700 leading-relaxed font-serif">
                            <span className="block font-bold text-gray-900 text-[10px] mb-1">دوافع المتطوع ومؤهلاته:</span>
                            "{vol.motivation}"
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs border-t border-gray-100">
                            <div className="flex flex-wrap items-center gap-4 text-[11px]">
                              <span className="text-gray-600 font-serif">
                                📞 هاتف: <span className="font-mono font-bold text-gray-900">{vol.phone}</span>
                              </span>
                              <span className="text-gray-600 font-serif">
                                ✉️ البريد: <span className="font-mono text-gray-900">{vol.email}</span>
                              </span>
                            </div>

                            <button 
                              onClick={() => handleDeleteVolunteer(vol.id)}
                              className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Trash2 size={12} />
                              <span>حذف الطلب</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* 8. SECURITY SETTINGS TAB */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-serif font-bold text-base text-gray-950">إعدادات الأمان وقفل اللوحة</h4>
                    <p className="text-xs text-gray-500 font-serif">يمكنك تغيير كلمة المرور الافتراضية لمنع المتطفلين من التحكم بالمدونة ونشر مواد غير موثوقة</p>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-4 bg-white p-6 rounded-2xl border border-gray-200/60 shadow-xs max-w-md">
                    
                    {securitySuccess && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <CheckCircle size={16} />
                        <span>{securitySuccess}</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-700">كلمة السر الجديدة</label>
                      <input 
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#8c5e3c] bg-gray-50/50 text-gray-900 font-mono tracking-widest text-center"
                        placeholder="••••••"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-700">تأكيد كلمة السر الجديدة</label>
                      <input 
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#8c5e3c] bg-gray-50/50 text-gray-900 font-mono tracking-widest text-center"
                        placeholder="••••••"
                      />
                    </div>

                    {passwordError && (
                      <p className="text-xs text-rose-600 font-bold">{passwordError}</p>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button 
                        type="submit"
                        className="bg-[#8c5e3c] hover:bg-[#66462c] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        تحديث مفتاح القفل
                      </button>
                    </div>

                  </form>
                </div>
              )}

            </main>

          </div>

          {/* Footer */}
          <div className="bg-white border-t border-gray-200 px-6 py-3 shrink-0 flex items-center justify-between text-[11px] text-gray-500 font-serif">
            <span>مدونة رحيق السنين للأستاذ الدكتور نصر بن إبراهيم بركات</span>
            <span className="font-mono">محمية بالكامل ببروتوكول تشفير محلي</span>
          </div>

        </div>
      )}

    </div>
  );
}
