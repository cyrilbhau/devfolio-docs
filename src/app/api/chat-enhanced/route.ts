import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { ProvideLinksToolSchema } from 'lib/chat/inkeep-qa-schema';
import { source } from '@/lib/source';

export const runtime = 'edge';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to search through documentation
async function searchDocumentation(query: string) {
  try {
    // Get all pages from the source
    const pages = source.getPages();
    
    // Simple text search through content
    const relevantPages = pages
      .filter(page => {
        const content = page.data.body?.toLowerCase() || '';
        const title = page.data.title?.toLowerCase() || '';
        const queryLower = query.toLowerCase();
        
        return content.includes(queryLower) || title.includes(queryLower);
      })
      .slice(0, 3) // Limit to top 3 results
      .map(page => ({
        title: page.data.title,
        url: page.url,
        content: page.data.body?.slice(0, 500) + '...' // First 500 chars
      }));
    
    return relevantPages;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export async function POST(req: Request) {
  const reqJson = await req.json();
  const lastMessage = reqJson.messages[reqJson.messages.length - 1];
  
  // Search for relevant documentation
  const relevantDocs = await searchDocumentation(lastMessage.content);
  
  // Build context from relevant docs
  const context = relevantDocs.length > 0 
    ? `\n\nRelevant documentation context:\n${relevantDocs.map(doc => 
        `Title: ${doc.title}\nURL: ${doc.url}\nContent: ${doc.content}`
      ).join('\n\n')}`
    : '';

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `You are a helpful documentation assistant for Devfolio, a platform for hackathons and developer portfolios.
    
    Use the provided documentation context to answer questions accurately.
    When referencing specific pages, always provide links using the provideLinks tool.
    
    Guidelines:
    - Be concise and helpful
    - Focus on practical, actionable advice
    - If you don't know something, say so rather than guessing
    - Always cite sources when available
    
    ${context}`,
    tools: {
      provideLinks: {
        parameters: ProvideLinksToolSchema,
        description: 'Provide relevant documentation links to the user'
      },
    },
    messages: reqJson.messages.map((message: Record<string, unknown>) => ({
      role: message.role,
      content: message.content,
      id: message.id,
    })),
    toolChoice: 'auto',
    maxTokens: 1000,
    temperature: 0.7,
  });

  return result.toDataStreamResponse();
}