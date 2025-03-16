
import React, { useState, useEffect } from 'react';
import { Resizable, ResizeHandle } from '@/components/ui/resizable';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import CodeEditor from '@/components/Editor';
import Terminal from '@/components/Terminal';
import CodeRunner from '@/components/CodeRunner';
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
  
  // Initial load effect
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
  
  // Handle language change
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    if (value === 'python') {
      setCode(DEFAULT_PYTHON_CODE);
    } else if (value === 'javascript') {
      setCode(DEFAULT_JAVASCRIPT_CODE);
    }
  };
  
  // Code runner integration
  const { runCode, isRunning } = CodeRunner({
    code,
    language,
    onOutputChange: setOutput,
  });

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden animate-fade-in">
      <Header onRunCode={runCode} />
      
      <div className="flex items-center space-x-4 px-6 py-3 border-b border-border">
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="javascript">JavaScript</SelectItem>
          </SelectContent>
        </Select>
        
        {!connected && (
          <div className="text-sm text-destructive flex items-center">
            <div className="h-2 w-2 mr-2 rounded-full bg-destructive"></div>
            Ollama/Mistral not detected
          </div>
        )}
        
        {connected && (
          <div className="text-sm text-muted-foreground flex items-center">
            <div className="h-2 w-2 mr-2 rounded-full bg-primary"></div>
            Connected to Mistral
          </div>
        )}
      </div>
      
      <div className="flex-1 p-6 overflow-hidden">
        <Tabs defaultValue="editor" className="h-full flex flex-col">
          <TabsList className="mx-auto mb-6">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="split">Split View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="flex-1 h-[calc(100%-3rem)]">
            <div className="grid grid-rows-2 gap-6 h-full">
              <CodeEditor 
                code={code} 
                onChange={setCode} 
                language={language} 
              />
              <Terminal 
                output={output} 
                isLoading={isRunning} 
              />
            </div>
          </TabsContent>
          
          <TabsContent value="split" className="flex-1 h-[calc(100%-3rem)]">
            <Resizable
              direction="horizontal"
              className="h-full"
            >
              <div className="h-full">
                <CodeEditor 
                  code={code} 
                  onChange={setCode} 
                  language={language} 
                />
              </div>
              <ResizeHandle />
              <div className="h-full">
                <Terminal 
                  output={output} 
                  isLoading={isRunning} 
                />
              </div>
            </Resizable>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
