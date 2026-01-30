import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface SaveRequestBody {
  content: string;
  fileName: string;
}

export async function POST(request: Request) {
  try {
    const body: SaveRequestBody = await request.json();
    const { content, fileName } = body;

    if (!content || !fileName) {
      return NextResponse.json(
        { error: 'Content and fileName are required' },
        { status: 400 }
      );
    }

    // Validate fileName: lowercase letters, numbers, hyphens only
    const validFileName = fileName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const sanitizedFileName = validFileName.replace(/^-+|-+$/g, '');

    if (!sanitizedFileName) {
      return NextResponse.json(
        { error: 'Invalid file name' },
        { status: 400 }
      );
    }

    const presentationsDir = path.join(process.cwd(), 'presentations');

    // Create presentations directory if it doesn't exist
    if (!fs.existsSync(presentationsDir)) {
      fs.mkdirSync(presentationsDir, { recursive: true });
    }

    // Extract title from first heading
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : sanitizedFileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Create frontmatter
    const frontmatter = {
      title,
      date: new Date().toISOString().split('T')[0],
    };

    // Build file content with frontmatter
    const fileContent = `---
title: ${frontmatter.title}
date: ${frontmatter.date}
---

${content}`;

    const filePath = path.join(presentationsDir, `${sanitizedFileName}.md`);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'A presentation with this name already exists' },
        { status: 409 }
      );
    }

    // Write the file
    fs.writeFileSync(filePath, fileContent, 'utf-8');

    return NextResponse.json({
      success: true,
      slug: sanitizedFileName,
      title: frontmatter.title,
      message: 'Presentation saved successfully',
    });
  } catch (error) {
    console.error('Error saving presentation:', error);
    return NextResponse.json(
      { error: 'Failed to save presentation' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body: SaveRequestBody = await request.json();
    const { content, fileName } = body;

    if (!content || !fileName) {
      return NextResponse.json(
        { error: 'Content and fileName are required' },
        { status: 400 }
      );
    }

    // Validate fileName: lowercase letters, numbers, hyphens only
    const validFileName = fileName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const sanitizedFileName = validFileName.replace(/^-+|-+$/g, '');

    if (!sanitizedFileName) {
      return NextResponse.json(
        { error: 'Invalid file name' },
        { status: 400 }
      );
    }

    const presentationsDir = path.join(process.cwd(), 'presentations');
    const filePath = path.join(presentationsDir, `${sanitizedFileName}.md`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Presentation not found' },
        { status: 404 }
      );
    }

    // Read existing file to preserve frontmatter
    const existingContent = fs.readFileSync(filePath, 'utf-8');
    const { data: existingFrontmatter } = matter(existingContent);

    // Extract title from first heading
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : sanitizedFileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Update frontmatter
    const frontmatter = {
      ...existingFrontmatter,
      title,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    // Build file content with updated frontmatter
    const fileContent = `---
${Object.entries(frontmatter)
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}
---

${content}`;

    // Write the file
    fs.writeFileSync(filePath, fileContent, 'utf-8');

    return NextResponse.json({
      success: true,
      slug: sanitizedFileName,
      title: frontmatter.title,
      message: 'Presentation updated successfully',
    });
  } catch (error) {
    console.error('Error updating presentation:', error);
    return NextResponse.json(
      { error: 'Failed to update presentation' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const presentationsDir = path.join(process.cwd(), 'presentations');
    
    if (!fs.existsSync(presentationsDir)) {
      return NextResponse.json([]);
    }
    
    const files = fs.readdirSync(presentationsDir);
    
    const presentations = files
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const slug = file.replace(/\.md$/, '');
        const filePath = path.join(presentationsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);
        
        // Extract excerpt from first paragraph
        const excerpt = content
          .split('\n')
          .find(line => line.trim() && !line.startsWith('#') && !line.startsWith('---'))
          ?.substring(0, 150) || '';
        
        return {
          slug,
          title: data.title || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          author: data.author,
          date: data.date,
          excerpt: excerpt + (excerpt.length >= 150 ? '...' : ''),
        };
      })
      .sort((a, b) => {
        if (a.date && b.date) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        return 0;
      });
    
    return NextResponse.json(presentations);
  } catch (error) {
    console.error('Error loading presentations:', error);
    return NextResponse.json(
      { error: 'Failed to load presentations' },
      { status: 500 }
    );
  }
}
