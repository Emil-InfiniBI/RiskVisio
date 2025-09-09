import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocationNode } from '@/lib/occurrence-options';

interface HierarchicalLocationSelectorProps {
  locations: LocationNode[];
  onLocationsChange: (locations: LocationNode[]) => void;
  selectedLocation?: string;
  onLocationSelect?: (locationId: string, fullPath: string) => void;
  mode?: 'select' | 'admin';
}

export const HierarchicalLocationSelector: React.FC<HierarchicalLocationSelectorProps> = ({
  locations,
  onLocationsChange,
  selectedLocation,
  onLocationSelect,
  mode = 'select'
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['baettr-main']));
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [newNodeLabel, setNewNodeLabel] = useState('');

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const addChildNode = (parentId: string) => {
    if (!newNodeLabel.trim()) return;

    const addToNode = (nodes: LocationNode[]): LocationNode[] => {
      return nodes.map(node => {
        if (node.id === parentId) {
          const newChild: LocationNode = {
            id: `${parentId}-${Date.now()}`,
            label: newNodeLabel.trim(),
          };
          return {
            ...node,
            children: [...(node.children || []), newChild]
          };
        }
        if (node.children) {
          return { ...node, children: addToNode(node.children) };
        }
        return node;
      });
    };

    onLocationsChange(addToNode(locations));
    setNewNodeLabel('');
    setEditingNode(null);
    
    // Expand parent to show new child
    setExpandedNodes(prev => new Set([...prev, parentId]));
  };

  const removeNode = (nodeId: string) => {
    const removeFromNodes = (nodes: LocationNode[]): LocationNode[] => {
      return nodes
        .filter(node => node.id !== nodeId)
        .map(node => ({
          ...node,
          children: node.children ? removeFromNodes(node.children) : undefined
        }));
    };

    onLocationsChange(removeFromNodes(locations));
  };

  const updateNodeLabel = (nodeId: string, newLabel: string) => {
    const updateInNodes = (nodes: LocationNode[]): LocationNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, label: newLabel };
        }
        if (node.children) {
          return { ...node, children: updateInNodes(node.children) };
        }
        return node;
      });
    };

    onLocationsChange(updateInNodes(locations));
  };

  const getFullPath = (targetId: string, nodes: LocationNode[] = locations, path: string[] = []): string => {
    for (const node of nodes) {
      const currentPath = [...path, node.label];
      if (node.id === targetId) {
        return currentPath.join(' > ');
      }
      if (node.children) {
        const result = getFullPath(targetId, node.children, currentPath);
        if (result) return result;
      }
    }
    return '';
  };

  const renderNode = (node: LocationNode, level: number = 0): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedLocation === node.id;

    return (
      <div key={node.id} className="select-none">
        <div 
          className={`flex items-center py-1 px-2 hover:bg-muted/50 rounded cursor-pointer ${
            isSelected ? 'bg-primary/10 border border-primary/20' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {/* Expand/Collapse button */}
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 mr-1"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node.id);
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </Button>
          ) : (
            <div className="w-7" /> // Spacer for alignment
          )}

          {/* Node label */}
          <div 
            className="flex-1 text-sm py-1"
            onClick={() => {
              if (mode === 'select' && onLocationSelect) {
                onLocationSelect(node.id, getFullPath(node.id));
              }
            }}
          >
            {node.label}
            {mode === 'select' && isSelected && (
              <span className="ml-2 text-xs text-primary">✓</span>
            )}
          </div>

          {/* Admin controls */}
          {mode === 'admin' && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingNode(node.id);
                }}
              >
                +
              </Button>
              {level > 0 && ( // Don't allow removing root nodes
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNode(node.id);
                  }}
                >
                  -
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Add child form */}
        {mode === 'admin' && editingNode === node.id && (
          <div className="ml-6 mt-1 mb-2 p-2 border rounded bg-muted/30">
            <Label className="text-xs">Add child location</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newNodeLabel}
                onChange={(e) => setNewNodeLabel(e.target.value)}
                placeholder="New location name"
                className="h-8"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addChildNode(node.id);
                  }
                }}
              />
              <Button 
                size="sm"
                onClick={() => addChildNode(node.id)}
                disabled={!newNodeLabel.trim()}
              >
                Add
              </Button>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingNode(null);
                  setNewNodeLabel('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border rounded-md max-h-96 overflow-y-auto">
      {locations.map(node => renderNode(node))}
    </div>
  );
};
