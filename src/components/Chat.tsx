
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, User, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { runCodeWithOllama } from '@/services/ollamaService';

interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      content: "Merhaba! Size nasıl yardımcı olabilirim?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    
    // Add user message
    const userMessage: ChatMessage = {
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);
    
    try {
      // Display typing indicator
      const typingMessage: ChatMessage = {
        content: "Düşünüyorum...",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, typingMessage]);
      
      // Prepare prompt for Ollama
      const prompt = `
      Bir yazılım geliştirme asistanısın. Aşağıdaki talebi analiz et ve cevapla:
      
      ${inputValue}
      
      Eğer bu bir kod talebi ise, talep edilen kodu açıkla.
      Eğer bu bir soru ise, kısa ve öz bir şekilde cevapla.
      Eğer bu bir hata bildirimi ise, olası çözümleri öner.
      `;
      
      // Call Ollama API
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral',
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const botResponse = data.response;
      
      // Remove typing indicator and add actual response
      setMessages((prev) => prev.slice(0, prev.length - 1).concat({
        content: botResponse.trim(),
        isUser: false,
        timestamp: new Date(),
      }));
    } catch (error) {
      console.error('Error calling Ollama:', error);
      
      // Remove typing indicator and add error message
      setMessages((prev) => prev.slice(0, prev.length - 1).concat({
        content: `Üzgünüm, bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}. Ollama'nın çalıştığından ve mistral modelinin yüklü olduğundan emin olun.`,
        isUser: false,
        timestamp: new Date(),
      }));
      
      toast({
        title: "Bağlantı hatası",
        description: "Ollama'ya bağlanırken bir hata oluştu. Servisin çalıştığından emin olun.",
        variant: "destructive",
      });
    } finally {
      setIsThinking(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/20">
        <div className="text-sm font-medium flex items-center">
          <MessageSquare className="h-4 w-4 mr-2 text-primary" />
          Mistral AI Asistanı
        </div>
        {isThinking && (
          <div className="text-xs flex items-center text-muted-foreground">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            İşleniyor...
          </div>
        )}
      </div>
      
      <ScrollArea className="flex-1 p-3">
        <div className="flex flex-col space-y-3">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[80%] px-3 py-2 rounded-lg
                  ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }
                `}
              >
                <div className="flex items-center mb-1">
                  {!message.isUser && (
                    <MessageSquare className="h-3 w-3 mr-1 text-muted-foreground" />
                  )}
                  {message.isUser && (
                    <User className="h-3 w-3 mr-1 text-primary-foreground" />
                  )}
                  <span className="text-xs opacity-70">
                    {message.isUser ? 'Siz' : 'Asistan'}
                  </span>
                  <span className="text-xs ml-1 opacity-50">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t border-border">
        <div className="flex items-center space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Talebinizi yazın..."
            className="flex-1"
            disabled={isThinking}
          />
          <Button 
            onClick={handleSendMessage} 
            size="icon"
            className="h-10 w-10 bg-primary hover:bg-primary/90"
            disabled={isThinking || inputValue.trim() === ''}
          >
            {isThinking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
