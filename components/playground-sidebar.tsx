'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Database,
  Clock,
  Search
} from 'lucide-react';
import { Playground } from '@/lib/db';

interface PlaygroundSidebarProps {
  playgrounds: Playground[];
  selectedPlayground: Playground | null;
  onSelectPlayground: (playground: Playground) => void;
  onCreatePlayground: (name: string) => void;
  onUpdatePlayground: (id: string, name: string) => void;
  onDeletePlayground: (id: string) => void;
  onRefresh: () => void;
}

export function PlaygroundSidebar({
  playgrounds,
  selectedPlayground,
  onSelectPlayground,
  onCreatePlayground,
  onUpdatePlayground,
  onDeletePlayground,
  onRefresh
}: PlaygroundSidebarProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlaygrounds = playgrounds.filter(playground =>
    playground.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    if (newName.trim()) {
      onCreatePlayground(newName.trim());
      setNewName('');
      setIsCreating(false);
    }
  };

  const handleUpdate = (id: string) => {
    if (editName.trim()) {
      onUpdatePlayground(id, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  const startEditing = (playground: Playground) => {
    setEditingId(playground.id);
    setEditName(playground.name);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCreating(false);
        setEditingId(null);
        setEditName('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-80 bg-slate-900 border-r border-slate-700 flex flex-col h-screen">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">SQL Playgrounds</h2>
          </div>
          <Button
            onClick={() => setIsCreating(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search playgrounds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isCreating && (
          <Card className="p-3 bg-slate-800 border-slate-600">
            <Input
              placeholder="Enter playground name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="mb-2 bg-slate-700 border-slate-600 text-white"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                Create
              </Button>
              <Button
                onClick={() => setIsCreating(false)}
                size="sm"
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {filteredPlaygrounds.map((playground) => (
          <Card
            key={playground.id}
            className={`p-3 cursor-pointer transition-all duration-200 ${
              selectedPlayground?.id === playground.id
                ? 'bg-blue-600 border-blue-500'
                : 'bg-slate-800 border-slate-600 hover:bg-slate-700'
            }`}
            onClick={() => onSelectPlayground(playground)}
          >
            {editingId === playground.id ? (
              <div className="space-y-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdate(playground.id)}
                  className="bg-slate-700 border-slate-600 text-white"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleUpdate(playground.id)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => setEditingId(null)}
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white truncate">{playground.name}</h3>
                  <div className="flex gap-1">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(playground);
                      }}
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePlayground(playground.id);
                      }}
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {formatDate(playground.updated_at)}
                </div>
              </div>
            )}
          </Card>
        ))}

        {filteredPlaygrounds.length === 0 && !isCreating && (
          <div className="text-center py-8 text-slate-400">
            <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No playgrounds found</p>
            <p className="text-sm">Create your first playground to get started</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-400 space-y-1">
          <div>Sample tables available:</div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">employees</Badge>
            <Badge variant="outline" className="text-xs">departments</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}