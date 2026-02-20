# VibeSlides

## Overview

VibeSlides is a web application that transforms markdown files into beautiful, interactive slide presentations. It allows users to present content from local markdown files, create live presentations by pasting markdown directly into the browser, and includes an AI-powered assistant to help create and edit presentations.

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
- Full CRUD operations - create, edit, and manage presentations
- AI-powered assistant for content creation and editing
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
  - `gray-matter` for frontmatter parsing
- **AI Integration**:
  - `ai` SDK for streaming AI responses
  - `@ai-sdk/openai` provider for OpenRouter API
  - Google Gemini 3 Flash Preview model
- **Font**: Geist Sans and Geist Mono (Vercel's font)

### Project Structure

```
vibeslides/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home page - presentation grid
│   ├── layout.tsx                # Root layout with fonts
│   ├── globals.css               # Global styles & Tailwind
│   ├── create/                   # Create/Edit presentation
│   │   └── page.tsx              # Full-featured markdown editor
│   ├── presentation/
│   │   └── [slug]/               # Dynamic presentation viewer
│   │       └── page.tsx          # Slide viewer with animations
│   ├── api/
│   │   ├── presentations/        # CRUD API for presentations
│   │   │   └── route.ts          # GET, POST, PUT operations
│   │   ├── presentation/[slug]/  # API for loading single presentation
│   │   │   └── route.ts          # GET endpoint
│   │   ├── edit/[slug]/          # API for editing presentations
│   │   │   └── route.ts          # GET endpoint (loads for editing)
│   │   └── chat/                 # AI chat API
│   │       └── route.ts          # POST endpoint for AI assistant
│   └── components/
│       └── PresentationChat.tsx  # AI chat UI component
├── presentations/                # Local markdown files
│   ├── intro.md                  # Welcome & features demo
│   ├── coding-basics.md          # Python basics tutorial
│   └── ...                       # Additional presentations
├── docs/                         # Documentation
│   └── README.md                 # This file
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── next.config.ts                # Next.js config
└── AGENTS.md                     # AI agent guidelines
```

## Pages & Routes

### 1. Home Page (`/`)

**Purpose**: Display available presentations and provide entry point to create new presentations.

**Features**:
- Grid layout showing all markdown files from `/presentations` folder
- "Create New Presentation" card (first item, blue gradient) linking to `/create`
- Each presentation card shows:
  - Title (from frontmatter or filename)
  - Author and date (from frontmatter)
  - Excerpt (first paragraph)
  - Edit button for quick access to editing
  - Click to view presentation

**Technical Details**:
- Fetches data from `/api/presentations`
- Uses `useState` and `useEffect` for data loading
- Responsive grid (1-3 columns based on viewport)
- Loading spinner while fetching

### 2. Create/Edit Page (`/create` and `/create?edit=<slug>`)

**Purpose**: Create new presentations or edit existing ones with a full-featured markdown editor.

**Features**:
#### Editor Interface
- **Two-column layout**: Templates panel (left), Editor (right)
- **Rich text editing**:
  - Undo/Redo history (50 states)
  - Tab indentation support (2 spaces)
  - Line numbers with synchronized scrolling
  - Live preview toggle (split view)
  - Character and line counters
  - Auto-save every 30 seconds (after initial save)
- **Formatting toolbar**:
  - Bold, Italic
  - Heading 1 & 2
  - Bullet and numbered lists
  - Blockquotes
  - Code blocks
  - Horizontal rules (slide separators)
  - Links
- **Quick-start templates**:
  - Simple Presentation (basic structure)
  - Code Tutorial (Python examples)
  - Business Pitch (structured outline)

#### Edit Mode (`/create?edit=<slug>`)
- Loads existing presentation for editing
- Preserves original frontmatter
- Shows filename and "Edit" title
- Updates existing file on save (PUT request)

#### Create Mode (`/create`)
- Fresh editor for new presentations
- Filename dialog on first save
- Creates new file on save (POST request)
- Validates filename (lowercase, numbers, hyphens only)

#### AI Assistant
- Floating chat button (bottom-right corner)
- AI-powered content creation and editing
- One-click apply AI-generated content to editor
- Real-time streaming responses
- Clear chat history option

**Technical Details**:
- Query parameter `edit` determines mode
- Content stored in component state
- Auto-save uses debounced timer
- Undo/Redo maintains history stack
- Keyboard shortcuts:
  - Ctrl+Z / Ctrl+Shift+Z: Undo/Redo
  - Tab / Shift+Tab: Indent/outdent

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
- **Edit button** (for file-based presentations) linking to `/create?edit=<slug>`
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

#### `/api/presentations`

**GET** - List all presentations
- Returns array of all presentations from `/presentations` folder
- Parses frontmatter (title, author, date)
- Generates excerpt from first paragraph
- Sorted by date (newest first)

**POST** - Create new presentation
- Validates filename (lowercase, numbers, hyphens only)
- Auto-generates frontmatter with title and date
- Extracts title from first H1 heading
- Prevents overwriting existing files (409 conflict)

**PUT** - Update existing presentation
- Preserves existing frontmatter
- Updates title from new content
- Adds `updatedAt` timestamp
- Returns 404 if presentation doesn't exist

#### `/api/presentation/[slug]`

**GET** - Load single presentation
- Returns single presentation by slug
- Splits content by `---` to create slides array
- Returns JSON: `{ title, author, date, slides[] }`
- Security: Validates file path is within presentations directory

**Special Case - Live Presentations**:
- When `slug === 'live'`, reads from `sessionStorage` instead of API
- Shows red "LIVE" badge in header
- No file system access required

#### `/api/edit/[slug]`

**GET** - Load presentation for editing
- Returns raw markdown content (without frontmatter)
- Returns: `{ slug, content, frontmatter }`
- Security: Validates file path to prevent path traversal

#### `/api/chat`

**POST** - AI assistant chat
- Streaming text responses using AI SDK
- System prompt optimized for presentation creation/editing
- Understands markdown slide format with `---` separators
- Returns full markdown content (not just changes)
- Supports all markdown elements

**Configuration**:
- Provider: OpenRouter API
- Model: Google Gemini 3 Flash Preview
- Temperature: 0.7
- Max tokens: 4000

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

### Editor Features

1. **Undo/Redo**: Maintains 50-state history
2. **Auto-save**: Saves every 30 seconds after initial save
3. **Line Numbers**: Synchronized with content scrolling
4. **Live Preview**: Toggle split view to see rendered output
5. **Templates**: Quick-start with pre-built structures
6. **Toolbar**: Common formatting at your fingertips
7. **Keyboard Shortcuts**:
   - Ctrl+Z / Ctrl+Shift+Z: Undo/Redo
   - Tab / Shift+Tab: Indent/outdent

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

### AI Assistant

The AI assistant helps create and edit presentations:

**Capabilities**:
- Generate new presentation content from prompts
- Edit and improve existing content
- Convert bullet points to full slides
- Add code examples and explanations
- Maintain consistent formatting

**Usage**:
1. Click floating chat button in editor
2. Type your request (e.g., "Add a slide about error handling")
3. Review AI-generated content
4. Click "Apply to Editor" to insert into presentation

## Data Flow

### Creating a New Presentation
1. User clicks "Create New Presentation" on home page
2. Navigates to `/create`
3. Types markdown in editor
4. Content auto-saves every 30 seconds
5. User clicks "Save Presentation" (first time)
6. Filename dialog appears
7. Client POSTs to `/api/presentations`
8. Server creates file in `/presentations/` folder
9. Auto-save continues to PUT updates

### Editing an Existing Presentation
1. User clicks "Edit" on presentation card or viewer
2. Navigates to `/create?edit=<slug>`
3. Client GETs `/api/edit/<slug>`
4. Editor loads with existing content
5. User makes changes
6. Content auto-saves via PUT to `/api/presentations`
7. Updates written to file

### Viewing Local Presentations
1. User visits home page (`/`)
2. Client fetches `/api/presentations`
3. Server reads `/presentations/*.md` files
4. Returns JSON with metadata and excerpts
5. Grid displays cards
6. User clicks card → navigates to `/presentation/[slug]`
7. Viewer loads `/api/presentation/[slug]`
8. Server parses markdown and splits into slides
9. Viewer renders with animations

### Live Presentations (No Save)
1. User creates presentation in editor without saving
2. Clicks "Start Presentation"
3. Content stored in `sessionStorage`
4. Navigates to `/presentation/live`
5. Viewer reads from `sessionStorage` instead of API
6. Renders with same animation options

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

### AI SDK Setup

To use the AI chat features for presentation creation and editing:

1. **Add OpenRouter API key to `.env`:**
   ```
   AI_GATEWAY_API_KEY=your_openrouter_api_key_here
   ```

2. **Update the AI model (optional):**
   The chat functionality uses the Google Gemini 3 Flash Preview model through OpenRouter. To use a different model, edit `app/api/chat/route.ts`:
   
   ```typescript
   // Line 49 in app/api/chat/route.ts
   model: openrouter('google/gemini-3-flash-preview'),
   ```
   
   Replace with any model supported by OpenRouter (e.g., `anthropic/claude-3-opus-20240229`, `openai/gpt-4o`, etc.)

### Adding Presentations

**Option 1: Via Web Editor**
1. Click "Create New Presentation" on home page
2. Write content in the editor
3. Click "Save Presentation"
4. Enter filename when prompted

**Option 2: Direct File Creation**
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
   - Presentation sharing/linking
   - Import from other formats (PowerPoint, Google Slides)

2. **Improvements**:
   - Additional code language support
   - Better mobile experience
   - Keyboard shortcut customization
   - Dark/light mode toggle (currently follows system)
   - AI assistant enhancements (image generation, voice commands)
   - Performance optimizations for large presentations

3. **Bug Fixes**:
   - Test edge cases with markdown parsing
   - Verify animation performance on low-end devices
   - Ensure accessibility compliance
   - Test file handling edge cases

### Submitting Changes

1. Follow code style in `AGENTS.md`
2. Test all affected pages (create, edit, view)
3. Run `npm run lint` and `npx tsc --noEmit`
4. Create clear commit messages
5. Test both file-based and live presentations
6. Verify AI chat functionality (if applicable)

## License

This project is open-source software. The author assumes no liability for any damages, losses, or issues arising from the use of this software. Use at your own risk.

## Support

This project was created as a fun experiment and is provided as-is with no support, warranties, or promises. The author is not obligated to provide assistance, updates, or maintenance. Feel free to fork, modify, and use according to your own needs.

---

**Built with ❤️ using Next.js, TypeScript, Tailwind CSS, and AI**
