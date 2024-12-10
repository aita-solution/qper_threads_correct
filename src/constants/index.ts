export const ASSISTANT_ID = process.env.NEXT_PUBLIC_ASSISTANT_ID as string;
export const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY as string;

export const API_ROUTES = {
  THREADS: `${process.env.NEXT_PUBLIC_API_BASE_URL}/threads`,
  FILES: `${process.env.NEXT_PUBLIC_API_BASE_URL}/files`,
} as const;

export const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  DATA: ['text/csv']
} as const;

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB