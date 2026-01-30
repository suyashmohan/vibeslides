import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

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
