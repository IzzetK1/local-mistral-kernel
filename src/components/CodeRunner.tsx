
import React, { useState } from 'react';
import { runCodeWithOllama } from '@/services/ollamaService';
import { useToast } from '@/components/ui/use-toast';

interface CodeRunnerProps {
  code: string;
  language: string;
  onOutputChange: (output: string) => void;
}

// Changed from a React component to a custom hook
export const useCodeRunner = ({ code, language, onOutputChange }: CodeRunnerProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const runCode = async () => {
    if (!code.trim()) {
      toast({
        title: "No code to run",
        description: "Please enter some code first.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    onOutputChange("Running code...");

    try {
      const output = await runCodeWithOllama(code, language);
      onOutputChange(output);
    } catch (error) {
      onOutputChange(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: "Execution failed",
        description: "There was an error running your code.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return { runCode, isRunning };
};
