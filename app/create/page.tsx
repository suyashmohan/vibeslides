'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, Edit3, BookOpen, Lightbulb, Code, Sparkles, Presentation } from 'lucide-react';

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
    name: 'Simple Presentation',
    description: 'A clean, simple template to get started',
    icon: <BookOpen className="w-5 h-5" />,
    content: `# Welcome

This is your first slide.

---

## Second Slide

Add your content here.

---

## Thank You!

Questions?`,
  },
  {
    id: 'code',
    name: 'Code Tutorial',
    description: 'Perfect for teaching programming concepts',
    icon: <Code className="w-5 h-5" />,
    content: `# Python Basics

Let's learn Python!

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
    name: 'Business Pitch',
    description: 'For presenting business ideas or products',
    icon: <Lightbulb className="w-5 h-5" />,
    content: `# Our Amazing Product

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

## Market Opportunity

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
    
    // Store markdown in sessionStorage
    sessionStorage.setItem('liveMarkdownContent', markdownContent);
    sessionStorage.setItem('liveMarkdownTitle', 'Live Presentation');
    
    // Navigate to live presentation
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Presentations</span>
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Create Live Presentation
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Paste or type your markdown below. Use --- to separate slides.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Templates */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sticky top-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                Quick Start Templates
              </h3>
              
              <div className="space-y-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleLoadTemplate(template.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    <div className={`${selectedTemplate === template.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {template.icon}
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${selectedTemplate === template.id ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                        {template.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {template.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-start gap-2 text-sm">
                  <Presentation className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-600 dark:text-slate-400">
                    Use <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs">---</code> to separate slides
                  </p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Code className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-600 dark:text-slate-400">
                    Use <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs">```python</code> for code highlighting
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Editor */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Edit3 className="w-4 h-4" />
                  <span>Markdown Editor</span>
                </div>
                <div className="text-xs text-slate-400">
                  {markdownContent.length} characters
                </div>
              </div>
              
              <textarea
                value={markdownContent}
                onChange={(e) => setMarkdownContent(e.target.value)}
                placeholder={`# My Presentation

Welcome to my presentation!

---

## First Topic

Your content here...

---

## Code Example

\`\`\`python
print("Hello World")
\`\`\`

---

## Thank You!

Questions?`}
                className="w-full h-[60vh] p-4 font-mono text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 
                         resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                spellCheck={false}
              />
              
              <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Press Start Presentation when ready
                </div>
                <button
                  onClick={handlePresentMarkdown}
                  disabled={!markdownContent.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 
                           disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed
                           text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Presentation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
