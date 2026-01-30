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
    // Parse frontmatter and return only the content (without frontmatter)
    const { data, content } = matter(fileContent);
    
    return NextResponse.json({
      slug,
      content: content.trim(),
      frontmatter: data,
    });
  } catch (error) {
    console.error('Error loading presentation for editing:', error);
    return NextResponse.json(
      { error: 'Failed to load presentation' },
      { status: 500 }
    );
  }
}
