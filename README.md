# VibeSlides

## Overview

VibeSlides is a web application that transforms markdown files into beautiful, interactive slide presentations. It allows users to present content from local markdown files or create live presentations by pasting markdown directly into the browser.

### Business Purpose

This tool bridges the gap between simple markdown documentation and professional presentation software. It's designed for:

- **Developers** who want to present technical content with code syntax highlighting
- **Educators** creating programming tutorials or technical courses
- **Teams** sharing knowledge through markdown-based presentations
- **Anyone** who prefers writing in markdown over using traditional slide software

Key benefits:
- Write presentations in familiar markdown syntax
- No need for proprietary presentation software
- Version control friendly (markdown files)
- Live editing capability for quick presentations
- Beautiful animations and transitions out of the box

## Architecture

### Tech Stack

- **Framework**: Next.js 16.1.6 with App Router
- **Language**: TypeScript 5.x with strict mode
- **Styling**: Tailwind CSS 4.x with dark mode support
- **UI Components**: Custom components with Lucide React icons
- **Animations**: Framer Motion for slide transitions and element animations
- **Markdown Processing**: 
  - `react-markdown` for rendering
  - `remark-gfm` for GitHub Flavored Markdown
  - `rehype-raw` for raw HTML support
  - `react-syntax-highlighter` with Prism for code highlighting
