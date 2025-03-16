import React, { useState, useEffect } from 'react';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import CodeEditor from '@/components/Editor';
import Terminal from '@/components/Terminal';
import Chat from '@/components/Chat';
import { useCodeRunner } from '@/components/CodeRunner';
import { getOllamaModels } from '@/services/ollamaService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DEFAULT_PYTHON_CODE = `# Write your Python code here
print("Hello, Local Mistral!")

# Example: Calculate the first 10 Fibonacci numbers
a, b = 0, 1
for i in range(10):
    print(a, end=" ")
    a, b = b, a + b
`;

const DEFAULT_JAVASCRIPT_CODE = `// Write your JavaScript code here
console.log("Hello, Local Mistral!");

// Example: Calculate the first 10 Fibonacci numbers
let a = 0, b = 1;
for (let i = 0; i < 10; i++) {
    console.log(a);
    [a, b] = [b, a + b];
}
`;

const Index = () => {
  const [code, setCode] = useState(DEFAULT_PYTHON_CODE);
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('python');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const { toast } = useToast();
  
  const { runCode, isRunning } = useCodeRunner({
    code,
    language,
    onOutputChange: setOutput,
  });
  
  useEffect(() => {
    const checkOllamaConnection = async () => {
      try {
        const models = await getOllamaModels();
        setAvailableModels(models);
        setConnected(models.includes('mistral'));
        
        if (models.includes('mistral')) {
          toast({
            title: "Connected to Ollama",
            description: "Mistral model is available and ready to use.",
          });
        } else if (models.length > 0) {
          toast({
            title: "Missing Mistral model",
            description: "Ollama is connected but Mistral model is not found. Please run 'ollama pull mistral'.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Connection failed",
          description: "Could not connect to Ollama. Make sure it's running on your machine.",
          variant: "destructive",
        });
      }
    };
    
    checkOllamaConnection();
  }, [toast]);
  
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    if (value === 'python') {
      setCode(DEFAULT_PYTHON_CODE);
    } else if (value === 'javascript') {
      setCode(DEFAULT_JAVASCRIPT_CODE);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      <Header onRunCode={runCode} />
      
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={70} minSize={30} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center px-3 py-2 border-b border-border bg-muted/20">
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[140px] h-8 text-sm bg-background">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="ml-4 flex items-center">
                {!connected && (
                  <div className="text-xs text-destructive flex items-center">
                    <div className="h-2 w-2 mr-1 rounded-full bg-destructive"></div>
                    Ollama/Mistral not detected
                  </div>
                )}
                
                {connected && (
                  <div className="text-xs text-muted-foreground flex items-center">
                    <div className="h-2 w-2 mr-1 rounded-full bg-primary"></div>
                    Connected to Mistral
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <ResizablePanelGroup
                direction="vertical"
                className="h-full"
              >
                <ResizablePanel defaultSize={70} className="h-full">
                  <CodeEditor 
                    code={code} 
                    onChange={setCode} 
                    language={language} 
                  />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={30} className="h-full">
                  <Terminal 
                    output={output} 
                    isLoading={isRunning} 
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={30} minSize={20} className="border-l border-border">
            <div className="h-full w-full overflow-hidden bg-card rounded-none">
              <Chat />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Index;
