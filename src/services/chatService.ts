// services/chatService.ts
import {
    createThread,
    sendMessage,
    createRun,
    checkRunStatus,
    getMessages,
    uploadFile
  } from './api';
  import type { Message } from '../types';
  
  class ChatService {
      private threadId: string | null = null;
      private messageQueue: Array<{
          content: string;
          fileIds: string[];
          resolve: (value: any) => void;
          reject: (reason: any) => void;
      }> = [];
      private isProcessing: boolean = false;
  
      constructor() {
          this.initializeThread();
      }
  
      private async initializeThread() {
          try {
              const thread = await createThread();
              this.threadId = thread.id;
              console.log('Thread initialized:', this.threadId);
          } catch (error) {
              console.error('Failed to initialize thread:', error);
          }
      }
  
      private async processMessageQueue() {
          if (this.isProcessing || this.messageQueue.length === 0 || !this.threadId) return;
  
          this.isProcessing = true;
          const { content, fileIds, resolve, reject } = this.messageQueue[0];
  
          try {
              // Sende die Nachricht
              await sendMessage(this.threadId, content, fileIds);
  
              // Starte einen Run
              const run = await createRun(this.threadId);
  
              // Prüfe den Status des Runs
              let runStatus = run.status;
              while (runStatus !== 'completed' && runStatus !== 'failed') {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  const statusCheck = await checkRunStatus(this.threadId!, run.id);
                  runStatus = statusCheck.status;
              }
  
              if (runStatus === 'failed') {
                  throw new Error('Run failed');
              }
  
              // Hole die aktualisierten Nachrichten
              const messages = await getMessages(this.threadId);
              resolve(messages);
  
          } catch (error) {
              reject(error);
          } finally {
              this.messageQueue.shift();
              this.isProcessing = false;
              this.processMessageQueue(); // Verarbeite die nächste Nachricht in der Queue
          }
      }
  
      async sendMessage(content: string, files: File[] = []): Promise<Message[]> {
          if (!this.threadId) {
              await this.initializeThread();
          }
  
          // Verarbeite Dateien, falls vorhanden
          const fileIds: string[] = [];
          if (files.length > 0) {
              try {
                  for (const file of files) {
                      const uploadedFile = await uploadFile(file);
                      fileIds.push(uploadedFile.id);
                  }
              } catch (error) {
                  console.error('File upload error:', error);
                  throw new Error('Failed to upload files');
              }
          }
  
          return new Promise((resolve, reject) => {
              this.messageQueue.push({ content, fileIds, resolve, reject });
              this.processMessageQueue();
          });
      }
  
      async uploadFiles(files: File[]): Promise<string[]> {
          const fileIds: string[] = [];
          for (const file of files) {
              try {
                  const uploadedFile = await uploadFile(file);
                  fileIds.push(uploadedFile.id);
              } catch (error) {
                  console.error('File upload error:', error);
                  throw error;
              }
          }
          return fileIds;
      }
  
      resetThread() {
          this.threadId = null;
          this.messageQueue = [];
          this.isProcessing = false;
          this.initializeThread();
      }
  }
  
  export default new ChatService();