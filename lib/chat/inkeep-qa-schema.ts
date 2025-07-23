import { z } from 'zod';

const DocumentationTypes = z.enum([
  'documentation',
  'guide',
  'tutorial',
  'api_reference',
  'example',
  'troubleshooting',
  'faq',
  'changelog',
  'site',
  'github_issue',
  'github_discussion',
  'custom_question_answer',
]);

const LinkType = z.union([
  DocumentationTypes,
  z.string(), // catch all
]);

const LinkSchema = z
  .object({
    label: z.string().nullish(), // the value of the footnote, e.g. `1`
    url: z.string(),
    title: z.string().nullish(),
    type: LinkType.nullish(),
    breadcrumbs: z.array(z.string()).nullish(),
    description: z.string().nullish(), // Brief description of the link content
  })
  .passthrough();

const LinksSchema = z.array(LinkSchema).nullish();

export const ProvideLinksToolSchema = z.object({
  links: LinksSchema,
});

const KnownAnswerConfidence = z.enum([
  'very_confident',
  'somewhat_confident',
  'not_confident',
  'no_sources',
  'other',
]);

const AnswerConfidence = z.union([KnownAnswerConfidence, z.string()]); // evolvable

const AIAnnotationsToolSchema = z
  .object({
    answerConfidence: AnswerConfidence,
    sourceQuality: z.enum(['high', 'medium', 'low']).nullish(),
    responseType: z.enum(['direct_answer', 'guidance', 'clarification_needed']).nullish(),
  })
  .passthrough();

export const ProvideAIAnnotationsToolSchema = z.object({
  aiAnnotations: AIAnnotationsToolSchema,
});

// Additional schema for search functionality
export const SearchQuerySchema = z.object({
  query: z.string(),
  filters: z.object({
    type: DocumentationTypes.nullish(),
    section: z.string().nullish(),
  }).nullish(),
});