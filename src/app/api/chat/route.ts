import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const reqJson = await req.json();

    const result = streamText({
      model: openai('gpt-4o'),
      messages: reqJson.messages.map((message: Record<string, unknown>) => ({
        role: message.role as 'user' | 'assistant' | 'system',
        content: message.content as string,
        ...(message.id && { id: message.id as string }),
      })),
      system: `You are a helpful assistant for Devfolio documentation.
               Provide accurate, concise answers about Devfolio features, hackathon management, and platform usage.
               If you're not sure about something, say so clearly.`,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
}
