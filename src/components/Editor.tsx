
import React, { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  onChange, 
  language = 'python' 
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
    
    // Add custom styles to the editor
    editor.updateOptions({
      fontFamily: 'JetBrains Mono, SF Mono, Menlo, Monaco, Courier New, monospace',
      fontSize: 14,
      lineHeight: 1.5,
      minimap: {
        enabled: false
      },
      scrollBeyondLastLine: false,
      padding: {
        top: 16,
        bottom: 16
      },
      smoothScrolling: true,
      cursorSmoothCaretAnimation: 'on',
      cursorBlinking: 'phase',
      roundedSelection: true,
      renderLineHighlight: 'all',
      lineNumbers: 'on',
      glyphMargin: false,
      folding: true,
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
      }
    });
  };

  return (
    <div className="h-full w-full overflow-hidden rounded-none border-0 bg-card shadow-none">
      <Editor
        height="100%"
        width="100%"
        defaultLanguage={language}
        defaultValue={code}
        onChange={(value) => onChange(value || '')}
        onMount={handleEditorDidMount}
        options={{
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          renderWhitespace: 'selection',
          renderControlCharacters: true,
          contextmenu: true,
          smoothScrolling: true,
          theme: 'vs-dark'
        }}
        className="p-0"
      />
    </div>
  );
};

export default CodeEditor;
