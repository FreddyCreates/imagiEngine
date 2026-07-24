import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

export function CodeEditor({ filePath, onSave, onClose }: { filePath: string, onSave: (code: string) => void, onClose: () => void }) {
  const [code, setCode] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/get-file?path=${filePath}`)
      .then(res => res.json())
      .then(data => {
        setCode(data.content);
        setIsLoading(false);
      });
  }, [filePath]);

  const saveFile = async () => {
    await fetch('/api/update-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath, content: code }),
    });
    onSave(code);
  };

  const getAIHelp = async () => {
    const response = await fetch('/api/ai-code-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await response.json();
    setSuggestion(data.suggestion);
  };

  if (isLoading) return <div className="text-white p-4">Loading...</div>;

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-950 border border-gray-700 rounded-xl w-full h-full shadow-2xl backdrop-blur-sm bg-opacity-90">
      <div className="flex justify-between items-center text-white border-b border-gray-700 pb-2 cursor-grab">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          AI Developer Console
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
      </div>
      <p className="text-gray-400 text-xs italic">{filePath}</p>
      <Editor
        height="350px"
        defaultLanguage="typescript"
        value={code}
        onChange={(val) => setCode(val || '')}
        theme="vs-dark"
        options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false }}
      />
      <div className="flex gap-2 justify-end">
        <button onClick={getAIHelp} className="px-3 py-1.5 bg-purple-900 text-purple-100 rounded text-sm font-medium hover:bg-purple-800 transition">Analyze</button>
        <button onClick={saveFile} className="px-3 py-1.5 bg-emerald-900 text-emerald-100 rounded text-sm font-medium hover:bg-emerald-800 transition">Save</button>
      </div>
      {suggestion && (
        <div className="text-white p-3 bg-gray-900 border border-gray-800 rounded text-xs overflow-auto max-h-32">
          <h3 className="font-bold mb-1 text-purple-400 uppercase tracking-wider">AI Suggestion:</h3>
          {suggestion}
        </div>
      )}
    </div>
  );
}