- **Font**: Geist Sans and Geist Mono (Vercel's font)

### Project Structure

```
vibeslides/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home page - presentation grid
│   ├── layout.tsx                # Root layout with fonts
│   ├── globals.css               # Global styles & Tailwind
│   ├── create/                   # Live presentation creation
│   │   └── page.tsx              # Markdown editor interface
│   ├── presentation/
│   │   └── [slug]/               # Dynamic presentation viewer
│   │       └── page.tsx          # Slide viewer with animations
│   └── api/
│       ├── presentations/        # API for listing presentations
│       │   └── route.ts
│       └── presentation/[slug]/  # API for loading single presentation
│           └── route.ts
├── presentations/                # Local markdown files
│   ├── intro.md                  # Welcome & features demo
│   ├── web-development.md        # Web dev best practices
│   └── coding-basics.md          # Python basics tutorial
├── docs/                         # Documentation
│   └── README.md                 # This file
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── next.config.ts                # Next.js config
└── AGENTS.md                     # AI agent guidelines
```

## Pages & Routes

### 1. Home Page (`/`)

**Purpose**: Display available presentations and provide entry point to create live presentations.

**Features**:
- Grid layout showing all markdown files from `/presentations` folder
- "Create Live Presentation" card (first item, blue gradient) linking to `/create`
- Each presentation card shows:
  - Title (from frontmatter or filename)
  - Author and date (from frontmatter)
  - Excerpt (first paragraph)
  - Click to view presentation

**Technical Details**:
- Fetches data from `/api/presentations`
- Uses `useState` and `useEffect` for data loading
- Responsive grid (1-3 columns based on viewport)
- Loading spinner while fetching

### 2. Create Page (`/create`)

**Purpose**: Allow users to paste or type markdown and present it immediately without saving files.

**Features**:
- Two-column layout (templates on left, editor on right)
- Quick-start templates:
  - Simple Presentation (basic structure)
  - Code Tutorial (Python examples)
  - Business Pitch (structured outline)
- Full-screen markdown editor
- Character counter
- "Start Presentation" button stores content in sessionStorage
- Back button to return home

**Technical Details**:
- Uses `sessionStorage` to pass markdown to live viewer
- Templates are hardcoded in the component
- No database or file system operations

### 3. Presentation Viewer (`/presentation/[slug]`)

**Purpose**: Display markdown as interactive slide deck.

**Features**:
- **Two animation systems**:
  - Slide transitions: slide, fade, zoom, none
  - Element animations: stagger, fade, slide-up, none
- **Keyboard controls**:
  - Arrow keys: Navigate slides
  - Space: Next slide
  - Home/End: First/last slide
  - ESC: Exit or close settings menu
- **Fullscreen mode** toggle
- **Progress bar** showing current position
- **Syntax highlighting** for code blocks
- **Responsive design** works on all screen sizes

**Technical Details**:
- Slides separated by `---` (horizontal rule in markdown)
- Uses Framer Motion's `AnimatePresence` for transitions
- `custom={direction}` for left/right slide animations
- Markdown components override default rendering:
  - Headers (h1, h2, h3) with specific sizing
  - Code blocks with Prism syntax highlighting
  - Lists with custom bullet styling
  - Tables with proper borders
- Settings stored in localStorage persist across sessions

### 4. API Routes

**`/api/presentations`** (GET)
- Returns array of all presentations from `/presentations` folder
- Parses frontmatter (title, author, date)
- Generates excerpt from first paragraph
- Sorted by date (newest first)

**`/api/presentation/[slug]`** (GET)
- Returns single presentation by slug
- Splits content by `---` to create slides array
- Returns JSON: `{ title, author, date, slides[] }`
- Security: Validates file path is within presentations directory

**Special Case - Live Presentations**:
- When `slug === 'live'`, reads from `sessionStorage` instead of API
- Shows red "LIVE" badge in header
- No file system access required

## Key Features

### Slide System

1. **Slide Separation**: Use `---` on its own line in markdown
2. **Frontmatter Support**: YAML metadata at top of file:
   ```yaml
   ---
   title: "My Presentation"
   author: "John Doe"
   date: "2024-01-30"
   ---
   ```
3. **Code Highlighting**: Specify language after triple backticks:
   ` ```python `, ` ```javascript `, etc.

### Animation System

Users can customize animations from the settings menu (gear icon):

**Slide Transitions**:
- **Slide**: Slides in from left/right with scale effect
- **Fade**: Simple opacity transition
- **Zoom**: Scales in/out from center
- **None**: Instant switch

**Element Animations**:
- **Stagger**: Elements appear sequentially with 100ms delay
- **Fade**: Elements fade in
- **Slide Up**: Elements slide up while fading in
- **None**: No element animations

Both settings persist in localStorage.

## Data Flow

### Local Presentations
1. User visits home page (`/`)
2. Client fetches `/api/presentations`
3. Server reads `/presentations/*.md` files
4. Returns JSON with metadata and excerpts
5. Grid displays cards
6. User clicks card → navigates to `/presentation/[slug]`
7. Viewer loads `/api/presentation/[slug]`
8. Server parses markdown and splits into slides
9. Viewer renders with animations

### Live Presentations
1. User clicks "Create Live Presentation" on home page
2. Navigates to `/create`
3. Types/pastes markdown in editor
4. Clicks "Start Presentation"
5. Content stored in `sessionStorage`
6. Navigates to `/presentation/live`
7. Viewer reads from `sessionStorage` instead of API
8. Renders with same animation options

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repo-url>
cd vibeslides

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Adding Presentations

1. Create a `.md` file in `/presentations` folder
2. Add optional frontmatter at the top
3. Write content using markdown syntax
4. Use `---` to separate slides
5. File automatically appears on home page

Example:
```markdown
---
title: "My Topic"
author: "Your Name"
date: "2024-01-30"
---

# Welcome

My first slide

---

## Details

- Point 1
- Point 2

---

## Code Example

```python
def hello():
    print("Hello World")
```

---

## Thank You!
```

## Development Guidelines

### Code Style
See `AGENTS.md` for detailed coding standards including:
- TypeScript strict mode requirements
- React component patterns
- Import ordering
- Naming conventions
- Error handling
- Tailwind CSS usage
- Accessibility standards

### Running Checks

```bash
# TypeScript check
npx tsc --noEmit

# Linting
npm run lint

# Build
npm run build
```

### Project Conventions

1. **Client Components**: Mark with `'use client'` when using:
   - React hooks (useState, useEffect, etc.)
   - Browser APIs (localStorage, sessionStorage)
   - Event handlers that need client-side JS

2. **Server Components**: Default in Next.js App Router
   - Use for data fetching
   - API routes
   - Static content

3. **File Naming**:
   - Routes: `kebab-case` (e.g., `page.tsx`, `layout.tsx`)
   - Components: `PascalCase` (e.g., `PresentationViewer`)

4. **CSS**: Use Tailwind exclusively, no custom CSS files except `globals.css`

## Contributing

### Areas for Contribution

1. **New Features**:
   - Export to PDF
   - Presentation templates gallery
   - Slide preview/thumbnail view
   - Collaborative editing
   - More animation options

2. **Improvements**:
   - Additional code language support
   - Better mobile experience
   - Keyboard shortcut customization
   - Dark/light mode toggle (currently follows system)

3. **Bug Fixes**:
   - Test edge cases with markdown parsing
   - Verify animation performance on low-end devices
   - Ensure accessibility compliance

### Submitting Changes

1. Follow code style in `AGENTS.md`
2. Test all affected pages
3. Run `npm run lint` and `npx tsc --noEmit`
4. Create clear commit messages
5. Test both local files and live presentations

## License

[Add your license here]

## Support

[Add support information here]

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
