import { useState, useEffect } from 'react';
import { CursorControlArea } from '@/components/cursor-control-area';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { useWebSocket } from '@/hooks/use-websocket';
import { Brain, Wifi, WifiOff } from 'lucide-react';

export default function BCIInterface() {
  const [sessionTime, setSessionTime] = useState(0);
  const [signalQuality, setSignalQuality] = useState(94);
  
  const {
    isConnected,
    neuralData,
    cursorPosition,
    startSession,
    updateSettings,
    recordTargetInteraction,
  } = useWebSocket();

  // Update session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update signal quality simulation
  useEffect(() => {
    if (isConnected && neuralData) {
      const interval = setInterval(() => {
        setSignalQuality(prev => {
          const variation = (Math.random() - 0.5) * 6;
          return Math.max(85, Math.min(100, prev + variation));
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isConnected, neuralData]);

  // Start session when connected
  useEffect(() => {
    if (isConnected) {
      startSession(1);
    }
  }, [isConnected, startSession]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <Brain className="text-white" size={16} />
            </div>
            <h1 className="text-xl font-semibold">NeuroLink BCI Interface</h1>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              isConnected 
                ? 'bg-green-500 text-black' 
                : 'bg-red-500 text-white'
            }`}>
              {isConnected ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="text-green-400" size={16} />
              ) : (
                <WifiOff className="text-red-400" size={16} />
              )}
              <span className="text-sm text-gray-400">
                Signal Quality: {signalQuality.toFixed(0)}%
              </span>
            </div>
            <div className="text-sm text-gray-400">
              <span className="font-mono">Session: {formatTime(sessionTime)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Interface */}
      <div className="flex h-[calc(100vh-80px)]">
        <CursorControlArea
          cursorPosition={cursorPosition}
          neuralData={neuralData}
          onTargetInteraction={recordTargetInteraction}
          onSettingsChange={updateSettings}
        />
        
        <AnalyticsDashboard
          neuralData={neuralData}
          isConnected={isConnected}
        />
      </div>
    </div>
  );
}
