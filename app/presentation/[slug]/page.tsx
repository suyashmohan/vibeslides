'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ChevronLeft, ChevronRight, X, Maximize2, Minimize2, Settings, Play, Layers, Zap, Minus, Box, ArrowUp, Edit } from 'lucide-react';

SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('json', json);

interface Slide {
  id: number;
  content: string;
}

interface PresentationData {
  title: string;
  author?: string;
  date?: string;
  slides: Slide[];
}

type SlideAnimationType = 'slide' | 'fade' | 'zoom' | 'none';
type ElementAnimationType = 'stagger' | 'fade' | 'slide-up' | 'none';

const slideAnimationOptions: { type: SlideAnimationType; label: string; icon: React.ReactNode }[] = [
  { type: 'slide', label: 'Slide', icon: <Layers className="w-4 h-4" /> },
  { type: 'fade', label: 'Fade', icon: <Play className="w-4 h-4" /> },
  { type: 'zoom', label: 'Zoom', icon: <Zap className="w-4 h-4" /> },
  { type: 'none', label: 'None', icon: <Minus className="w-4 h-4" /> },
];

const elementAnimationOptions: { type: ElementAnimationType; label: string; icon: React.ReactNode }[] = [
  { type: 'stagger', label: 'Stagger', icon: <Box className="w-4 h-4" /> },
  { type: 'fade', label: 'Fade', icon: <Play className="w-4 h-4" /> },
  { type: 'slide-up', label: 'Slide Up', icon: <ArrowUp className="w-4 h-4" /> },
  { type: 'none', label: 'None', icon: <Minus className="w-4 h-4" /> },
];

const getSlideAnimationVariants = (animationType: SlideAnimationType): Variants => {
  switch (animationType) {
    case 'slide':
      return {
        enter: (direction: number) => ({
          x: direction > 0 ? 1000 : -1000,
          opacity: 0,
          scale: 0.95,
        }),
        center: {
          zIndex: 1,
          x: 0,
          opacity: 1,
          scale: 1,
        },
        exit: (direction: number) => ({
          zIndex: 0,
          x: direction < 0 ? 1000 : -1000,
          opacity: 0,
          scale: 0.95,
        }),
      };
    case 'fade':
      return {
        enter: {
          opacity: 0,
        },
        center: {
          zIndex: 1,
          opacity: 1,
        },
        exit: {
          zIndex: 0,
          opacity: 0,
        },
      };
    case 'zoom':
      return {
        enter: (direction: number) => ({
          scale: direction > 0 ? 0.5 : 1.5,
          opacity: 0,
        }),
        center: {
          zIndex: 1,
          scale: 1,
          opacity: 1,
        },
        exit: (direction: number) => ({
          zIndex: 0,
          scale: direction < 0 ? 0.5 : 1.5,
          opacity: 0,
        }),
      };
    case 'none':
      return {
        enter: {},
        center: {},
        exit: {},
      };
    default:
      return {
        enter: (direction: number) => ({
          x: direction > 0 ? 1000 : -1000,
          opacity: 0,
          scale: 0.95,
        }),
        center: {
          zIndex: 1,
          x: 0,
          opacity: 1,
          scale: 1,
        },
        exit: (direction: number) => ({
          zIndex: 0,
          x: direction < 0 ? 1000 : -1000,
          opacity: 0,
          scale: 0.95,
        }),
      };
  }
};

const getElementAnimationVariants = (animationType: ElementAnimationType): Variants => {
  switch (animationType) {
    case 'stagger':
      return {
        hidden: { opacity: 0, y: 16 },
        visible: (i: number) => ({
          opacity: 1,
          y: 0,
          transition: {
            delay: i * 0.1,
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          },
        }),
      };
    case 'fade':
      return {
        hidden: { opacity: 0 },
        visible: (i: number) => ({
          opacity: 1,
          transition: {
            delay: i * 0.08,
            duration: 0.3,
          },
        }),
      };
    case 'slide-up':
      return {
        hidden: { opacity: 0, y: 24 },
        visible: (i: number) => ({
          opacity: 1,
          y: 0,
          transition: {
            delay: i * 0.12,
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          },
        }),
      };
    case 'none':
      return {
        hidden: {},
        visible: {},
      };
    default:
      return {
        hidden: { opacity: 0, y: 16 },
        visible: (i: number) => ({
          opacity: 1,
          y: 0,
          transition: {
            delay: i * 0.1,
            duration: 0.4,
          },
        }),
      };
  }
};

