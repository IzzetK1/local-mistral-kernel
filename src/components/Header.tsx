
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Settings } from 'lucide-react';

interface HeaderProps {
  onRunCode: () => void;
}

const Header: React.FC<HeaderProps> = ({ onRunCode }) => {
  return (
    <header className="w-full px-6 py-3 flex items-center justify-between border-b border-border glass-effect animate-slide-down">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-medium">Local Mistral IDE</h1>
        <div className="rounded-full h-2 w-2 bg-primary animate-pulse-subtle" />
      </div>
      
      <div className="flex items-center space-x-3">
        <Button 
          onClick={onRunCode}
          className="button-effect flex items-center gap-2" 
          variant="default"
        >
          <Play className="h-4 w-4" />
          <span>Run</span>
        </Button>
        
        <Button variant="ghost" size="icon" className="button-effect">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
