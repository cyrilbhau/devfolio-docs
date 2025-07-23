import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { ProvideLinksToolSchema } from 'lib/chat/inkeep-qa-schema';

export const runtime = 'edge';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const reqJson = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'), // or 'gpt-4o' for better quality
    system: `You are a helpful documentation assistant for Devfolio. 
    Use the provided context to answer questions about the documentation.
    If you reference specific pages or sections, provide links using the provideLinks tool.
    Be concise and helpful.`,
    tools: {
      provideLinks: {
        parameters: ProvideLinksToolSchema,
      },
    },
    messages: reqJson.messages.map((message: Record<string, unknown>) => ({
      role: message.role,
      content: message.content,
      id: message.id,
    })),
    toolChoice: 'auto',
  });

  return result.toDataStreamResponse();
}