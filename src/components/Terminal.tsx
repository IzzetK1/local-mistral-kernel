
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal as TerminalIcon, XCircle, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="h-full w-full flex flex-col rounded-none border-0 overflow-hidden bg-black text-white">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted-foreground/20 border-b border-muted-foreground/20">
        <div className="text-xs font-medium flex items-center">
          <TerminalIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
          Console
          {isLoading && (
            <div className="ml-2 text-xs text-muted-foreground flex items-center">
              <div className="h-1.5 w-1.5 mr-1 rounded-full bg-primary animate-pulse"></div>
              Running...
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-white">
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-white">
            <XCircle className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-0 h-full" ref={scrollRef}>
        <div className="p-3 font-mono text-xs whitespace-pre-wrap">
          {output || "Run your code to see the output here..."}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Terminal;
