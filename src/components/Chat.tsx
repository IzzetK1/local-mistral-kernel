
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, User, Loader2, Code, Terminal } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { runCodeWithOllama } from '@/services/ollamaService';
import { Textarea } from '@/components/ui/textarea';

interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp: Date;
  isCode?: boolean;
  language?: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      content: "Merhaba! Size nasıl yardımcı olabilirim? Uygulama geliştirme talebinizi yazabilir veya bir kod parçası gönderebilirsiniz.",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isMultiline, setIsMultiline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Kod parçalarını tanıma yardımcı fonksiyonu
  const detectCodeBlock = (text: string): { isCode: boolean, language: string, content: string } => {
    // Kod blokları için regex kontrolleri
    const codeBlockRegex = /```([a-z]*)\n([\s\S]*?)```/g;
    const match = codeBlockRegex.exec(text);
    
    if (match) {
      const language = match[1] || 'plaintext';
      const content = match[2].trim();
      return { isCode: true, language, content };
    }
    
    // Kod içeriyor mu kontrol et (basit heuristik)
    const probablyCode = /function |class |import |from |const |let |var |if \(|for \(|while \(/.test(text) 
      || /def |class |import |print\(|if |for |while /.test(text);
    
    return { 
      isCode: probablyCode, 
      language: probablyCode ? (text.includes('def ') || text.includes('print(') ? 'python' : 'javascript') : 'plaintext',
      content: text 
    };
  };
  
  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    
    // Detect if the message contains code
    const { isCode, language, content } = detectCodeBlock(inputValue);
    
    // Add user message
    const userMessage: ChatMessage = {
      content: isCode && inputValue.includes('```') ? content : inputValue,
      isUser: true,
      timestamp: new Date(),
      isCode,
      language: isCode ? language : undefined
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsMultiline(false);
    setIsThinking(true);
    
    try {
      // Display typing indicator
      const typingMessage: ChatMessage = {
        content: "Düşünüyorum...",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, typingMessage]);
      
      // Prepare prompt for Ollama based on whether it's code or a regular message
      let prompt = '';
      let response = '';
      
      if (isCode) {
        // If it's code, try to run it if possible
        prompt = `
        Kullanıcı aşağıdaki kodu gönderdi. İnceleyip şu adımları izle:
        
        1. Kod nedir, ne yapar, hangi dilde yazılmış açıkla
        2. Eğer çalıştırılabilir bir kod ise sonucunu göster
        3. Kodda iyileştirilebilecek noktalar varsa öner
        
        \`\`\`${language}
        ${content}
        \`\`\`
        `;
        
        try {
          // Kod çalıştırma
          if (language === 'python' || language === 'javascript') {
            const codeResult = await runCodeWithOllama(content, language);
            response = await callOllamaAPI(prompt);
            response += `\n\n**Kod Çalıştırma Sonucu:**\n\`\`\`\n${codeResult}\n\`\`\``;
          } else {
            response = await callOllamaAPI(prompt);
          }
        } catch (error) {
          response = await callOllamaAPI(prompt);
        }
      } else if (inputValue.toLowerCase().includes('uygulama') || 
                inputValue.toLowerCase().includes('geliştir') || 
                inputValue.toLowerCase().includes('yap') ||
                inputValue.toLowerCase().includes('oluştur')) {
        // Uygulama geliştirme talebi algılandı
        prompt = `
        Bir yazılım geliştirme asistanı olarak, aşağıdaki uygulama talebini analiz et ve detaylı yanıt ver:
        
        ${inputValue}
        
        1. Bu talebi gerçekleştirmek için ihtiyaç duyulacak teknolojileri listele
        2. Temel mimari yapıyı oluştur (dosya yapısı, bileşenler, vs.)
        3. Adım adım nasıl geliştirilebileceğini açıkla
        4. Başlangıç kodları için örnekler sun
        5. Olası zorluklar ve çözüm önerileri
        
        Cevabını düzenli ve sistemli bir şekilde, adımlar halinde hazırla.
        `;
        
        response = await callOllamaAPI(prompt);
      } else {
        // Genel talep
        prompt = `
        Bir yazılım geliştirme asistanısın. Aşağıdaki talebi analiz et ve cevapla:
        
        ${inputValue}
        
        Eğer bu bir kod talebi ise, talep edilen kodu açıkla ve örnek ver.
        Eğer bu bir soru ise, kısa ve öz bir şekilde cevapla.
        Eğer bu bir hata bildirimi ise, olası çözümleri öner.
        `;
        
        response = await callOllamaAPI(prompt);
      }
      
      // Kod bloklarını tanı ve formatla
      const formattedResponse = formatResponseWithCodeBlocks(response);
      
      // Remove typing indicator and add actual response
      setMessages((prev) => prev.slice(0, prev.length - 1).concat(formattedResponse));
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
  
  // Helper to call Ollama API
  const callOllamaAPI = async (prompt: string): Promise<string> => {
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
    return data.response.trim();
  };
  
  // Format response and detect code blocks
  const formatResponseWithCodeBlocks = (text: string): ChatMessage[] => {
    const codeBlockRegex = /```([a-z]*)\n([\s\S]*?)```/g;
    const messages: ChatMessage[] = [];
    let lastIndex = 0;
    let match;
    
    // Find all code blocks and create separate messages for them
    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before the code block
      const beforeText = text.substring(lastIndex, match.index).trim();
      if (beforeText) {
        messages.push({
          content: beforeText,
          isUser: false,
          timestamp: new Date(),
        });
      }
      
      // Add the code block
      const language = match[1] || 'plaintext';
      const code = match[2].trim();
      messages.push({
        content: code,
        isUser: false,
        timestamp: new Date(),
        isCode: true,
        language,
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after the last code block
    const remainingText = text.substring(lastIndex).trim();
    if (remainingText) {
      messages.push({
        content: remainingText,
        isUser: false,
        timestamp: new Date(),
      });
    }
    
    // If no code blocks were found, return the original text
    if (messages.length === 0) {
      return [{
        content: text,
        isUser: false,
        timestamp: new Date(),
      }];
    }
    
    return messages;
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Only enter sends if not in multiline mode
    if (e.key === 'Enter' && !e.shiftKey && !isMultiline) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const toggleMultiline = () => {
    setIsMultiline(!isMultiline);
  };
  
  // Format code for display
  const formatMessageContent = (message: ChatMessage) => {
    if (message.isCode) {
      return (
        <div className="relative">
          <div className="absolute top-1 right-1 bg-muted/60 text-xs px-1 rounded">
            {message.language}
          </div>
          <pre className="bg-muted-foreground/10 p-2 rounded overflow-x-auto">
            <code>{message.content}</code>
          </pre>
        </div>
      );
    }
    
    return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
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
                  {message.isCode && (
                    <Code className="h-3 w-3 ml-1 mr-1" />
                  )}
                  <span className="text-xs opacity-70">
                    {message.isUser ? 'Siz' : 'Asistan'}
                  </span>
                  <span className="text-xs ml-1 opacity-50">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {formatMessageContent(message)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t border-border">
        <div className="flex flex-col space-y-2">
          {isMultiline ? (
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Kodunuzu veya talebinizi yazın... (Shift+Enter ile yeni satır)"
              className="min-h-[100px] w-full"
              disabled={isThinking}
            />
          ) : (
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Talebinizi yazın... (Enter ile gönder)"
              className="flex-1"
              disabled={isThinking}
            />
          )}
          
          <div className="flex items-center justify-between">
            <Button
              onClick={toggleMultiline}
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              type="button"
            >
              {isMultiline ? "Tek Satır Modu" : "Çok Satır Modu"}
              <Code className="h-3 w-3 ml-1" />
            </Button>
            
            <Button 
              onClick={handleSendMessage} 
              size="sm"
              className="h-8 bg-primary hover:bg-primary/90"
              disabled={isThinking || inputValue.trim() === ''}
            >
              {isThinking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Gönder
                  <Send className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
