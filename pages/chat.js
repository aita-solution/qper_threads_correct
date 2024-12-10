// pages/chat.js
import { useState, useEffect } from 'react';
import ChatService from '../services/chatService';
import ChatInput from '../components/ChatInput';
import ChatMessage, { WelcomeMessage } from '../components/ChatMessage';
import FileUploadHandler from '../components/FileUploadHandler';
import CameraHandler from '../components/CameraHandler';
import Header from '../components/Header';

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [showCamera, setShowCamera] = useState(false);

    useEffect(() => {
        // Optional: Laden Sie hier gespeicherte Nachrichten
        // oder initialisieren Sie den Chat
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = {
            role: 'user',
            content: input,
            file_ids: selectedFiles.map(f => f.name) // Temporäre ID für die Anzeige
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await ChatService.sendMessage(input, selectedFiles);
            setMessages(prev => [...prev, response]);
            setInput('');
            setSelectedFiles([]);
        } catch (error) {
            console.error('Error:', error);
            // Zeigen Sie dem Benutzer eine Fehlermeldung an
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Entschuldigung, es gab einen Fehler bei der Verarbeitung Ihrer Anfrage. Bitte versuchen Sie es erneut.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFiles.length) return;

        setUploadingFiles(true);
        try {
            const uploadedFiles = await ChatService.uploadFiles(selectedFiles);
            // Hier können Sie die hochgeladenen Dateien verarbeiten
            // z.B. sie zur nächsten Nachricht hinzufügen
            setSelectedFiles([]); // Dateien zurücksetzen nach erfolgreichem Upload
        } catch (error) {
            console.error('Upload error:', error);
            // Zeigen Sie dem Benutzer eine Fehlermeldung an
        } finally {
            setUploadingFiles(false);
        }
    };

    const handleFileSelect = (files) => {
        // Prüfen Sie die Dateitypen und -größen hier
        const validFiles = files.filter(file => {
            const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword'];
            const maxSize = 5 * 1024 * 1024; // 5MB
            return validTypes.includes(file.type) && file.size <= maxSize;
        });

        setSelectedFiles(prev => [...prev, ...validFiles]);
    };

    const handleCameraCapture = (file) => {
        setSelectedFiles(prev => [...prev, file]);
        setShowCamera(false);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <Header />
            
            <main className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <WelcomeMessage />
                    {messages.map((message, index) => (
                        <ChatMessage 
                            key={index} 
                            message={message} 
                            isLastMessage={index === messages.length - 1} 
                        />
                    ))}
                </div>

                {selectedFiles.length > 0 && (
                    <FileUploadHandler 
                        files={selectedFiles}
                        onRemove={(index) => {
                            setSelectedFiles(files => files.filter((_, i) => i !== index));
                        }}
                        uploading={uploadingFiles}
                        onUpload={handleFileUpload}
                    />
                )}

                {showCamera && (
                    <CameraHandler 
                        onCapture={handleCameraCapture}
                        onClose={() => setShowCamera(false)}
                    />
                )}

                <ChatInput 
                    input={input}
                    onInputChange={setInput}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    onFileSelect={handleFileSelect}
                    onCameraOpen={() => setShowCamera(true)}
                    uploadingFiles={uploadingFiles}
                />
            </main>
        </div>
    );
};

export default ChatPage;