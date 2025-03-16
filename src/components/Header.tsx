
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Settings, Save, Github, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onRunCode: () => void;
}

const Header: React.FC<HeaderProps> = ({ onRunCode }) => {
  return (
    <header className="w-full h-12 px-4 flex items-center justify-between border-b border-border bg-card shadow-sm">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-medium">Local Mistral IDE</h1>
        <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
          main.py
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          onClick={onRunCode}
          className="h-8 px-3 text-sm" 
          variant="default"
        >
          <Play className="h-3.5 w-3.5 mr-1" />
          Run
        </Button>
        
        <Button variant="outline" size="sm" className="h-8 px-3 text-sm">
          <Save className="h-3.5 w-3.5 mr-1" />
          Save
        </Button>
        
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
