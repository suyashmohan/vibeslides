import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const presentationsDir = path.join(process.cwd(), 'presentations');
    const filePath = path.join(presentationsDir, `${slug}.md`);
    
    // Security check - ensure the file is within the presentations directory
    const resolvedPath = path.resolve(filePath);
    const resolvedDir = path.resolve(presentationsDir);
    
    if (!resolvedPath.startsWith(resolvedDir)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Presentation not found' },
        { status: 404 }
      );
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    
    // Split content by horizontal rules to create slides
    const slideContents = content.split(/^\s*---\s*$/m).filter(slide => slide.trim());
    
    const slides = slideContents.map((slideContent, index) => ({
      id: index,
      content: slideContent.trim(),
    }));
    
    return NextResponse.json({
      title: data.title || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      author: data.author,
      date: data.date,
      slides,
    });
  } catch (error) {
    console.error('Error loading presentation:', error);
    return NextResponse.json(
      { error: 'Failed to load presentation' },
      { status: 500 }
    );
  }
}
