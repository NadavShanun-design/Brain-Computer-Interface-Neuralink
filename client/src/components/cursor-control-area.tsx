import { useEffect, useRef, useState } from 'react';
import { CursorPosition, TargetPosition, NeuralData } from '@/lib/neural-types';
import { cn } from '@/lib/utils';

interface CursorControlAreaProps {
  cursorPosition: CursorPosition | null;
  neuralData: NeuralData | null;
  onTargetInteraction: (targetId: string, eventType: 'hit' | 'miss' | 'timeout', responseTime: number, accuracy: number) => void;
  onSettingsChange: (sensitivity: number, smoothing: number) => void;
}

export function CursorControlArea({ 
  cursorPosition, 
  neuralData, 
  onTargetInteraction, 
  onSettingsChange 
}: CursorControlAreaProps) {
  const [sensitivity, setSensitivity] = useState(1.0);
  const [smoothing, setSmoothing] = useState(5);
  const [controlMode, setControlMode] = useState('training');
  const [activeTarget, setActiveTarget] = useState<string | null>(null);
  const [targetHitStartTime, setTargetHitStartTime] = useState<number | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const targets: TargetPosition[] = [
    { id: '1', x: 150, y: 150, color: 'from-blue-500 to-blue-600', label: '1' },
    { id: '2', x: 850, y: 150, color: 'from-orange-500 to-orange-600', label: '2' },
    { id: '3', x: 150, y: 650, color: 'from-green-500 to-green-600', label: '3' },
    { id: '4', x: 850, y: 650, color: 'from-purple-500 to-purple-600', label: '4' },
    { id: 'center', x: 512, y: 384, color: 'from-yellow-500 to-yellow-600', label: '🎯' },
  ];

  // Handle settings changes
  useEffect(() => {
    onSettingsChange(sensitivity, smoothing);
  }, [sensitivity, smoothing, onSettingsChange]);

  // Handle target activation
  useEffect(() => {
    if (cursorPosition?.activeTarget && cursorPosition.activeTarget !== activeTarget) {
      setActiveTarget(cursorPosition.activeTarget);
      setTargetHitStartTime(Date.now());
    } else if (!cursorPosition?.activeTarget && activeTarget) {
      // Target deactivated - record miss if it was active for more than 100ms
      if (targetHitStartTime && Date.now() - targetHitStartTime > 100) {
        const responseTime = Date.now() - targetHitStartTime;
        onTargetInteraction(activeTarget, 'miss', responseTime, 0.5);
      }
      setActiveTarget(null);
      setTargetHitStartTime(null);
    }
  }, [cursorPosition?.activeTarget, activeTarget, targetHitStartTime, onTargetInteraction]);

  // Handle target hits (after 500ms of continuous activation)
  useEffect(() => {
    if (activeTarget && targetHitStartTime) {
      const timeout = setTimeout(() => {
        const responseTime = Date.now() - targetHitStartTime;
        const accuracy = cursorPosition?.targetDistance ? 
          Math.max(0, 1 - (cursorPosition.targetDistance / 60)) : 0.8;
        onTargetInteraction(activeTarget, 'hit', responseTime, accuracy);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [activeTarget, targetHitStartTime, cursorPosition?.targetDistance, onTargetInteraction]);

  return (
    <div className="flex-1 bg-slate-900 p-6 flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Cursor Control Training</h2>
        <p className="text-sm text-gray-400">Focus on the target circles and imagine moving your cursor towards them</p>
      </div>
      
      {/* Main Control Area */}
      <div 
        ref={containerRef}
        className="flex-1 bg-slate-800 rounded-lg border border-slate-700 relative overflow-hidden"
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#404040" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Target Circles */}
        {targets.map((target) => (
          <div
            key={target.id}
            className={cn(
              "absolute w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 text-white font-semibold",
              `bg-gradient-to-br ${target.color}`,
              activeTarget === target.id && "shadow-[0_0_30px_rgba(0,204,136,0.8)] scale-110",
              activeTarget !== target.id && "hover:shadow-[0_0_20px_rgba(0,102,255,0.6)]"
            )}
            style={{
              left: target.x - 32,
              top: target.y - 32,
            }}
          >
            {target.label}
          </div>
        ))}
        
        {/* Neural Cursor */}
        {cursorPosition && (
          <div
            className="absolute w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-[0_0_15px_rgba(0,102,255,0.7)] transition-all duration-200 z-10"
            style={{
              left: cursorPosition.x - 12,
              top: cursorPosition.y - 12,
              transform: activeTarget ? 'scale(1.2)' : 'scale(1)',
            }}
          />
        )}
        
        {/* Status Overlay */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg p-3 font-mono text-xs">
          <div className="text-gray-300">
            <div>
              Cursor Position: <span className="text-blue-400">
                {cursorPosition ? `${Math.round(cursorPosition.x)}, ${Math.round(cursorPosition.y)}` : '512, 384'}
              </span>
            </div>
            <div>
              Target Distance: <span className="text-green-400">
                {cursorPosition?.targetDistance ? `${Math.round(cursorPosition.targetDistance)}px` : '--'}
              </span>
            </div>
            <div>
              Classification: <span className="text-orange-400">
                {neuralData?.classification || 'Idle'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Control Panel */}
      <div className="mt-4 bg-slate-800 rounded-lg border border-slate-700 p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Sensitivity</label>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={sensitivity}
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-xs text-gray-400 text-center">
              {sensitivity.toFixed(1)}x
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Smoothing</label>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={smoothing}
              onChange={(e) => setSmoothing(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-xs text-gray-400 text-center">
              {smoothing}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Mode</label>
            <select
              value={controlMode}
              onChange={(e) => setControlMode(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            >
              <option value="training">Training Mode</option>
              <option value="calibration">Calibration</option>
              <option value="free-control">Free Control</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
