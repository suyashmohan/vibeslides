'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Calendar, User, Plus, Sparkles } from 'lucide-react';

interface Presentation {
  slug: string;
  title: string;
  author?: string;
  date?: string;
  excerpt?: string;
}

async function getPresentations(): Promise<Presentation[]> {
  try {
    const response = await fetch('/api/presentations');
    if (!response.ok) throw new Error('Failed to load presentations');
    return await response.json();
  } catch (error) {
    console.error('Error loading presentations:', error);
    return [];
  }
}

export default function Home() {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPresentations();
  }, []);

  const loadPresentations = async () => {
    setIsLoading(true);
    const data = await getPresentations();
    setPresentations(data);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Markdown Presentations
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Turn your markdown files into beautiful presentations. 
            Choose from local files or create a live presentation.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-500">Loading presentations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create Live Presentation Card - Always First */}
            <Link
              href="/create"
              className="group block bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm hover:shadow-xl 
                       transition-all duration-300 border-2 border-transparent hover:border-blue-300 
                       overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <Sparkles className="w-5 h-5 text-white/60" />
                </div>
                
                <h2 className="text-xl font-semibold text-white mb-2">
                  Create Live Presentation
                </h2>
                
                <p className="text-blue-100 text-sm mb-4">
                  Paste or type markdown directly and present instantly. No files needed!
                </p>
                
                <div className="flex items-center gap-2 text-sm text-blue-200">
                  <span>Get started now</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              
              <div className="px-6 py-3 bg-blue-600/30 border-t border-white/10 flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  Create Now
                </span>
                <svg className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>

            {/* Local Presentations */}
            {presentations.map((presentation) => (
              <Link
                key={presentation.slug}
                href={`/presentation/${presentation.slug}`}
                className="group block bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-xl 
                         transition-all duration-300 border border-slate-200 dark:border-slate-700 
                         hover:border-blue-400 dark:hover:border-blue-500 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 
                                  dark:group-hover:bg-blue-900/30 transition-colors">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 
                               group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {presentation.title}
                  </h2>
                  
                  {presentation.excerpt && (
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                      {presentation.excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    {presentation.author && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{presentation.author}</span>
                      </div>
                    )}
                    {presentation.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(presentation.date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="px-6 py-3 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-100 
                              dark:border-slate-700 flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    View Presentation
                  </span>
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 transform group-hover:translate-x-1 
                                transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}

            {/* Empty State Card */}
            {presentations.length === 0 && (
              <div className="block bg-slate-100 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-6">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-1">
                    No local presentations
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-500">
                    Add markdown files to the presentations folder to see them here
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
