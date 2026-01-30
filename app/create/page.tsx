'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, BookOpen, Lightbulb, Code, Layout, Save, X, AlertCircle, FileCheck } from 'lucide-react';

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

export default function CreatePresentation() {
  const router = useRouter();
  const [markdownContent, setMarkdownContent] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [savedFileName, setSavedFileName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);

  // Refs to store current values for stable autosave interval
  const updatePresentationRef = useRef<() => void>(() => {});
  const isDirtyRef = useRef<boolean>(false);
  const isSavingRef = useRef<boolean>(false);
  const markdownContentRef = useRef<string>('');

  const isDirty = useMemo(() => {
    return markdownContent !== savedContent;
  }, [markdownContent, savedContent]);

  const isNewFile = !savedFileName;
  const canPresent = markdownContent.trim() && !isDirty;

  const handlePresentMarkdown = () => {
    if (!canPresent) return;
    
    sessionStorage.setItem('liveMarkdownContent', markdownContent);
    sessionStorage.setItem('liveMarkdownTitle', 'Live Presentation');
    
    router.push('/presentation/live');
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setMarkdownContent(template.content);
      // Note: Don't set savedContent here - templates need to be saved first
      setSelectedTemplate(templateId);
    }
  };

  const handleContentChange = (newContent: string) => {
    setMarkdownContent(newContent);
  };

  const handleSaveClick = () => {
    if (!markdownContent.trim()) return;
    
    if (isNewFile) {
      // Show dialog for new file
      setIsSaveDialogOpen(true);
    } else {
      // Direct save for existing file
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
      
      // Update saved state
      setSavedContent(markdownContent);
      setSavedFileName(data.slug);
      
      // Close dialog and stay on create page
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
    if (!markdownContent.trim() || !savedFileName) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/presentations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: markdownContent,
          fileName: savedFileName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update presentation');
      }

      // Update saved content to match current content
      setSavedContent(markdownContent);
    } catch (error) {
      console.error('Error updating presentation:', error);
      alert(error instanceof Error ? error.message : 'Failed to update presentation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [markdownContent, savedFileName]);

  // Keep the ref updated with the latest callback
  // Keep refs updated with current values
  updatePresentationRef.current = handleUpdatePresentation;
  isDirtyRef.current = isDirty;
  isSavingRef.current = isSaving;
  markdownContentRef.current = markdownContent;

  // Autosave timer - saves every 30 seconds after first save if there are changes
  useEffect(() => {
    // Only set up autosave if file has been saved at least once
    if (!savedFileName) return;

    const autoSaveInterval = setInterval(() => {
      // Only autosave if there are unsaved changes and not currently saving
      // Access current values through refs to avoid dependency issues
      if (isDirtyRef.current && !isSavingRef.current && markdownContentRef.current.trim()) {
        updatePresentationRef.current();
        setLastAutoSave(new Date());
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [savedFileName]); // Stable dependencies - interval only resets when file changes

  return (
    <div className="min-h-screen bg-[var(--color-rice)]">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        {/* Header */}
        <div className="mb-12">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-[var(--color-clay)] hover:text-[var(--color-ink)] transition-colors mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Presentations</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-[var(--color-clay)] text-xs tracking-[0.2em] uppercase mb-2">
                Create
              </p>
              <h1 className="text-3xl md:text-4xl text-[var(--color-ink)]">
                New Presentation
              </h1>
            </div>
            <p className="text-[var(--color-charcoal)]/60 text-sm max-w-md">
              Use <code className="bg-[var(--color-sand)]/50 px-1.5 py-0.5 rounded text-[var(--color-ink)]">---</code> to separate slides
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Templates & Tips */}
          <div className="lg:col-span-1 space-y-6">
            {/* Templates */}
            <div className="bg-[var(--color-washi)] rounded-lg border border-[var(--color-sand)] p-5">
              <h3 className="text-[var(--color-ink)] text-sm font-medium mb-4 flex items-center gap-2">
                <Layout className="w-4 h-4 text-[var(--color-sage)]" />
                Templates
              </h3>
              
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleLoadTemplate(template.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-md text-left transition-all duration-300 ${
                      selectedTemplate === template.id
                        ? 'bg-[var(--color-sage)]/15 border-[var(--color-sage)]/30'
                        : 'hover:bg-[var(--color-sand)]/50 border border-transparent'
                    }`}
                  >
                    <div className={`${selectedTemplate === template.id ? 'text-[var(--color-sage)]' : 'text-[var(--color-clay)]'}`}>
                      {template.icon}
                    </div>
                    <div>
                      <p className={`text-sm ${selectedTemplate === template.id ? 'text-[var(--color-sage)] font-medium' : 'text-[var(--color-ink)]'}`}>
                        {template.name}
                      </p>
                      <p className="text-xs text-[var(--color-stone)]">
                        {template.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-[var(--color-washi)] rounded-lg border border-[var(--color-sand)] p-5">
              <h3 className="text-[var(--color-ink)] text-sm font-medium mb-4">
                Markdown Tips
              </h3>
              <div className="space-y-3 text-xs text-[var(--color-clay)]">
                <div className="flex items-start gap-2">
                  <span className="text-[var(--color-sage)]">#</span>
                  <span>Heading 1 for titles</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[var(--color-sage)]">##</span>
                  <span>Heading 2 for sections</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[var(--color-sage)]">-</span>
                  <span>Bullet points</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[var(--color-sage)]">```</span>
                  <span>Code blocks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Editor */}
          <div className="lg:col-span-3">
            <div className="bg-[var(--color-washi)] rounded-lg border border-[var(--color-sand)] overflow-hidden shadow-sm">
              {/* Editor Header */}
              <div className="border-b border-[var(--color-sand)] px-4 py-3 bg-[var(--color-rice)]/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[var(--color-clay)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-sage)]" />
                  <span>Markdown Editor</span>
                  {isDirty && markdownContent.trim() && (
                    <span className="flex items-center gap-1 text-xs text-amber-600 ml-2">
                      <AlertCircle className="w-3 h-3" />
                      Unsaved changes
                    </span>
                  )}
                  {!isDirty && savedFileName && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 ml-2" title={lastAutoSave ? `Last auto-save: ${lastAutoSave.toLocaleTimeString()}` : undefined}>
                      <FileCheck className="w-3 h-3" />
                      Saved {lastAutoSave && `(auto-save ${lastAutoSave.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`}
                    </span>
                  )}
                </div>
                <div className="text-xs text-[var(--color-stone)]">
                  {markdownContent.length.toLocaleString()} characters
                </div>
              </div>
              
              {/* Textarea */}
              <textarea
                value={markdownContent}
                onChange={(e) => handleContentChange(e.target.value)}
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
                className="w-full h-[60vh] p-5 font-mono text-sm bg-[var(--color-rice)] text-[var(--color-charcoal)] 
                         resize-none focus:outline-none focus:ring-0 leading-relaxed"
                spellCheck={false}
                style={{ fontFamily: 'var(--font-bricolage), monospace' }}
              />
              
              {/* Editor Footer */}
              <div className="border-t border-[var(--color-sand)] px-4 py-4 bg-[var(--color-rice)]/50 flex items-center justify-between">
                <div className="text-xs text-[var(--color-stone)]">
                  {isDirty && markdownContent.trim() 
                    ? 'Save to enable presentation'
                    : 'Press Start when ready'
                  }
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveClick}
                    disabled={!markdownContent.trim() || !isDirty}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-washi)] hover:bg-[var(--color-sand)] 
                             disabled:bg-[var(--color-sand)]/50 disabled:text-[var(--color-clay)] disabled:cursor-not-allowed
                             text-[var(--color-ink)] border border-[var(--color-sand)] rounded-md text-sm font-medium 
                             transition-all duration-300"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isNewFile ? 'Save' : 'Update'}</span>
                  </button>
                  <button
                    onClick={handlePresentMarkdown}
                    disabled={!canPresent}
                    title={isDirty ? 'Save your changes before presenting' : 'Start presentation'}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-ink)] hover:bg-[var(--color-charcoal)] 
                             disabled:bg-[var(--color-sand)] disabled:text-[var(--color-clay)] disabled:cursor-not-allowed
                             text-[var(--color-rice)] rounded-md text-sm font-medium transition-all duration-300
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
                <p className="text-[var(--color-stone)] text-sm">
                  Select a template above or start typing to begin
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Dialog - only for new files */}
      {isSaveDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-washi)] rounded-lg border border-[var(--color-sand)] p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-[var(--color-ink)]">
                Save Presentation
              </h3>
              <button
                onClick={() => setIsSaveDialogOpen(false)}
                className="text-[var(--color-clay)] hover:text-[var(--color-ink)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-[var(--color-charcoal)]/60 mb-4">
              Save this presentation to the presentations directory.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-2">
                File Name
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="my-presentation"
                className="w-full px-3 py-2 bg-[var(--color-rice)] border border-[var(--color-sand)] rounded-md 
                         text-[var(--color-ink)] placeholder-[var(--color-stone)]
                         focus:outline-none focus:border-[var(--color-sage)]"
              />
              <p className="text-xs text-[var(--color-stone)] mt-1">
                Use lowercase letters, numbers, and hyphens only
              </p>
            </div>
            
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsSaveDialogOpen(false)}
                className="px-4 py-2 text-sm text-[var(--color-clay)] hover:text-[var(--color-ink)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePresentation}
                disabled={!fileName.trim() || isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-ink)] hover:bg-[var(--color-charcoal)] 
                         disabled:bg-[var(--color-sand)] disabled:text-[var(--color-clay)] disabled:cursor-not-allowed
                         text-[var(--color-rice)] rounded-md text-sm font-medium transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
