'use client';

import { useState, useEffect } from 'react';
import { PlaygroundSidebar } from '@/components/playground-sidebar';
import { QueryEditor } from '@/components/query-editor';
import { QueryHistory } from '@/components/query-history';
import { Card } from '@/components/ui/card';
import { Database } from 'lucide-react';
import { Playground, QueryResult } from '@/lib/db';

export default function Home() {
  const [playgrounds, setPlaygrounds] = useState<Playground[]>([]);
  const [selectedPlayground, setSelectedPlayground] = useState<Playground | null>(null);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  useEffect(() => {
    fetchPlaygrounds();
  }, []);

  const fetchPlaygrounds = async () => {
    try {
      const response = await fetch('/api/playgrounds');
      if (response.ok) {
        const data = await response.json();
        setPlaygrounds(data);
        
        // Auto-select first playground if none selected
        if (data.length > 0 && !selectedPlayground) {
          setSelectedPlayground(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch playgrounds:', error);
    }
  };

  const handleCreatePlayground = async (name: string) => {
    try {
      const response = await fetch('/api/playgrounds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const playground = await response.json();
        setPlaygrounds(prev => [playground, ...prev]);
        setSelectedPlayground(playground);
      }
    } catch (error) {
      console.error('Failed to create playground:', error);
    }
  };

  const handleUpdatePlayground = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/playgrounds/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        setPlaygrounds(prev => 
          prev.map(p => p.id === id ? { ...p, name } : p)
        );
        
        if (selectedPlayground?.id === id) {
          setSelectedPlayground(prev => prev ? { ...prev, name } : null);
        }
      }
    } catch (error) {
      console.error('Failed to update playground:', error);
    }
  };

  const handleDeletePlayground = async (id: string) => {
    try {
      const response = await fetch(`/api/playgrounds/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPlaygrounds(prev => prev.filter(p => p.id !== id));
        
        if (selectedPlayground?.id === id) {
          const remaining = playgrounds.filter(p => p.id !== id);
          setSelectedPlayground(remaining.length > 0 ? remaining[0] : null);
        }
      }
    } catch (error) {
      console.error('Failed to delete playground:', error);
    }
  };

  const handleExecuteQuery = async (query: string): Promise<QueryResult> => {
    if (!selectedPlayground) {
      throw new Error('No playground selected');
    }

    setIsLoading(true);
    setQueryError(null);
    setQueryResult(null);

    try {
      const response = await fetch(`/api/playgrounds/${selectedPlayground.id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (response.ok) {
        setQueryResult(data);
        setHistoryRefresh(prev => prev + 1);
        return data;
      } else {
        const error = data.error || 'Failed to execute query';
        setQueryError(error);
        setHistoryRefresh(prev => prev + 1);
        throw new Error(error);
      }
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to execute query';
      setQueryError(errorMessage);
      setHistoryRefresh(prev => prev + 1);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQuery = (query: string) => {
    // This would ideally set the query in the editor
    // For now, we'll just trigger a re-render
    console.log('Selected query:', query);
  };

  return (
    <div className="flex h-screen bg-slate-950">
      <PlaygroundSidebar
        playgrounds={playgrounds}
        selectedPlayground={selectedPlayground}
        onSelectPlayground={setSelectedPlayground}
        onCreatePlayground={handleCreatePlayground}
        onUpdatePlayground={handleUpdatePlayground}
        onDeletePlayground={handleDeletePlayground}
        onRefresh={fetchPlaygrounds}
      />

      {selectedPlayground ? (
        <>
          <QueryEditor
            playgroundId={selectedPlayground.id}
            onExecuteQuery={handleExecuteQuery}
            isLoading={isLoading}
            result={queryResult}
            error={queryError}
          />
          
          <QueryHistory
            playgroundId={selectedPlayground.id}
            onSelectQuery={handleSelectQuery}
            refreshTrigger={historyRefresh}
          />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-12 bg-slate-900 border-slate-700 text-center">
            <Database className="w-16 h-16 mx-auto mb-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Welcome to SQL Playground
            </h2>
            <p className="text-slate-400 mb-6 max-w-md">
              Create your first playground to start writing and executing SQL queries. 
              You'll have access to sample tables with employee and department data.
            </p>
            <div className="text-sm text-slate-500">
              <p>Available sample tables:</p>
              <div className="flex justify-center gap-2 mt-2">
                <span className="bg-slate-800 px-2 py-1 rounded">employees</span>
                <span className="bg-slate-800 px-2 py-1 rounded">departments</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}