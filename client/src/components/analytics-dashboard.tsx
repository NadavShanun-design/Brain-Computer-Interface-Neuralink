import { useState, useEffect } from 'react';
import { NeuralData, PerformanceMetrics, SystemStatus } from '@/lib/neural-types';
import { NeuralSignalChart } from './neural-signal-chart';
import { Brain, TrendingUp, Settings, Activity } from 'lucide-react';

interface AnalyticsDashboardProps {
  neuralData: NeuralData | null;
  isConnected: boolean;
}

export function AnalyticsDashboard({ neuralData, isConnected }: AnalyticsDashboardProps) {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    successfulTargets: 0,
    totalAttempts: 0,
    successRate: 0,
    averageResponseTime: 0,
    informationTransferRate: 0,
  });

  const [recentActivity, setRecentActivity] = useState<Array<{
    target: string;
    type: 'hit' | 'miss';
    time: string;
  }>>([]);

  // Simulate performance metrics updates
  useEffect(() => {
    if (neuralData) {
      const interval = setInterval(() => {
        setPerformanceMetrics(prev => {
          const newHits = prev.successfulTargets + (Math.random() > 0.7 ? 1 : 0);
          const newTotal = prev.totalAttempts + (Math.random() > 0.5 ? 1 : 0);
          return {
            successfulTargets: newHits,
            totalAttempts: newTotal,
            successRate: newTotal > 0 ? (newHits / newTotal) * 100 : 0,
            averageResponseTime: 1000 + Math.random() * 500,
            informationTransferRate: 12 + Math.random() * 8,
          };
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [neuralData]);

  const systemStatus: SystemStatus = {
    brainflowConnected: isConnected,
    mneProcessing: isConnected,
    mlModelReady: isConnected,
    dataRate: 500,
    signalQuality: neuralData ? 85 + Math.random() * 10 : 0,
  };

  return (
    <div className="w-1/3 bg-slate-800 border-l border-slate-700 p-6 space-y-6 overflow-y-auto">
      {/* Neural Signal Analysis */}
      <div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="mr-2 text-blue-400" size={20} />
          Neural Signal Analysis
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Motor Cortex (C3/C4)</span>
            <span className={`${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <NeuralSignalChart data={neuralData} />
          
          {/* Band Power Analysis */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-slate-800 rounded p-3">
              <div className="text-xs text-gray-400">Alpha (8-12 Hz)</div>
              <div className="text-lg font-semibold text-blue-400">
                {neuralData?.alphaPower.toFixed(0) || 0}%
              </div>
            </div>
            <div className="bg-slate-800 rounded p-3">
              <div className="text-xs text-gray-400">Beta (13-30 Hz)</div>
              <div className="text-lg font-semibold text-green-400">
                {neuralData?.betaPower.toFixed(0) || 0}%
              </div>
            </div>
            <div className="bg-slate-800 rounded p-3">
              <div className="text-xs text-gray-400">Gamma (30-100 Hz)</div>
              <div className="text-lg font-semibold text-orange-400">
                {neuralData?.gammaPower.toFixed(0) || 0}%
              </div>
            </div>
            <div className="bg-slate-800 rounded p-3">
              <div className="text-xs text-gray-400">Theta (4-8 Hz)</div>
              <div className="text-lg font-semibold text-purple-400">
                {neuralData?.thetaPower.toFixed(0) || 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ML Classification */}
      <div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Brain className="mr-2 text-green-400" size={20} />
          ML Classification
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Model Confidence</span>
            <span className="text-green-400 font-semibold">
              {neuralData ? `${(neuralData.confidence * 100).toFixed(1)}%` : '0%'}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Left Hand Imagery</span>
              <span className="text-blue-400">
                {neuralData?.classification === 'left' ? `${(neuralData.confidence * 100).toFixed(0)}%` : '0%'}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1">
              <div 
                className="bg-blue-400 h-1 rounded-full transition-all duration-300" 
                style={{ width: `${neuralData?.classification === 'left' ? neuralData.confidence * 100 : 0}%` }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Right Hand Imagery</span>
              <span className="text-orange-400">
                {neuralData?.classification === 'right' ? `${(neuralData.confidence * 100).toFixed(0)}%` : '0%'}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1">
              <div 
                className="bg-orange-400 h-1 rounded-full transition-all duration-300" 
                style={{ width: `${neuralData?.classification === 'right' ? neuralData.confidence * 100 : 0}%` }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Rest State</span>
              <span className="text-gray-400">
                {neuralData?.classification === 'rest' ? `${(neuralData.confidence * 100).toFixed(0)}%` : '0%'}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1">
              <div 
                className="bg-gray-400 h-1 rounded-full transition-all duration-300" 
                style={{ width: `${neuralData?.classification === 'rest' ? neuralData.confidence * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Feature Importance */}
        <div className="mt-4 pt-4 border-t border-slate-700">
          <h4 className="text-sm font-medium mb-2">Feature Importance</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>C3 Alpha Power</span>
              <span className="text-blue-400">0.34</span>
            </div>
            <div className="flex justify-between">
              <span>C4 Beta Power</span>
              <span className="text-green-400">0.28</span>
            </div>
            <div className="flex justify-between">
              <span>CSP Filter 1</span>
              <span className="text-orange-400">0.22</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="mr-2 text-orange-400" size={20} />
          Performance Metrics
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {performanceMetrics.successfulTargets}
            </div>
            <div className="text-xs text-gray-400">Successful Targets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {performanceMetrics.successRate.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-400">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {performanceMetrics.averageResponseTime.toFixed(1)}ms
            </div>
            <div className="text-xs text-gray-400">Avg Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {performanceMetrics.informationTransferRate.toFixed(0)}
            </div>
            <div className="text-xs text-gray-400">Bits/min ITR</div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="mt-4 pt-4 border-t border-slate-700">
          <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span>Target 1 Hit</span>
              <span className="text-green-400">+1.2s</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Target 3 Hit</span>
              <span className="text-green-400">+0.8s</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Target 2 Miss</span>
              <span className="text-red-400">Timeout</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Target 4 Hit</span>
              <span className="text-green-400">+1.1s</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Settings className="mr-2 text-gray-400" size={20} />
          System Status
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">BrainFlow Connection</span>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${systemStatus.brainflowConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className={`text-xs ${systemStatus.brainflowConnected ? 'text-green-400' : 'text-red-400'}`}>
                {systemStatus.brainflowConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">MNE Processing</span>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${systemStatus.mneProcessing ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className={`text-xs ${systemStatus.mneProcessing ? 'text-green-400' : 'text-red-400'}`}>
                {systemStatus.mneProcessing ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">ML Model</span>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${systemStatus.mlModelReady ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className={`text-xs ${systemStatus.mlModelReady ? 'text-green-400' : 'text-red-400'}`}>
                {systemStatus.mlModelReady ? 'Ready' : 'Not Ready'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Data Rate</span>
            <span className="text-xs text-gray-400">{systemStatus.dataRate} Hz</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Signal Quality</span>
            <span className="text-xs text-gray-400">{systemStatus.signalQuality.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
