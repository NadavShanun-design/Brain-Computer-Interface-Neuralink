import { useEffect, useRef, useState } from 'react';
import { NeuralData, CursorPosition } from '@/lib/neural-types';

interface WebSocketData {
  type: string;
  data?: {
    neural: NeuralData;
    cursor: CursorPosition;
  };
  sessionId?: number;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [neuralData, setNeuralData] = useState<NeuralData | null>(null);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const connect = () => {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected');
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data: WebSocketData = JSON.parse(event.data);
          
          if (data.type === 'neural_data' && data.data) {
            setNeuralData(data.data.neural);
            setCursorPosition(data.data.cursor);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
        
        // Attempt to reconnect after 3 seconds
        setTimeout(connect, 3000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    };
    
    connect();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendMessage = (message: object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const startSession = (sessionId: number) => {
    sendMessage({
      type: 'start_session',
      sessionId,
    });
  };

  const updateSettings = (sensitivity: number, smoothing: number) => {
    sendMessage({
      type: 'update_settings',
      sensitivity,
      smoothing,
    });
  };

  const recordTargetInteraction = (targetId: string, eventType: 'hit' | 'miss' | 'timeout', responseTime: number, accuracy: number) => {
    sendMessage({
      type: 'target_interaction',
      sessionId: 1, // Default session ID
      targetId,
      eventType,
      responseTime,
      accuracy,
    });
  };

  return {
    isConnected,
    neuralData,
    cursorPosition,
    startSession,
    updateSettings,
    recordTargetInteraction,
  };
}
