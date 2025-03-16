
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, User } from 'lucide-react';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    // Add user message
    const userMessage: ChatMessage = {
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    
    // Simulate bot response
    setTimeout(() => {
      const botMessage: ChatMessage = {
        content: "Talebinizi aldım, inceliyorum.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
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
          Chat
        </div>
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
                    {message.isUser ? 'You' : 'Assistant'}
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
          />
          <Button 
            onClick={handleSendMessage} 
            size="icon"
            className="h-10 w-10 bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
