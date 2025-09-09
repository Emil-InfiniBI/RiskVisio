import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface ConnectionStatusProps {
  onRetry?: () => void;
}

export function ConnectionStatus({ onRetry }: ConnectionStatusProps) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const checkConnection = async () => {
    setStatus('checking');
    try {
      const response = await fetch('/api/health', { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setStatus('disconnected');
    } finally {
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkConnection();
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRetry = () => {
    checkConnection();
    onRetry?.();
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'checking':
        return (
          <Badge variant="secondary" className="animate-pulse">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Checking...
          </Badge>
        );
      case 'connected':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Disconnected
          </Badge>
        );
    }
  };

  return (
    <div className="flex items-center gap-2">
      {getStatusBadge()}
      {status === 'disconnected' && (
        <Button variant="outline" size="sm" onClick={handleRetry}>
          <RefreshCw className="w-3 h-3 mr-1" />
          Retry
        </Button>
      )}
      <span className="text-xs text-muted-foreground">
        Last check: {lastCheck.toLocaleTimeString()}
      </span>
    </div>
  );
}
