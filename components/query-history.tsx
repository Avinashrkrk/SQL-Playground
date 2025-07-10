'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Copy,
  RotateCcw,
  History
} from 'lucide-react';
import { Query } from '@/lib/db';

interface QueryHistoryProps {
  playgroundId: string;
  onSelectQuery: (query: string) => void;
  refreshTrigger: number;
}

export function QueryHistory({ 
  playgroundId, 
  onSelectQuery, 
  refreshTrigger 
}: QueryHistoryProps) {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueries();
  }, [playgroundId, refreshTrigger]);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/playgrounds/${playgroundId}/queries`);
      if (response.ok) {
        const data = await response.json();
        setQueries(data);
      }
    } catch (error) {
      console.error('Failed to fetch queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatQuery = (query: string) => {
    return query.length > 100 ? query.substring(0, 100) + '...' : query;
  };

  if (loading) {
    return (
      <div className="w-80 bg-slate-900 border-l border-slate-700 p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-800 rounded w-3/4"></div>
          <div className="h-20 bg-slate-800 rounded"></div>
          <div className="h-20 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col h-screen">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Query History</h2>
        </div>
        <div className="text-xs text-slate-400">
          Recent queries for this playground
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {queries.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No queries yet</p>
            <p className="text-sm">Execute your first query to see it here</p>
          </div>
        ) : (
          queries.map((query) => (
            <Card
              key={query.id}
              className={`p-3 cursor-pointer transition-all duration-200 hover:bg-slate-800 ${
                query.status === 'success' 
                  ? 'bg-slate-800 border-slate-600' 
                  : 'bg-red-900/20 border-red-500/30'
              }`}
              onClick={() => onSelectQuery(query.query)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {query.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  )}
                  <Badge 
                    variant={query.status === 'success' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {query.status}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(query.query);
                    }}
                    size="sm"
                    variant="ghost"
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectQuery(query.query);
                    }}
                    size="sm"
                    variant="ghost"
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="text-sm text-white font-mono mb-3 bg-slate-950 p-2 rounded">
                {formatQuery(query.query)}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                {formatDate(query.executed_at)}
              </div>

              {query.status === 'error' && (
                <div className="mt-2 text-xs text-red-300 bg-red-900/30 p-2 rounded">
                  {query.result}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}