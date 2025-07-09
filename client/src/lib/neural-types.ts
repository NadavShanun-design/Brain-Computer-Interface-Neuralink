export interface NeuralData {
  c3Power: number;
  c4Power: number;
  alphaPower: number;
  betaPower: number;
  gammaPower: number;
  thetaPower: number;
  classification: 'left' | 'right' | 'rest';
  confidence: number;
  timestamp: number;
}

export interface CursorPosition {
  x: number;
  y: number;
  targetDistance?: number;
  activeTarget?: string;
  timestamp: number;
}

export interface TargetPosition {
  x: number;
  y: number;
  id: string;
  color: string;
  label: string;
}

export interface PerformanceMetrics {
  successfulTargets: number;
  totalAttempts: number;
  successRate: number;
  averageResponseTime: number;
  informationTransferRate: number;
}

export interface SystemStatus {
  brainflowConnected: boolean;
  mneProcessing: boolean;
  mlModelReady: boolean;
  dataRate: number;
  signalQuality: number;
}
