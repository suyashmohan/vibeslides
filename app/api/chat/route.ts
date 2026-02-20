import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const SYSTEM_PROMPT = `You are an expert presentation creator and editor assistant. Your role is to help users create and edit presentations in markdown format.

The presentation format uses markdown with slide separators (---) between slides. Each slide can contain:
- Headings (#, ##, ###)
- Text and paragraphs
- Lists (bullet points, numbered)
- Code blocks with syntax highlighting
- Quotes and blockquotes
- Tables
- Horizontal rules

When helping users:
1. Understand their intent - whether they want to create a new presentation or edit the current one
2. For new presentations: Create complete, well-structured markdown content with a clear flow
3. For edits: Modify specific parts while maintaining the overall structure and tone
4. Always return the FULL markdown content, not just the changes
5. Use proper markdown syntax and formatting
6. Include frontmatter-style slide separators (---) between slides
7. Keep slides concise and visually digestible

Current presentation context will be provided. Use it to:
- Maintain consistency in tone and style when editing
- Understand the topic and purpose
- Make contextual suggestions

Respond only with the markdown content, no explanations unless specifically asked.`;

// Create OpenRouter provider instance
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.AI_GATEWAY_API_KEY,
  headers: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'VibeSlides',
  },
});

export async function POST(request: Request) {
  try {
    const { prompt, currentContent } = await request.json();

    console.log('Received prompt:', prompt);
    console.log('Current content length:', currentContent?.length || 0);

    const result = streamText({
      model: openrouter('google/gemini-3-flash-preview'),
      system: SYSTEM_PROMPT,
      prompt: `Current presentation content:\n\n${currentContent || 'No content yet (creating new presentation)'}

User request: ${prompt}`,
      temperature: 0.7,
      maxOutputTokens: 4000,
    });

    // Use text stream response with proper headers
    const response = result.toTextStreamResponse({
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
    
    return response;
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
