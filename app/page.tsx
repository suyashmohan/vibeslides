'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Calendar, User, Plus, Edit, Play } from 'lucide-react';

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
    let cancelled = false;
    
    const loadPresentations = async () => {
      setIsLoading(true);
      const data = await getPresentations();
      if (!cancelled) {
        setPresentations(data);
        setIsLoading(false);
      }
    };
    
    loadPresentations();
    
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-rice)]">
      {/* Subtle top gradient */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[var(--color-sand)]/30 to-transparent pointer-events-none" />
      
      <main className="relative max-w-5xl mx-auto px-6 py-20 md:py-28">
        {/* Header Section */}
        <div className="text-center mb-20 md:mb-28">
          <p className="text-[var(--color-clay)] text-sm tracking-[0.2em] uppercase mb-4 animate-gentle-fade">
            Markdown to Presentations
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-[var(--color-ink)] mb-6 animate-gentle-fade" style={{ animationDelay: '0.1s' }}>
            Presentations
          </h1>
          <p className="text-[var(--color-charcoal)]/70 text-lg md:text-xl max-w-xl mx-auto leading-relaxed animate-gentle-fade" style={{ animationDelay: '0.2s' }}>
            Transform your markdown into beautifully crafted presentations with effortless elegance.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center gap-3 text-[var(--color-clay)]">
              <div className="w-2 h-2 bg-[var(--color-clay)] rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-[var(--color-clay)] rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
              <div className="w-2 h-2 bg-[var(--color-clay)] rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
            </div>
            <p className="mt-6 text-[var(--color-stone)] text-sm tracking-wide">Loading presentations</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Create Live Presentation - Featured Card */}
            <Link
              href="/create"
              className="group block relative overflow-hidden rounded-lg bg-[var(--color-ink)] text-[var(--color-rice)] p-8 md:p-10 japandi-card"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-sage)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-rice)]/10 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-[var(--color-rice)]" />
                    </div>
                    <span className="text-[var(--color-rice)]/60 text-sm tracking-wider uppercase">New</span>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-normal mb-3 text-[var(--color-rice)]">
                    Create Live Presentation
                  </h2>
                  
                  <p className="text-[var(--color-rice)]/70 text-base leading-relaxed max-w-lg">
                    Begin with a blank canvas or choose from our refined templates. 
                    Type directly and present instantly — no files required.
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-[var(--color-rice)]/80 group-hover:text-[var(--color-rice)] transition-colors">
                  <span>Get Started</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Divider */}
            {presentations.length > 0 && (
              <div className="flex items-center gap-4 py-4">
                <div className="flex-1 h-px bg-[var(--color-sand)]" />
                <span className="text-[var(--color-clay)] text-xs tracking-[0.2em] uppercase">Your Presentations</span>
                <div className="flex-1 h-px bg-[var(--color-sand)]" />
              </div>
            )}

            {/* Local Presentations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {presentations.map((presentation, index) => (
                <div
                  key={presentation.slug}
                  className="group bg-[var(--color-washi)] rounded-lg p-6 japandi-card border border-[var(--color-sand)] flex flex-col"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Link
                    href={`/presentation/${presentation.slug}`}
                    className="flex-1 block"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[var(--color-sand)]/50 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-sage)]/20 transition-colors duration-300">
                        <FileText className="w-5 h-5 text-[var(--color-clay)] group-hover:text-[var(--color-sage)] transition-colors duration-300" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg text-[var(--color-ink)] mb-2 group-hover:text-[var(--color-sage)] transition-colors duration-300 font-normal">
                          {presentation.title}
                        </h3>
                        
                        {presentation.excerpt && (
                          <p className="text-[var(--color-charcoal)]/60 text-sm leading-relaxed mb-4 line-clamp-2">
                            {presentation.excerpt}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-[var(--color-stone)]">
                          {presentation.author && (
                            <div className="flex items-center gap-1.5">
                              <User className="w-3 h-3" />
                              <span>{presentation.author}</span>
                            </div>
                          )}
                          {presentation.date && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(presentation.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="mt-4 pt-4 border-t border-[var(--color-sand)] flex items-center justify-between">
                    <Link
                      href={`/presentation/${presentation.slug}`}
                      className="flex items-center gap-2 text-xs text-[var(--color-clay)] hover:text-[var(--color-sage)] transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      <span className="tracking-wide">View</span>
                    </Link>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/create?edit=${presentation.slug}`}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--color-clay)] hover:text-[var(--color-ink)] hover:bg-[var(--color-sand)]/50 rounded-md transition-all"
                        title="Edit presentation"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {presentations.length === 0 && (
                <div className="md:col-span-2 py-16 px-8 rounded-lg border-2 border-dashed border-[var(--color-sand)] bg-[var(--color-washi)]/50">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-sand)]/30 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-6 h-6 text-[var(--color-stone)]" />
                    </div>
                    <h3 className="text-lg text-[var(--color-ink)] mb-2 font-normal">
                      No presentations yet
                    </h3>
                    <p className="text-[var(--color-clay)] text-sm leading-relaxed max-w-xs mx-auto">
                      Add markdown files to the presentations folder or create a live presentation to get started
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-24 pt-8 border-t border-[var(--color-sand)]">
          <p className="text-center text-[var(--color-stone)] text-xs tracking-wide">
            Crafted with simplicity and intention
          </p>
        </div>
      </main>
    </div>
  );
}
