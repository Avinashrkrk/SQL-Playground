'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Square, 
  Clock, 
  CheckCircle, 
  XCircle,
  Copy,
  Download
} from 'lucide-react';
import { QueryResult } from '@/lib/db';

interface QueryEditorProps {
  playgroundId: string;
  onExecuteQuery: (query: string) => Promise<QueryResult>;
  isLoading: boolean;
  result: QueryResult | null;
  error: string | null;
}

export function QueryEditor({ 
  playgroundId, 
  onExecuteQuery, 
  isLoading, 
  result, 
  error 
}: QueryEditorProps) {
  const [query, setQuery] = useState('SELECT * FROM employees LIMIT 10;');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleExecute = async () => {
    if (query.trim() && !isLoading) {
      await onExecuteQuery(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        textarea.value = value.substring(0, start) + '  ' + value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        setQuery(textarea.value);
      }
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadResults = () => {
    if (!result) return;
    
    const csv = [
      result.columns.join(','),
      ...result.rows.map(row => result.columns.map(col => row[col]).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">SQL Query Editor</h2>
          <div className="flex gap-2">
            <Button
              onClick={handleExecute}
              disabled={isLoading || !query.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Execute
                </>
              )}
            </Button>
            <Button
              onClick={() => copyToClipboard(query)}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <Card className="bg-slate-900 border-slate-700">
          <div className="p-4">
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your SQL query here..."
              className="w-full h-32 bg-transparent text-white placeholder-slate-400 font-mono text-sm resize-none focus:outline-none"
              style={{ fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace' }}
            />
          </div>
        </Card>
        
        <div className="mt-2 text-xs text-slate-400">
          Press <kbd className="px-1 py-0.5 bg-slate-800 rounded">Cmd/Ctrl + Enter</kbd> to execute
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <Card className="mb-4 border-red-500 bg-red-900/20">
            <div className="p-4 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-300 mb-1">Query Error</h3>
                <p className="text-sm text-red-200">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {result && (
          <Card className="bg-slate-900 border-slate-700">
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="font-medium text-white">Query Results</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {result.rowCount} rows
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {result.executionTime}ms
                  </div>
                </div>
                <Button
                  onClick={downloadResults}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {result.rows.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      {result.columns.map((column, index) => (
                        <th
                          key={index}
                          className="text-left p-3 font-medium text-slate-300 bg-slate-800"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-b border-slate-800 hover:bg-slate-800/50"
                      >
                        {result.columns.map((column, colIndex) => (
                          <td
                            key={colIndex}
                            className="p-3 text-white font-mono text-sm"
                          >
                            {row[column] === null ? (
                              <span className="text-slate-500 italic">NULL</span>
                            ) : (
                              String(row[column])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <p>No results to display</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {!result && !error && !isLoading && (
          <div className="text-center py-16 text-slate-400">
            <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Ready to execute SQL queries</p>
            <p className="text-sm">
              Write your query above and click Execute or press Cmd/Ctrl + Enter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}