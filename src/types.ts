/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ContentType {
  Biography = 'biography',
  Book = 'book',
  Article = 'article',
  BookSummary = 'book-summary', // ركن عصير الكتب
  Speech = 'speech', // ركن الخطب
  LessonSeries = 'lesson-series', // ركن سلاسل دروس
  Lecture = 'lecture', // ركن للمحاضرات
  Tweet = 'tweet', // تغريدات
  UmmahEvent = 'ummah-event', // مقالات التعليق على أحداث العالم الإسلامي
  DawahProject = 'dawah-project', // ركن مشاريع دعوية
  EducationPlan = 'education-plan', // ركن خطط تعليمية لطلاب العلم
}

export interface Book {
  id: string;
  title: string;
  description: string;
  publishYear?: string;
  pages?: number;
  downloadUrl?: string;
  coverColor: string; // Used to generate elegant SVG book cover designs
  isTelegram?: boolean;
  telegramLink?: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  publishDate: string;
  category: string;
  isTelegram?: boolean;
  telegramLink?: string;
}

export interface BookSummary {
  id: string;
  bookTitle: string;
  author: string;
  summaryPoints: string[];
  keyTakeaway: string;
}

export interface Speech {
  id: string;
  title: string;
  date: string;
  location: string;
  transcript: string;
  audioDuration?: string;
  isTelegram?: boolean;
  telegramLink?: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  summary: string;
}

export interface LessonSeries {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  level: string;
  isTelegram?: boolean;
  telegramLink?: string;
}

export interface Lecture {
  id: string;
  title: string;
  date: string;
  location: string;
  duration: string;
  topics: string[];
  videoUrl?: string;
  isTelegram?: boolean;
  telegramLink?: string;
}

export interface Tweet {
  id: string;
  content: string;
  date: string;
  likes: number;
  retweets: number;
  imageUrl?: string;
  isTelegram?: boolean;
  link?: string;
}

export interface DawahProject {
  id: string;
  title: string;
  description: string;
  goals: string[];
  status: 'ongoing' | 'planned' | 'completed';
  progressPercentage: number;
  howToHelp: string;
}

export interface EducationPlan {
  id: string;
  title: string;
  targetGroup: string;
  duration: string;
  stages: {
    stageTitle: string;
    books: string[];
    objectives: string[];
  }[];
}

export interface DawahIdeaRole {
  roleName: string;
  qualifications: string;
}

export interface DawahIdea {
  id: string;
  title: string;
  description: string;
  budget: string;
  peopleCount: number;
  roles: DawahIdeaRole[];
}

export interface VolunteerSubmission {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  specialty: string;
  motivation: string;
  submissionDate: string;
}
