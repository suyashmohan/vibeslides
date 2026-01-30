'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, BookOpen, Lightbulb, Code, Layout } from 'lucide-react';

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
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const handlePresentMarkdown = () => {
    if (!markdownContent.trim()) return;
    
    sessionStorage.setItem('liveMarkdownContent', markdownContent);
    sessionStorage.setItem('liveMarkdownTitle', 'Live Presentation');
    
    router.push('/presentation/live');
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setMarkdownContent(template.content);
      setSelectedTemplate(templateId);
    }
  };

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
                </div>
                <div className="text-xs text-[var(--color-stone)]">
                  {markdownContent.length.toLocaleString()} characters
                </div>
              </div>
              
              {/* Textarea */}
              <textarea
                value={markdownContent}
                onChange={(e) => setMarkdownContent(e.target.value)}
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
                  Press Start when ready
                </div>
                <button
                  onClick={handlePresentMarkdown}
                  disabled={!markdownContent.trim()}
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
    </div>
  );
}
