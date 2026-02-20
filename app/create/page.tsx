'use client';

import { useState, useMemo, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  ArrowLeft, Play, BookOpen, Lightbulb, Code, Save, X, AlertCircle, 
  FileCheck, Bold, Italic, Heading, List, ListOrdered, Quote, Code2, 
  Minus, Eye, EyeOff, Keyboard, Undo, Redo, LayoutTemplate,
  Type, Link as LinkIcon
} from 'lucide-react';
import { PresentationChat } from '@/app/components/PresentationChat';

// Export wrapped component as default
export default function CreatePresentationWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-rice flex items-center justify-center">
        <div className="inline-flex items-center gap-3 text-clay">
          <div className="w-2 h-2 bg-clay rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-clay rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
          <div className="w-2 h-2 bg-clay rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>
    }>
      <CreatePresentation />
    </Suspense>
  );
}

SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('json', json);

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  content: string;
}

const templates: Template[] = [
  {
    id: 'simple',
    name: 'Simple',
    description: 'Clean and minimal structure',
    icon: <BookOpen className="w-4 h-4" />,
    content: `# Welcome

This is your first slide.

---

## Second Slide

Add your content here.

---

## Thank You

Questions?`,
  },
  {
    id: 'code',
    name: 'Tutorial',
    description: 'Perfect for teaching code',
    icon: <Code className="w-4 h-4" />,
    content: `# Python Basics

Let's learn Python together.

---

## Variables

\`\`\`python
name = "Alice"
age = 25
print(f"{name} is {age}")
\`\`\`

---

## Functions

\`\`\`python
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
\`\`\`

---

## Practice

Try it yourself!`,
  },
  {
    id: 'pitch',
    name: 'Pitch',
    description: 'For business ideas',
    icon: <Lightbulb className="w-4 h-4" />,
    content: `# Our Vision

The future is here.

---

## The Problem

What pain point are we solving?

---

## The Solution

How we fix it:

- Feature 1
- Feature 2
- Feature 3

---

## Market

- Market size: $X billion
- Growth rate: X% annually
- Target audience

---

## Thank You

Questions & Discussion`,
  },
];

// Command history for undo/redo
interface HistoryState {
  content: string;
  cursorPosition: number;
}

