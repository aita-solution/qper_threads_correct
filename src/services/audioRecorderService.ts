import { API_KEY } from '../constants';

class AudioRecorderError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'AudioRecorderError';
  }
}

export class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isProcessing: boolean = false;
  private recordingTimeout: NodeJS.Timeout | null = null;
  private readonly MAX_RECORDING_TIME = 60000; // 60 Sekunden maximale Aufnahmezeit

  private readonly defaultOptions = {
    channelCount: 1,
    sampleRate: 16000,
    echoCancellation: true,
    noiseSuppression: true,
    audioBitsPerSecond: 128000
  };


  private async checkAudioSupport(): Promise<string> {
    console.log('Checking audio support...');
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/ogg;codecs=opus',
      'audio/wav',
      'audio/mp4'
    ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        console.log(`Supported mime type found: ${mimeType}`);
        return mimeType;
      }
    }
    throw new AudioRecorderError('Kein unterstütztes Audioformat gefunden', 'UNSUPPORTED_FORMAT');
  }

  async startRecording(): Promise<void> {
    console.log('Starting recording...');
    
    if (this.isProcessing) {
      console.log('Already processing, cannot start new recording');
      throw new AudioRecorderError('Eine Aufnahme wird bereits verarbeitet', 'PROCESSING_IN_PROGRESS');
    }

    // Cleanup von vorherigen Aufnahmen
    this.cleanup();

    try {
      const mimeType = await this.checkAudioSupport();
      console.log(`Using mime type: ${mimeType}`);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          ...this.defaultOptions,
          autoGainControl: false // Verhindert automatische Lautstärkeanpassung
        }
      });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: this.defaultOptions.audioBitsPerSecond
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        console.log(`Received data chunk: ${event.data.size} bytes`);
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstart = () => {
        console.log('MediaRecorder started');
        // Setze Timeout für maximale Aufnahmezeit
        this.recordingTimeout = setTimeout(() => {
          console.log('Maximum recording time reached');
          this.stopRecording().catch(console.error);
        }, this.MAX_RECORDING_TIME);
      };

      this.mediaRecorder.onerror = (event: MediaRecorderErrorEvent) => {
        console.error('MediaRecorder error:', event);
        this.cleanup();
      };

      this.mediaRecorder.start(1000); // Chunk alle Sekunde
      console.log('Recording started successfully');

    } catch (error) {
      console.error('Error in startRecording:', error);
      this.cleanup();
      throw new AudioRecorderError(
        'Mikrofonzugriff nicht möglich: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'),
        'MIC_ACCESS_ERROR'
      );
    }
  }

  async stopRecording(): Promise<Blob> {
    console.log('Stopping recording...');
    
    if (this.isProcessing) {
      console.log('Already processing, cannot stop');
      throw new AudioRecorderError('Aufnahme wird bereits verarbeitet', 'PROCESSING_IN_PROGRESS');
    }

    this.isProcessing = true;

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        this.isProcessing = false;
        reject(new AudioRecorderError('Keine aktive Aufnahme', 'NO_ACTIVE_RECORDING'));
        return;
      }

      const timeoutId = setTimeout(() => {
        this.cleanup();
        reject(new AudioRecorderError('Timeout beim Stoppen der Aufnahme', 'STOP_TIMEOUT'));
      }, 5000); // 5 Sekunden Timeout

      this.mediaRecorder.onstop = () => {
        clearTimeout(timeoutId);
        try {
          console.log(`Creating blob from ${this.audioChunks.length} chunks`);
          const audioBlob = new Blob(this.audioChunks, { 
            type: this.mediaRecorder?.mimeType || 'audio/webm;codecs=opus'
          });
          console.log(`Created blob of size: ${audioBlob.size} bytes`);

          this.cleanup();
          resolve(audioBlob);
        } catch (error) {
          console.error('Error creating audio blob:', error);
          reject(new AudioRecorderError('Fehler beim Erstellen der Audiodatei', 'BLOB_CREATION_ERROR'));
        } finally {
          this.isProcessing = false;
        }
      };

      if (this.mediaRecorder.state === 'recording') {
        console.log('Stopping MediaRecorder');
        this.mediaRecorder.stop();
      } else {
        console.log(`MediaRecorder in unexpected state: ${this.mediaRecorder.state}`);
        clearTimeout(timeoutId);
        this.cleanup();
        this.isProcessing = false;
        reject(new AudioRecorderError('Aufnahme ist nicht aktiv', 'INVALID_STATE'));
      }
    });
  }

  private cleanup(): void {
    console.log('Cleaning up resources...');
    
    if (this.recordingTimeout) {
      clearTimeout(this.recordingTimeout);
      this.recordingTimeout = null;
    }

    if (this.mediaRecorder?.stream) {
      this.mediaRecorder.stream.getTracks().forEach(track => {
        console.log(`Stopping track: ${track.kind}`);
        track.stop();
      });
    }

    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isProcessing = false;
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    console.log('Starting transcription...');
    
    if (!API_KEY) {
      console.error('API key is missing');
      throw new AudioRecorderError('API-Konfiguration fehlt', 'API_CONFIG_ERROR');
    }

    if (audioBlob.size === 0) {
      throw new AudioRecorderError('Keine Audiodaten vorhanden', 'NO_AUDIO_DATA');
    }

    console.log(`Audio blob size: ${audioBlob.size} bytes`);

    if (audioBlob.size > 25 * 1024 * 1024) {
      throw new AudioRecorderError('Audiodatei ist zu groß (max. 25MB)', 'FILE_TOO_LARGE');
    }

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'de');
      formData.append('response_format', 'json');

      console.log('Sending transcription request to API...');
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        },
        body: formData
      });

      console.log(`API response status: ${response.status}`);

      if (!response.ok) {
        let errorMessage: string;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || `API-Fehler: ${response.status}`;
          console.error('API error details:', errorData);
        } catch (parseError) {
          errorMessage = `Transcription error: ${response.status} ${response.statusText}`;
          console.error('Failed to parse error response:', parseError);
        }
        throw new AudioRecorderError(errorMessage, 'TRANSCRIPTION_ERROR');
      }

      const data = await response.json();
      console.log('Transcription completed successfully');
      
      if (!data.text) {
        throw new AudioRecorderError('Keine Transkription in der Antwort', 'EMPTY_TRANSCRIPTION');
      }

      return data.text.trim();

    } catch (error) {
      console.error('Transcription error:', error);
      if (error instanceof AudioRecorderError) {
        throw error;
      }
      throw new AudioRecorderError(
        'Fehler bei der Transkription',
        'TRANSCRIPTION_ERROR'
      );
    }
  }

  get isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

export default new AudioRecorderService();