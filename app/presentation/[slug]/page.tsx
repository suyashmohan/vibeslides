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
import { ChevronLeft, ChevronRight, X, Maximize2, Minimize2, Settings, Play, Layers, Zap, Minus, Type, Box, ArrowUp } from 'lucide-react';

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
          scale: 0.8,
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
          scale: 0.8,
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
          scale: 0.8,
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
          scale: 0.8,
        }),
      };
  }
};

const getElementAnimationVariants = (animationType: ElementAnimationType): Variants => {
  switch (animationType) {
    case 'stagger':
      return {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
          opacity: 1,
          y: 0,
          transition: {
            delay: i * 0.1,
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1],
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
        hidden: { opacity: 0, y: 30 },
        visible: (i: number) => ({
          opacity: 1,
          y: 0,
          transition: {
            delay: i * 0.12,
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1],
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
        hidden: { opacity: 0, y: 20 },
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
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
      };
    case 'fade':
      return {
        opacity: { duration: 0.3 },
      };
    case 'zoom':
      return {
        scale: { type: "spring", stiffness: 300, damping: 25 },
        opacity: { duration: 0.2 },
      };
    case 'none':
      return {};
    default:
      return {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
      };
  }
};

interface AnimatedElementProps {
  children: React.ReactNode;
  className?: string;
  index: number;
  elementAnimationType: ElementAnimationType;
}

const AnimatedElement: React.FC<AnimatedElementProps> = ({ 
  children, 
  className = '', 
  index,
  elementAnimationType 
}) => {
  if (elementAnimationType === 'none') {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!presentation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const slideVariants = getSlideAnimationVariants(slideAnimationType);
  const slideTransitionConfig = getSlideTransitionConfig(slideAnimationType);

  // Counter for animated elements
  let elementCounter = 0;
  const getNextElementIndex = () => elementCounter++;

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-slate-900 flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-slate-800/50 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-white font-semibold text-sm md:text-base">{presentation.title}</h1>
            {slug === 'live' && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-medium rounded border border-red-500/30">
                LIVE
              </span>
            )}
            {presentation.author && slug !== 'live' && (
              <p className="text-slate-400 text-xs md:text-sm">{presentation.author}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {/* Settings/Animation Selector */}
          <div className="relative settings-menu-container">
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-xs md:text-sm ${
                showSettingsMenu 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Animation settings"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">Animations</span>
            </button>
            
            {showSettingsMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-50">
                {/* Slide Animation Section */}
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 border-b border-slate-700 bg-slate-800/50">
                  Slide Transition
                </div>
                {slideAnimationOptions.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => handleSlideAnimationChange(option.type)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                      slideAnimationType === option.type
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                    {slideAnimationType === option.type && (
                      <svg className="w-4 h-4 ml-auto text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}

                {/* Divider */}
                <div className="border-t border-slate-700 my-1"></div>

                {/* Element Animation Section */}
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 border-b border-slate-700 bg-slate-800/50">
                  Element Animations
                </div>
                {elementAnimationOptions.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => handleElementAnimationChange(option.type)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                      elementAnimationType === option.type
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                    {elementAnimationType === option.type && (
                      <svg className="w-4 h-4 ml-auto text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="text-slate-400 text-xs md:text-sm">
            {currentSlide + 1} / {presentation.slides.length}
          </span>
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Slide Container */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-hidden relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransitionConfig}
            className="w-full max-w-6xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            onAnimationComplete={() => {
              // Reset element counter when slide animation completes
              elementCounter = 0;
            }}
          >
            <div className="aspect-video p-8 md:p-12 flex flex-col justify-center overflow-y-auto">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({ children }) => (
                      <AnimatedElement 
                        index={getNextElementIndex()} 
                        elementAnimationType={elementAnimationType}
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6"
                      >
                        {children}
                      </AnimatedElement>
                    ),
                    h2: ({ children }) => (
                      <AnimatedElement 
                        index={getNextElementIndex()} 
                        elementAnimationType={elementAnimationType}
                        className="text-2xl md:text-3xl lg:text-4xl font-semibold text-slate-800 dark:text-slate-100 mb-4"
                      >
                        {children}
                      </AnimatedElement>
                    ),
                    h3: ({ children }) => (
                      <AnimatedElement 
                        index={getNextElementIndex()} 
                        elementAnimationType={elementAnimationType}
                        className="text-xl md:text-2xl lg:text-3xl font-semibold text-slate-700 dark:text-slate-200 mb-3"
                      >
                        {children}
                      </AnimatedElement>
                    ),
                    p: ({ children }) => (
                      <AnimatedElement 
                        index={getNextElementIndex()} 
                        elementAnimationType={elementAnimationType}
                        className="text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-4"
                      >
                        {children}
                      </AnimatedElement>
                    ),
                    ul: ({ children }) => (
                      <AnimatedElement 
                        index={getNextElementIndex()} 
                        elementAnimationType={elementAnimationType}
                        className="space-y-2 mb-4 text-base md:text-lg text-slate-600 dark:text-slate-300"
                      >
                        {children}
                      </AnimatedElement>
                    ),
                    ol: ({ children }) => (
                      <AnimatedElement 
                        index={getNextElementIndex()} 
                        elementAnimationType={elementAnimationType}
                        className="space-y-2 mb-4 text-base md:text-lg text-slate-600 dark:text-slate-300 list-decimal list-inside"
                      >
                        {children}
                      </AnimatedElement>
                    ),
                    li: ({ children }) => (
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1.5 flex-shrink-0">•</span>
                        <span>{children}</span>
                      </li>
                    ),
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
                                margin: '1rem 0',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
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
                        <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400">
                          {children}
                        </code>
                      );
                    },
                    pre: ({ children }) => <>{children}</>,
                    blockquote: ({ children }) => (
                      <AnimatedElement 
                        index={getNextElementIndex()} 
                        elementAnimationType={elementAnimationType}
                        className="border-l-4 border-blue-500 pl-4 italic text-slate-600 dark:text-slate-400 mb-4"
                      >
                        {children}
                      </AnimatedElement>
                    ),
                    table: ({ children }) => (
                      <AnimatedElement 
                        index={getNextElementIndex()} 
                        elementAnimationType={elementAnimationType}
                      >
                        <div className="overflow-x-auto mb-4">
                          <table className="w-full border-collapse border border-slate-300 dark:border-slate-600">
                            {children}
                          </table>
                        </div>
                      </AnimatedElement>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-slate-100 dark:bg-slate-700">
                        {children}
                      </thead>
                    ),
                    th: ({ children }) => (
                      <th className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left font-semibold text-slate-900 dark:text-white">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-slate-700 dark:text-slate-300">
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

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="absolute left-4 p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full 
                   transition-all disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button
          onClick={nextSlide}
          disabled={currentSlide === presentation.slides.length - 1}
          className="absolute right-4 p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full 
                   transition-all disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-800">
        <motion.div
          className="h-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ 
            width: `${((currentSlide + 1) / presentation.slides.length) * 100}%` 
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Keyboard hints */}
      <div className="px-6 py-2 bg-slate-800/50 flex items-center justify-center gap-6 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-slate-700 rounded">←</kbd>
          <kbd className="px-2 py-1 bg-slate-700 rounded">→</kbd>
          Navigate
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-slate-700 rounded">ESC</kbd>
          Exit
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-slate-700 rounded">Space</kbd>
          Next
        </span>
      </div>
    </div>
  );
}