function CreatePresentation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get('edit');
  
  const [markdownContent, setMarkdownContent] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [savedFileName, setSavedFileName] = useState('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(editSlug ? 'Edit Presentation' : 'New Presentation');
  const [showPreview, setShowPreview] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [currentLine, setCurrentLine] = useState(1);
  const [currentColumn, setCurrentColumn] = useState(1);
  
  // History for undo/redo
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const maxHistorySize = 50;
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  
  // Refs to store current values for stable autosave interval
  const updatePresentationRef = useRef<() => void>(() => {});
  const isDirtyRef = useRef<boolean>(false);
  const isSavingRef = useRef<boolean>(false);
  const markdownContentRef = useRef<string>('');

  // Sync line numbers scroll with textarea scroll
  const handleTextareaScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const isDirty = useMemo(() => {
    return markdownContent !== savedContent;
  }, [markdownContent, savedContent]);

  const isNewFile = !savedFileName && !editSlug;
  const canPresent = markdownContent.trim() && !isDirty;

  // Load existing presentation if in edit mode
  useEffect(() => {
    if (editSlug) {
      setIsLoading(true);
      fetch(`/api/edit/${editSlug}`)
        .then(response => {
          if (!response.ok) throw new Error('Failed to load presentation');
          return response.json();
        })
        .then(data => {
          setMarkdownContent(data.content);
          setSavedContent(data.content);
          setSavedFileName(editSlug);
          setTitle('Edit Presentation');
          // Add to history
          setHistory([{ content: data.content, cursorPosition: 0 }]);
          setHistoryIndex(0);
        })
        .catch(error => {
          console.error('Error loading presentation:', error);
          alert('Failed to load presentation for editing');
          router.push('/');
        })
        .finally(() => setIsLoading(false));
    }
  }, [editSlug, router]);

  // Add to history when content changes significantly
  const addToHistory = useCallback((content: string, cursorPosition: number) => {
    setHistory(prev => {
      // Remove future history if we're not at the end
      const newHistory = prev.slice(0, historyIndex + 1);
      // Add new state
      newHistory.push({ content, cursorPosition });
      // Keep only the last maxHistorySize items
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const state = history[newIndex];
      setMarkdownContent(state.content);
      // Restore cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(state.cursorPosition, state.cursorPosition);
          textareaRef.current.focus();
        }
      }, 0);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const state = history[newIndex];
      setMarkdownContent(state.content);
      // Restore cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(state.cursorPosition, state.cursorPosition);
          textareaRef.current.focus();
        }
      }, 0);
    }
  }, [history, historyIndex]);

  const handlePresentMarkdown = () => {
    if (!canPresent) return;
    
    sessionStorage.setItem('liveMarkdownContent', markdownContent);
    sessionStorage.setItem('liveMarkdownTitle', editSlug ? 'Edited Presentation' : 'Live Presentation');
    
    router.push('/presentation/live');
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setMarkdownContent(template.content);
      // Add to history
      addToHistory(template.content, 0);
    }
  };

  const handleContentChange = (newContent: string) => {
    setMarkdownContent(newContent);
    // Update line and column
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = newContent.substring(0, cursorPosition);
    const lines = textBeforeCursor.split('\n');
    setCurrentLine(lines.length);
    setCurrentColumn(lines[lines.length - 1].length + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle undo/redo
    if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
      return;
    }
    if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      handleRedo();
      return;
    }
    
    // Handle tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      
      if (e.shiftKey) {
        // Shift+Tab: Remove indentation
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = value.indexOf('\n', start);
        const actualLineEnd = lineEnd === -1 ? value.length : lineEnd;
        const line = value.substring(lineStart, actualLineEnd);
        
        if (line.startsWith('  ')) {
          const newValue = value.substring(0, lineStart) + line.substring(2) + value.substring(actualLineEnd);
          setMarkdownContent(newValue);
          setTimeout(() => {
            textarea.setSelectionRange(start - 2, end - 2);
          }, 0);
        } else if (line.startsWith('\t')) {
          const newValue = value.substring(0, lineStart) + line.substring(1) + value.substring(actualLineEnd);
          setMarkdownContent(newValue);
          setTimeout(() => {
            textarea.setSelectionRange(start - 1, end - 1);
          }, 0);
        }
      } else {
        // Tab: Add indentation
        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        setMarkdownContent(newValue);
        setTimeout(() => {
          textarea.setSelectionRange(start + 2, start + 2);
        }, 0);
      }
    }
  };

  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const selectedText = value.substring(start, end);
    
    const textToInsert = selectedText || placeholder;
    const newValue = value.substring(0, start) + before + textToInsert + after + value.substring(end);
    
    setMarkdownContent(newValue);
    
    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
    
    // Add to history
    addToHistory(newValue, start + before.length + textToInsert.length);
  };

  const toolbarButtons = [
    { icon: <Bold className="w-4 h-4" />, label: 'Bold', action: () => insertText('**', '**', 'bold text'), shortcut: 'Ctrl+B' },
    { icon: <Italic className="w-4 h-4" />, label: 'Italic', action: () => insertText('*', '*', 'italic text'), shortcut: 'Ctrl+I' },
    { type: 'divider' },
    { icon: <Heading className="w-4 h-4" />, label: 'Heading 1', action: () => insertText('# ', '', 'Heading'), shortcut: 'Ctrl+1' },
    { icon: <Type className="w-4 h-4" />, label: 'Heading 2', action: () => insertText('## ', '', 'Heading'), shortcut: 'Ctrl+2' },
    { type: 'divider' },
    { icon: <List className="w-4 h-4" />, label: 'Bullet List', action: () => insertText('- ', '', 'item'), shortcut: 'Ctrl+Shift+8' },
    { icon: <ListOrdered className="w-4 h-4" />, label: 'Numbered List', action: () => insertText('1. ', '', 'item'), shortcut: 'Ctrl+Shift+7' },
    { type: 'divider' },
    { icon: <Quote className="w-4 h-4" />, label: 'Quote', action: () => insertText('> ', '', 'quote'), shortcut: 'Ctrl+Shift+.' },
    { icon: <Code2 className="w-4 h-4" />, label: 'Code', action: () => insertText('```\n', '\n```', 'code'), shortcut: 'Ctrl+Shift+C' },
    { icon: <Minus className="w-4 h-4" />, label: 'Horizontal Rule', action: () => insertText('---\n', '', ''), shortcut: 'Ctrl+Shift+-' },
    { type: 'divider' },
    { icon: <LinkIcon className="w-4 h-4" />, label: 'Link', action: () => insertText('[', '](url)', 'link text'), shortcut: 'Ctrl+K' },
  ];

  const handleSaveClick = () => {
    if (!markdownContent.trim()) return;
    
    if (isNewFile) {
      setIsSaveDialogOpen(true);
    } else {
      handleUpdatePresentation();
    }
  };

  const handleCreatePresentation = async () => {
    if (!markdownContent.trim() || !fileName.trim()) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/presentations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: markdownContent,
          fileName: fileName.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save presentation');
      }

      const data = await response.json();
      
      setSavedContent(markdownContent);
      setSavedFileName(data.slug);
      setIsSaveDialogOpen(false);
      setFileName('');
    } catch (error) {
      console.error('Error saving presentation:', error);
      alert(error instanceof Error ? error.message : 'Failed to save presentation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePresentation = useCallback(async () => {
    if (!markdownContent.trim() || (!savedFileName && !editSlug)) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/presentations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: markdownContent,
          fileName: savedFileName || editSlug,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update presentation');
      }

      setSavedContent(markdownContent);
    } catch (error) {
      console.error('Error updating presentation:', error);
      alert(error instanceof Error ? error.message : 'Failed to update presentation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [markdownContent, savedFileName, editSlug]);

  // Keep refs updated with current values
  updatePresentationRef.current = handleUpdatePresentation;
  isDirtyRef.current = isDirty;
  isSavingRef.current = isSaving;
  markdownContentRef.current = markdownContent;

  // Autosave timer - saves every 30 seconds after first save if there are changes
  useEffect(() => {
    if (!savedFileName && !editSlug) return;

    const autoSaveInterval = setInterval(() => {
      if (isDirtyRef.current && !isSavingRef.current && markdownContentRef.current.trim()) {
        updatePresentationRef.current();
        setLastAutoSave(new Date());
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [savedFileName, editSlug]);

  // Calculate line numbers
  const lineNumbers = useMemo(() => {
    return markdownContent.split('\n').map((_, i) => i + 1);
  }, [markdownContent]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-rice flex items-center justify-center">
        <div className="inline-flex items-center gap-3 text-clay">
          <div className="w-2 h-2 bg-clay rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-clay rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
          <div className="w-2 h-2 bg-clay rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-rice">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-clay hover:text-ink transition-colors mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Presentations</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-clay text-xs tracking-[0.2em] uppercase mb-2">
                {editSlug ? 'Editing' : 'Create'}
              </p>
              <h1 className="text-3xl md:text-4xl text-ink">
                {title}
              </h1>
              {editSlug && (
                <p className="text-stone text-sm mt-1">
                  Editing: {editSlug}.md
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowShortcuts(!showShortcuts)}
                className="flex items-center gap-2 text-sm text-clay hover:text-ink transition-colors"
              >
                <Keyboard className="w-4 h-4" />
                <span>Shortcuts</span>
              </button>
              <p className="text-charcoal/60 text-sm max-w-md hidden md:block">
                Use <code className="bg-sand/50 px-1.5 py-0.5 rounded text-ink">---</code> to separate slides
              </p>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div>
          <div className="bg-washi rounded-lg border border-sand overflow-hidden shadow-sm">
              {/* Editor Toolbar */}
              {showToolbar && (
                <div className="border-b border-sand px-3 py-2 bg-rice/50 flex flex-wrap items-center gap-1">
                  {toolbarButtons.map((button, index) => (
                    button.type === 'divider' ? (
                      <div key={index} className="w-px h-6 bg-sand mx-1" />
                    ) : (
                      <button
                        key={button.label}
                        onClick={button.action}
                        title={`${button.label} (${button.shortcut})`}
                        className="p-2 rounded-md text-clay hover:text-ink hover:bg-sand/50 transition-all"
                      >
                        {button.icon}
                      </button>
                    )
                  ))}
                  <div className="w-px h-6 bg-sand mx-1" />

                  {/* Templates Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowTemplates(!showTemplates)}
                      className={`p-2 rounded-md transition-all flex items-center gap-1 ${showTemplates ? 'text-sage bg-sage/10' : 'text-clay hover:text-ink hover:bg-sand/50'}`}
                      title="Load Template"
                    >
                      <LayoutTemplate className="w-4 h-4" />
                    </button>
                    
                    {showTemplates && (
                      <div className="absolute left-0 top-full mt-2 w-48 rounded-lg shadow-xl overflow-hidden bg-washi border border-sand z-50">
                        <div className="px-3 py-2 text-xs font-medium border-b border-sand text-stone">
                          Templates
                        </div>
                        {templates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => {
                              handleLoadTemplate(template.id);
                              setShowTemplates(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors text-clay hover:text-ink hover:bg-sand/50 text-left"
                          >
                            {template.icon}
                            <div>
                              <p className="text-sm">{template.name}</p>
                              <p className="text-xs text-stone">{template.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1" />
                  <button
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className="p-2 rounded-md text-clay hover:text-ink hover:bg-sand/50 transition-all disabled:opacity-30"
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    className="p-2 rounded-md text-clay hover:text-ink hover:bg-sand/50 transition-all disabled:opacity-30"
                    title="Redo (Ctrl+Shift+Z)"
                  >
                    <Redo className="w-4 h-4" />
                  </button>
                  <div className="w-px h-6 bg-sand mx-1" />
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`p-2 rounded-md transition-all ${showPreview ? 'text-sage bg-sage/10' : 'text-clay hover:text-ink hover:bg-sand/50'}`}
                    title="Toggle Preview"
                  >
                    {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* Editor Header */}
              <div className="border-b border-sand px-4 py-3 bg-rice/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-clay">
                  <span className="w-2 h-2 rounded-full bg-sage" />
                  <span>Markdown Editor</span>
                  {isDirty && markdownContent.trim() && (
                    <span className="flex items-center gap-1 text-xs text-amber-600 ml-2">
                      <AlertCircle className="w-3 h-3" />
                      Unsaved changes
                    </span>
                  )}
                  {!isDirty && (savedFileName || editSlug) && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 ml-2" title={lastAutoSave ? `Last auto-save: ${lastAutoSave.toLocaleTimeString()}` : undefined}>
                      <FileCheck className="w-3 h-3" />
                      Saved {lastAutoSave && `(auto-save ${lastAutoSave.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-stone">
                  <span>Line {currentLine}, Col {currentColumn}</span>
                  <span>{markdownContent.length.toLocaleString()} chars</span>
                  <span>{lineNumbers.length} lines</span>
                </div>
              </div>

              {/* Editor with Line Numbers */}
              <div className="relative flex h-[60vh]">
                {/* Line Numbers */}
                <div
                  ref={lineNumbersRef}
                  className="hidden md:block w-12 py-5 bg-rice/30 border-r border-sand text-right pr-3 select-none h-full overflow-y-auto"
                  style={{ 
                    fontFamily: 'var(--font-bricolage), monospace',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                >
                  {lineNumbers.map((num) => (
                    <div
                      key={num}
                      className={`text-sm leading-relaxed ${num === currentLine ? 'text-sage font-medium' : 'text-stone'}`}
                    >
                      {num}
                    </div>
                  ))}
                </div>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={markdownContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onScroll={handleTextareaScroll}
                  placeholder={`# Your Title

Welcome to your presentation.

---

## First Section

Your content here...

---

## Code Example

\`\`\`python
print("Hello, World!")
\`\`\`

---

## Thank You

Questions welcome`}
                  className={`${showPreview ? 'w-1/2' : 'flex-1'} h-full p-5 font-mono text-sm bg-rice text-charcoal
                           resize-none focus:outline-none focus:ring-0 leading-relaxed border-r border-sand`}
                  spellCheck={false}
                  style={{ fontFamily: 'var(--font-bricolage), monospace' }}
                />
                
                {/* Preview Panel */}
                {showPreview && (
                  <div className="w-1/2 h-full overflow-y-auto bg-washi p-5">
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          h1: ({ children }) => <h1 className="text-2xl font-normal mb-4 text-ink">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-xl font-normal mb-3 text-charcoal">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-lg font-normal mb-2 text-charcoal">{children}</h3>,
                          p: ({ children }) => <p className="text-sm leading-relaxed mb-4 text-charcoal">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-4 text-sm text-charcoal">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-4 text-sm text-charcoal">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          code: ({ children, className }) => {
                            const match = /language-(\w+)/.exec(className || '');
                            const language = match ? match[1] : '';

                            if (language) {
                              return (
                                <SyntaxHighlighter
                                  language={language}
                                  style={oneDark}
                                  customStyle={{
                                    margin: '1rem 0',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.75rem',
                                  }}
                                  showLineNumbers={false}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              );
                            }

                            return (
                              <code className="px-1.5 py-0.5 rounded text-xs font-mono bg-sand text-ink">
                                {children}
                              </code>
                            );
                          },
                          pre: ({ children }) => <>{children}</>,
                          blockquote: ({ children }) => (
                            <blockquote className="pl-4 italic mb-4 border-l-2 border-sage text-clay">
                              {children}
                            </blockquote>
                          ),
                          table: ({ children }) => (
                            <div className="overflow-x-auto mb-4">
                              <table className="w-full border-collapse text-sm border border-sand">
                                {children}
                              </table>
                            </div>
                          ),
                          thead: ({ children }) => <thead className="bg-sand/30">{children}</thead>,
                          th: ({ children }) => <th className="px-3 py-2 text-left font-medium border border-sand text-ink">{children}</th>,
                          td: ({ children }) => <td className="px-3 py-2 border border-sand text-charcoal">{children}</td>,
                        }}
                      >
                        {markdownContent || '*Preview will appear here*'}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Editor Footer */}
              <div className="border-t border-sand px-4 py-4 bg-rice/50 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-stone">
                  <span>
                    {isDirty && markdownContent.trim() 
                      ? 'Save to enable presentation'
                      : 'Press Start when ready'
                    }
                  </span>
                  <button
                    onClick={() => setShowToolbar(!showToolbar)}
                    className="text-clay hover:text-ink transition-colors"
                  >
                    {showToolbar ? 'Hide Toolbar' : 'Show Toolbar'}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveClick}
                    disabled={!markdownContent.trim() || !isDirty}
                    className="flex items-center gap-2 px-4 py-2.5 bg-washi hover:bg-sand
                             disabled:bg-sand/50 disabled:text-clay disabled:cursor-not-allowed
                             text-ink border border-sand rounded-md text-sm font-medium
                             transition-all duration-300"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isNewFile ? 'Save' : 'Update'}</span>
                  </button>
                  <button
                    onClick={handlePresentMarkdown}
                    disabled={!canPresent}
                    title={isDirty ? 'Save your changes before presenting' : 'Start presentation'}
                    className="flex items-center gap-2 px-6 py-2.5 bg-ink hover:bg-charcoal
                             disabled:bg-sand disabled:text-clay disabled:cursor-not-allowed
                             text-rice rounded-md text-sm font-medium transition-all duration-300
                             disabled:hover:transform-none hover:-translate-y-0.5"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Presentation</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Empty State Hint */}
            {!markdownContent.trim() && (
              <div className="mt-4 text-center">
                <p className="text-stone text-sm">
                  Start typing or use templates from the toolbar to begin
                </p>
              </div>
            )}
          </div>
        </div>

      {/* Save Dialog - only for new files */}
      {isSaveDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-washi rounded-lg border border-sand p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-ink">
                Save Presentation
              </h3>
              <button
                onClick={() => setIsSaveDialogOpen(false)}
                className="text-clay hover:text-ink transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-charcoal/60 mb-4">
              Save this presentation to the presentations directory.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-ink mb-2">
                File Name
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="my-presentation"
                className="w-full px-3 py-2 bg-rice border border-sand rounded-md
                         text-ink placeholder-stone
                         focus:outline-none focus:border-sage"
              />
              <p className="text-xs text-stone mt-1">
                Use lowercase letters, numbers, and hyphens only
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsSaveDialogOpen(false)}
                className="px-4 py-2 text-sm text-clay hover:text-ink transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePresentation}
                disabled={!fileName.trim() || isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-ink hover:bg-charcoal
                         disabled:bg-sand disabled:text-clay disabled:cursor-not-allowed
                         text-rice rounded-md text-sm font-medium transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Assistant */}
      <PresentationChat
        currentContent={markdownContent}
        onApplyContent={(content) => {
          setMarkdownContent(content);
          addToHistory(content, 0);
        }}
      />
    </div>
  );
}
