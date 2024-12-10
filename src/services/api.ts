import { ASSISTANT_ID, API_KEY } from '../constants';
import type { Message, ThreadResponse, RunResponse } from '../types';

const BASE_URL = 'https://api.openai.com/v1';

class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('API Error Details:', errorData); // Für besseres Debugging
    throw new APIError(
      errorData.error?.message || 'API request failed',
      response.status,
      errorData
    );
  }
  return response.json();
}

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
  'OpenAI-Beta': 'assistants=v2'
};

export const createThread = async (): Promise<ThreadResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/threads`, {
      method: 'POST',
      headers: defaultHeaders
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
};

export const uploadFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', 'assistants');

    const response = await fetch(`${BASE_URL}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
      },
      body: formData
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const sendMessage = async (threadId: string, content: string, fileIds: string[] = []) => {
  try {
    const response = await fetch(`${BASE_URL}/threads/${threadId}/messages`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        role: 'user',
        content
      })
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Message error:', error);
    throw error;
  }
};

export const createRun = async (threadId: string): Promise<RunResponse> => {
  try {
    console.log('Creating run with:', {
      threadId,
      assistantId: ASSISTANT_ID,
      model: 'gpt-4o' // Explizit das neue Modell angeben
    });
    
    
    const response = await fetch(`${BASE_URL}/threads/${threadId}/runs`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID,
        model: 'gpt-4o'
      })
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Run creation error:', error);
    if (error instanceof APIError) {
      console.error('API Error details:', {
        status: error.status,
        response: error.response
      });
    }
    throw error;
  }
};

export const checkRunStatus = async (threadId: string, runId: string): Promise<RunResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/threads/${threadId}/runs/${runId}`, {
      headers: defaultHeaders
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Status check error:', error);
    throw error;
  }
};

export const getMessages = async (threadId: string): Promise<Message[]> => {
  try {
    const response = await fetch(`${BASE_URL}/threads/${threadId}/messages`, {
      headers: defaultHeaders
    });
    
    const data = await handleResponse(response);
    // Hier wird sichergestellt, dass der Textinhalt extrahiert wird
    return data.data.map((msg: any) => ({
      ...msg,
      content: msg.content[0]?.text?.value || ''
    }));
  } catch (error) {
    console.error('Message fetch error:', error);
    throw error;
  }
};