const getSlideTransitionConfig = (animationType: SlideAnimationType) => {
  switch (animationType) {
    case 'slide':
      return {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
      };
    case 'fade':
      return {
        opacity: { duration: 0.3 },
      };
    case 'zoom':
      return {
        scale: { type: "spring" as const, stiffness: 300, damping: 25 },
        opacity: { duration: 0.2 },
      };
    case 'none':
      return {};
    default:
      return {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
      };
  }
};

interface AnimatedElementProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  index: number;
  elementAnimationType: ElementAnimationType;
}

const AnimatedElement: React.FC<AnimatedElementProps> = ({ 
  children, 
  className = '', 
  style,
  index,
  elementAnimationType 
}) => {
  if (elementAnimationType === 'none') {
    return <div className={className} style={style}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      animate="visible"
      custom={index}
      variants={getElementAnimationVariants(elementAnimationType)}
    >
      {children}
    </motion.div>
  );
};

export default function PresentationViewer({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slug, setSlug] = useState<string>('');
  const [slideAnimationType, setSlideAnimationType] = useState<SlideAnimationType>('slide');
  const [elementAnimationType, setElementAnimationType] = useState<ElementAnimationType>('stagger');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  // Load animation preferences from localStorage
  useEffect(() => {
    const savedSlideAnimation = localStorage.getItem('presentationSlideAnimation') as SlideAnimationType;
    const savedElementAnimation = localStorage.getItem('presentationElementAnimation') as ElementAnimationType;
    
    if (savedSlideAnimation && slideAnimationOptions.some(opt => opt.type === savedSlideAnimation)) {
      setSlideAnimationType(savedSlideAnimation);
    }
    if (savedElementAnimation && elementAnimationOptions.some(opt => opt.type === savedElementAnimation)) {
      setElementAnimationType(savedElementAnimation);
    }
  }, []);

  // Save animation preferences to localStorage
  const handleSlideAnimationChange = (type: SlideAnimationType) => {
    setSlideAnimationType(type);
    localStorage.setItem('presentationSlideAnimation', type);
  };

  const handleElementAnimationChange = (type: ElementAnimationType) => {
    setElementAnimationType(type);
    localStorage.setItem('presentationElementAnimation', type);
  };

  useEffect(() => {
    params.then(p => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    
    const loadPresentation = async () => {
      try {
        // Handle live presentations from sessionStorage
        if (slug === 'live') {
          const liveContent = sessionStorage.getItem('liveMarkdownContent');
          const liveTitle = sessionStorage.getItem('liveMarkdownTitle') || 'Live Presentation';
          
          if (!liveContent) {
            router.push('/');
            return;
          }
          
          // Parse the live markdown content similar to how the API does it
          const slideContents = liveContent.split(/^\s*---\s*$/m).filter(slide => slide.trim());
          
          const slides = slideContents.map((slideContent, index) => ({
            id: index,
            content: slideContent.trim(),
          }));
          
          setPresentation({
            title: liveTitle,
            author: 'Live Presentation',
            date: new Date().toISOString().split('T')[0],
            slides,
          });
          return;
        }
        
        // Handle regular file-based presentations
        const response = await fetch(`/api/presentation/${slug}`);
        if (!response.ok) throw new Error('Failed to load presentation');
        const data = await response.json();
        setPresentation(data);
      } catch (error) {
        console.error('Error loading presentation:', error);
        router.push('/');
      }
    };

    loadPresentation();
  }, [slug, router]);

  const goToSlide = useCallback((index: number) => {
    if (!presentation) return;
    if (index >= 0 && index < presentation.slides.length) {
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
    }
  }, [presentation, currentSlide]);

  const nextSlide = useCallback(() => {
    goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentSlide - 1);
  }, [currentSlide, goToSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false);
          } else if (showSettingsMenu) {
            setShowSettingsMenu(false);
          } else {
            router.push('/');
          }
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          if (presentation) {
            goToSlide(presentation.slides.length - 1);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, goToSlide, isFullscreen, router, presentation, showSettingsMenu]);

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.settings-menu-container')) {
        setShowSettingsMenu(false);
      }
    };

    if (showSettingsMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSettingsMenu]);

  // Sync fullscreen state with browser fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      // Fallback: toggle the state even if fullscreen API fails
      setIsFullscreen(!isFullscreen);
    }
  };

  if (!presentation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-ink)]">
        <div className="inline-flex items-center gap-3 text-[var(--color-stone)]">
          <div className="w-2 h-2 bg-[var(--color-stone)] rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-[var(--color-stone)] rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
          <div className="w-2 h-2 bg-[var(--color-stone)] rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>
    );
  }

  const slideVariants = getSlideAnimationVariants(slideAnimationType);
  const slideTransitionConfig = getSlideTransitionConfig(slideAnimationType);

  // Counter for animated elements
  let elementCounter = 0;
  const getNextElementIndex = () => elementCounter++;

  return (
    <div 
      className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} flex flex-col`}
      style={{ backgroundColor: 'var(--color-ink)' }}
    >
      {/* Header - hidden in fullscreen */}
      {!isFullscreen && (
      <div 
        className="flex items-center justify-between px-4 md:px-6 py-4 border-b relative"
        style={{ 
          backgroundColor: 'rgba(44, 42, 38, 0.8)',
          borderColor: 'rgba(196, 184, 168, 0.2)',
          backdropFilter: 'blur(12px)',
          zIndex: 100
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-lg transition-colors text-[var(--color-stone)] hover:text-[var(--color-rice)] hover:bg-[var(--color-charcoal)]"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-[var(--color-rice)] font-normal text-sm md:text-base" style={{ fontFamily: 'var(--font-serif)' }}>
              {presentation.title}
            </h1>
            {slug === 'live' && (
              <span 
                className="px-2 py-0.5 text-xs font-medium rounded"
                style={{ 
                  backgroundColor: 'rgba(184, 145, 125, 0.2)',
                  color: 'var(--color-terracotta)',
                  border: '1px solid rgba(184, 145, 125, 0.3)'
                }}
              >
                LIVE
              </span>
            )}
            {presentation.author && slug !== 'live' && (
              <p className="text-[var(--color-clay)] text-xs md:text-sm">{presentation.author}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {/* Settings/Animation Selector */}
          <div className="relative settings-menu-container" style={{ zIndex: 110 }}>
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-xs md:text-sm ${
                showSettingsMenu 
                  ? 'text-[var(--color-rice)]' 
                  : 'text-[var(--color-stone)] hover:text-[var(--color-rice)] hover:bg-[var(--color-charcoal)]'
              }`}
              style={showSettingsMenu ? { backgroundColor: 'var(--color-sage)' } : {}}
              title="Animation settings"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">Animations</span>
            </button>
            
            {showSettingsMenu && (
              <div 
                className="absolute right-0 top-full mt-2 w-56 rounded-lg shadow-xl overflow-hidden"
                style={{ 
                  backgroundColor: 'var(--color-charcoal)',
                  border: '1px solid rgba(196, 184, 168, 0.2)',
                  zIndex: 120
                }}
              >
                {/* Slide Animation Section */}
                <div 
                  className="px-3 py-2 text-xs font-medium border-b"
                  style={{ 
                    backgroundColor: 'rgba(247, 245, 240, 0.05)',
                    color: 'var(--color-stone)',
                    borderColor: 'rgba(196, 184, 168, 0.1)'
                  }}
                >
                  Slide Transition
                </div>
                {slideAnimationOptions.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => handleSlideAnimationChange(option.type)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors"
                    style={{
                      color: slideAnimationType === option.type ? 'var(--color-sage)' : 'var(--color-clay)',
                      backgroundColor: slideAnimationType === option.type ? 'rgba(122, 139, 110, 0.15)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (slideAnimationType !== option.type) {
                        e.currentTarget.style.backgroundColor = 'rgba(247, 245, 240, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (slideAnimationType !== option.type) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                    {slideAnimationType === option.type && (
                      <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--color-sage)' }}>
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}

                {/* Divider */}
                <div style={{ borderTop: '1px solid rgba(196, 184, 168, 0.1)', margin: '4px 0' }}></div>

                {/* Element Animation Section */}
                <div 
                  className="px-3 py-2 text-xs font-medium border-b"
                  style={{ 
                    backgroundColor: 'rgba(247, 245, 240, 0.05)',
                    color: 'var(--color-stone)',
                    borderColor: 'rgba(196, 184, 168, 0.1)'
                  }}
                >
                  Element Animations
                </div>
                {elementAnimationOptions.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => handleElementAnimationChange(option.type)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors"
                    style={{
                      color: elementAnimationType === option.type ? 'var(--color-sage)' : 'var(--color-clay)',
                      backgroundColor: elementAnimationType === option.type ? 'rgba(122, 139, 110, 0.15)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (elementAnimationType !== option.type) {
                        e.currentTarget.style.backgroundColor = 'rgba(247, 245, 240, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (elementAnimationType !== option.type) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                    {elementAnimationType === option.type && (
                      <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--color-sage)' }}>
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Edit Button - only for file-based presentations */}
          {slug !== 'live' && (
            <button
              onClick={() => router.push(`/create?edit=${slug}`)}
              className="p-2 rounded-lg transition-colors flex items-center gap-2 text-xs md:text-sm text-[var(--color-stone)] hover:text-[var(--color-rice)] hover:bg-[var(--color-charcoal)]"
              title="Edit presentation"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden md:inline">Edit</span>
            </button>
          )}

          <span className="text-xs md:text-sm" style={{ color: 'var(--color-clay)' }}>
            {currentSlide + 1} / {presentation.slides.length}
          </span>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg transition-colors text-[var(--color-stone)] hover:text-[var(--color-rice)] hover:bg-[var(--color-charcoal)]"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>
      )}

      {/* Slide Container - full screen in fullscreen mode */}
      <div className={`flex-1 flex items-center justify-center overflow-hidden relative z-0 ${isFullscreen ? '' : 'p-4 md:p-8'}`}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransitionConfig}
            className={`w-full overflow-hidden ${isFullscreen ? 'h-full max-w-none rounded-none' : 'max-w-6xl rounded-lg shadow-2xl'}`}
            style={{ 
              backgroundColor: 'var(--color-rice)',
              boxShadow: isFullscreen ? 'none' : '0 25px 80px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(196, 184, 168, 0.1)'
            }}
            onAnimationComplete={() => {
              // Reset element counter when slide animation completes
              elementCounter = 0;
            }}
          >
            <div className="aspect-video p-8 md:p-12 lg:p-16 flex flex-col justify-center overflow-y-auto">
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({ children }) => (
                      <AnimatedElement 
                        index={getNextElementIndex()} 
                        elementAnimationType={elementAnimationType}
                        className="text-3xl md:text-4xl lg:text-5xl font-normal mb-8"
                        style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-serif)' }}
                      >
                        {children}
                      </AnimatedElement>
                    ),
                    h2: ({ children }) => (
                      <AnimatedElement 
                        index={getNextElementIndex()} 
                        elementAnimationType={elementAnimationType}
                        className="text-2xl md:text-3xl lg:text-4xl font-normal mb-6"
                        style={{ color: 'var(--color-charcoal)', fontFamily: 'var(--font-serif)' }}
                      >
                        {children}
                      </AnimatedElement>
                    ),
                    h3: ({ children }) => (
                      <AnimatedElement 
                        index={getNextElementIndex()} 
                        elementAnimationType={elementAnimationType}
                        className="text-xl md:text-2xl lg:text-3xl font-normal mb-4"
                        style={{ color: 'var(--color-charcoal)', fontFamily: 'var(--font-serif)' }}
                      >
                        {children}
                      </AnimatedElement>
                    ),
                    p: ({ children }) => (
                      <AnimatedElement 
                        index={getNextElementIndex()} 
                        elementAnimationType={elementAnimationType}
                        className="text-base md:text-lg lg:text-xl leading-relaxed mb-6"
                        style={{ color: 'var(--color-charcoal)', lineHeight: '1.75' }}
                      >
                        {children}
                      </AnimatedElement>
                    ),
                    ul: ({ children }) => (
                      <AnimatedElement 
                        index={getNextElementIndex()} 
                        elementAnimationType={elementAnimationType}
                        className="space-y-3 mb-6 text-base md:text-lg"
                        style={{ color: 'var(--color-charcoal)' }}
                      >
                        {children}
                      </AnimatedElement>
                    ),
                    ol: ({ children }) => (
                      <AnimatedElement 
                        index={getNextElementIndex()} 
                        elementAnimationType={elementAnimationType}
                        className="space-y-3 mb-6 text-base md:text-lg list-decimal list-inside"
                        style={{ color: 'var(--color-charcoal)' }}
                      >
                        {children}
                      </AnimatedElement>
                    ),
                    li: ({ children }) => {
                      // Always use div instead of li to avoid invalid nested list HTML
                      // The parent ol/ul provides the list context
                      return (
                        <div className="flex items-start gap-2 py-1">
                          <span style={{ color: 'var(--color-sage)' }} className="mt-1.5 flex-shrink-0">•</span>
                          <span>{children}</span>
                        </div>
                      );
                    },
                    code: ({ children, className }) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match ? match[1] : '';
                      
                      if (language) {
                        return (
                          <AnimatedElement 
                            index={getNextElementIndex()} 
                            elementAnimationType={elementAnimationType}
                          >
                            <SyntaxHighlighter
                              language={language}
                              style={oneDark}
                              customStyle={{
                                margin: '1.5rem 0',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                backgroundColor: 'var(--color-ink)',
                              }}
                              showLineNumbers={true}
                              wrapLines={true}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </AnimatedElement>
                        );
                      }
                      
                      return (
                        <code 
                          className="px-1.5 py-0.5 rounded text-sm font-mono"
                          style={{ 
                            backgroundColor: 'var(--color-sand)',
                            color: 'var(--color-ink)'
                          }}
                        >
                          {children}
                        </code>
                      );
                    },
                    pre: ({ children }) => <>{children}</>,
                    blockquote: ({ children }) => (
                      <AnimatedElement 
                        index={getNextElementIndex()} 
                        elementAnimationType={elementAnimationType}
                        className="pl-6 italic mb-6"
                        style={{ 
                          borderLeft: '3px solid var(--color-sage)',
                          color: 'var(--color-clay)'
                        }}
                      >
                        {children}
                      </AnimatedElement>
                    ),
                    table: ({ children }) => (
                      <AnimatedElement 
                        index={getNextElementIndex()} 
                        elementAnimationType={elementAnimationType}
                      >
                        <div className="overflow-x-auto mb-6">
                          <table 
                            className="w-full border-collapse"
                            style={{ border: '1px solid var(--color-sand)' }}
                          >
                            {children}
                          </table>
                        </div>
                      </AnimatedElement>
                    ),
                    thead: ({ children }) => (
                      <thead style={{ backgroundColor: 'var(--color-washi)' }}>
                        {children}
                      </thead>
                    ),
                    th: ({ children }) => (
                      <th 
                        className="px-4 py-3 text-left font-medium"
                        style={{ 
                          border: '1px solid var(--color-sand)',
                          color: 'var(--color-ink)'
                        }}
                      >
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td 
                        className="px-4 py-3"
                        style={{ 
                          border: '1px solid var(--color-sand)',
                          color: 'var(--color-charcoal)'
                        }}
                      >
                        {children}
                      </td>
                    ),
                  }}
                >
                  {presentation.slides[currentSlide].content}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons - hidden in fullscreen */}
        {!isFullscreen && (
        <>
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="absolute left-4 md:left-8 p-3 rounded-full backdrop-blur-md z-10 transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed hover:scale-105"
          style={{ 
            backgroundColor: 'rgba(44, 42, 38, 0.6)',
            color: 'var(--color-rice)'
          }}
          onMouseEnter={(e) => {
            if (currentSlide !== 0) {
              e.currentTarget.style.backgroundColor = 'rgba(44, 42, 38, 0.8)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(44, 42, 38, 0.6)';
          }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button
          onClick={nextSlide}
          disabled={currentSlide === presentation.slides.length - 1}
          className="absolute right-4 md:right-8 p-3 rounded-full backdrop-blur-md z-10 transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed hover:scale-105"
          style={{ 
            backgroundColor: 'rgba(44, 42, 38, 0.6)',
            color: 'var(--color-rice)'
          }}
          onMouseEnter={(e) => {
            if (currentSlide !== presentation.slides.length - 1) {
              e.currentTarget.style.backgroundColor = 'rgba(44, 42, 38, 0.8)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(44, 42, 38, 0.6)';
          }}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        </>
        )}
      </div>

      {/* Progress Bar - hidden in fullscreen */}
      {!isFullscreen && (
      <div style={{ height: '3px', backgroundColor: 'rgba(196, 184, 168, 0.2)' }}>
        <motion.div
          style={{ height: '100%', backgroundColor: 'var(--color-sage)' }}
          initial={{ width: 0 }}
          animate={{ 
            width: `${((currentSlide + 1) / presentation.slides.length) * 100}%` 
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
      )}

      {/* Keyboard hints - hidden in fullscreen */}
      {!isFullscreen && (
      <div 
        className="px-6 py-3 flex items-center justify-center gap-8 text-xs"
        style={{ 
          backgroundColor: 'rgba(44, 42, 38, 0.5)',
          color: 'var(--color-clay)'
        }}
      >
        <span className="flex items-center gap-2">
          <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-charcoal)' }}>←</kbd>
          <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-charcoal)' }}>→</kbd>
          Navigate
        </span>
        <span className="flex items-center gap-2">
          <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-charcoal)' }}>ESC</kbd>
          Exit
        </span>
        <span className="flex items-center gap-2">
          <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-charcoal)' }}>Space</kbd>
          Next
        </span>
      </div>
      )}
    </div>
  );
}
