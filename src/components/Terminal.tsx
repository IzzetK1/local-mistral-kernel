
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TerminalProps {
  output: string;
  isLoading?: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ output, isLoading = false }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="h-full w-full flex flex-col rounded-md border border-border bg-card shadow-subtle overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
        <div className="text-sm font-medium">Terminal Output</div>
        <div className="flex items-center space-x-2">
          {isLoading && (
            <div className="text-xs text-muted-foreground flex items-center">
              <div className="h-2 w-2 mr-2 rounded-full bg-primary animate-pulse"></div>
              Processing...
            </div>
          )}
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-0 h-full" ref={scrollRef}>
        <div className="p-4 font-mono text-sm whitespace-pre-wrap">
          {output || "Run your code to see the output here..."}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Terminal;
