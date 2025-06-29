'use client';

import { cn } from '@/lib/utils';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Collapsible, CollapsibleContent } from 'fumadocs-ui/components/ui/collapsible';
import { usePathname } from 'next/navigation';

export interface Feedback {
  opinion: 'good' | 'bad';
  url?: string;
  message: string;
}

export interface ActionResponse {
  githubUrl: string;
}

interface Result extends Feedback {
  response?: ActionResponse;
}

export function Rate({
  onRateAction,
}: {
  onRateAction: (url: string, feedback: Feedback) => Promise<ActionResponse>;
}) {
  const url = usePathname() || '';
  const [previous, setPrevious] = useState<Result | null>(null);
  const [opinion, setOpinion] = useState<'good' | 'bad' | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load previous feedback from localStorage
  if (typeof window !== 'undefined' && !previous) {
    const item = localStorage.getItem(`docs-feedback-${url}`);
    if (item) {
      try {
        const parsed = JSON.parse(item);
        if (parsed && typeof parsed === 'object') {
          setPrevious(parsed);
        }
      } catch (e) {
        console.error('Failed to parse stored feedback', e);
      }
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    
    if (!opinion || !url) return;

    const feedback: Feedback = {
      opinion,
      message,
      url,
    };

    setIsSubmitting(true);
    try {
      const response = await onRateAction(url, feedback);
      const result = {
        ...feedback,
        response,
      };
      
      setPrevious(result);
      setMessage('');
      setOpinion(null);
      
      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`docs-feedback-${url}`, JSON.stringify(result));
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeOpinion = previous?.opinion ?? opinion;
  const isSubmitted = !!previous;

  return (
    <div className="mt-16 mb-8">
      <div className="border-t border-border pt-8">
        <Collapsible 
          open={opinion !== null || isSubmitted}
          onOpenChange={(open) => !open && setOpinion(null)}
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-foreground">How is this guide?</p>
            <div className="flex flex-row items-center gap-2">
              <button
                type="button"
                disabled={isSubmitted}
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border',
                  activeOpinion === 'good' 
                    ? 'bg-accent text-accent-foreground border-accent' 
                    : 'text-muted-foreground hover:bg-accent/50 border-border',
                  isSubmitted && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => setOpinion('good')}
              >
                <ThumbsUp className="h-4 w-4" />
                Yes
              </button>
              <button
                type="button"
                disabled={isSubmitted}
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border',
                  activeOpinion === 'bad'
                    ? 'bg-accent text-accent-foreground border-accent'
                    : 'text-muted-foreground hover:bg-accent/50 border-border',
                  isSubmitted && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => setOpinion('bad')}
              >
                <ThumbsDown className="h-4 w-4" />
                No
              </button>
            </div>
          </div>

          <CollapsibleContent className="mt-4">
            {isSubmitted ? (
              <div className="py-4 text-sm text-muted-foreground">
                <p className="mb-3">Thank you for your feedback!</p>
                <button
                  type="button"
                  onClick={() => {
                    if (previous) {
                      setOpinion(previous.opinion);
                      setMessage(previous.message);
                      setPrevious(null);
                      
                      // Remove from localStorage
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem(`docs-feedback-${url}`);
                      }
                    }
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Submit again
                </button>
              </div>
            ) : (
              <form className="mt-4 flex flex-col gap-3" onSubmit={submit}>
                <textarea
                  autoFocus
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="What can we improve? (Optional)"
                  onKeyDown={(e) => {
                    if (!e.shiftKey && e.key === 'Enter') {
                      e.preventDefault();
                      submit(e);
                    }
                  }}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className={cn(
                      'inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      isSubmitting && 'opacity-50 cursor-not-allowed'
                    )}
                    disabled={isSubmitting || !opinion}
                  >
                    {isSubmitting ? 'Sending...' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}