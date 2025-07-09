import { RealtimeNeuralData } from "@shared/schema";

export class SignalGenerator {
  private time = 0;
  private motorImageryState: 'left' | 'right' | 'rest' = 'rest';
  private stateChangeTime = 0;
  private stateDuration = 0;

  generateRealtimeData(): RealtimeNeuralData {
    this.time += 0.1; // Simulate 100ms intervals
    
    // Simulate state changes (motor imagery periods)
    if (this.time - this.stateChangeTime > this.stateDuration) {
      this.changeState();
    }

    // Generate EEG signal components based on current state
    const { c3Power, c4Power } = this.generateMotorCortexSignals();
    const { alphaPower, betaPower, gammaPower, thetaPower } = this.generateBandPowers();
    
    // Classify current state based on signal patterns
    const { classification, confidence } = this.classifySignal(c3Power, c4Power, alphaPower, betaPower);

    return {
      c3Power,
      c4Power,
      alphaPower,
      betaPower,
      gammaPower,
      thetaPower,
      classification,
      confidence,
      timestamp: Date.now(),
    };
  }

  private changeState() {
    const states: Array<'left' | 'right' | 'rest'> = ['left', 'right', 'rest'];
    const weights = [0.3, 0.3, 0.4]; // Slightly favor rest state
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < states.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        this.motorImageryState = states[i];
        break;
      }
    }
    
    this.stateChangeTime = this.time;
    this.stateDuration = 2 + Math.random() * 3; // 2-5 seconds
  }

  private generateMotorCortexSignals(): { c3Power: number; c4Power: number } {
    const baseFreq = 0.3;
    const noiseLevel = 0.2;
    
    // Base signals with noise
    let c3Power = 50 + 30 * Math.sin(2 * Math.PI * baseFreq * this.time) + 
                      20 * Math.sin(2 * Math.PI * baseFreq * 2 * this.time) +
                      (Math.random() - 0.5) * noiseLevel * 100;
    
    let c4Power = 50 + 25 * Math.sin(2 * Math.PI * baseFreq * this.time + Math.PI/4) + 
                      18 * Math.sin(2 * Math.PI * baseFreq * 2 * this.time + Math.PI/3) +
                      (Math.random() - 0.5) * noiseLevel * 100;

    // Modify signals based on motor imagery state
    switch (this.motorImageryState) {
      case 'left':
        c4Power += 20; // Right motor cortex more active for left hand imagery
        c3Power -= 10;
        break;
      case 'right':
        c3Power += 20; // Left motor cortex more active for right hand imagery
        c4Power -= 10;
        break;
      case 'rest':
        // No modification for rest state
        break;
    }

    return {
      c3Power: Math.max(0, Math.min(100, c3Power)),
      c4Power: Math.max(0, Math.min(100, c4Power)),
    };
  }

  private generateBandPowers(): { alphaPower: number; betaPower: number; gammaPower: number; thetaPower: number } {
    const baseTime = this.time * 0.1;
    
    // Alpha band (8-12 Hz) - typically decreases during motor imagery
    let alphaPower = 60 + 20 * Math.sin(2 * Math.PI * 0.1 * baseTime) + 
                     (Math.random() - 0.5) * 20;
    
    // Beta band (13-30 Hz) - increases during motor imagery
    let betaPower = 40 + 15 * Math.sin(2 * Math.PI * 0.15 * baseTime) + 
                    (Math.random() - 0.5) * 15;
    
    // Gamma band (30-100 Hz) - increases during focused attention
    let gammaPower = 30 + 10 * Math.sin(2 * Math.PI * 0.2 * baseTime) + 
                     (Math.random() - 0.5) * 10;
    
    // Theta band (4-8 Hz) - varies with cognitive load
    let thetaPower = 35 + 12 * Math.sin(2 * Math.PI * 0.05 * baseTime) + 
                     (Math.random() - 0.5) * 12;

    // Modify based on motor imagery state
    if (this.motorImageryState !== 'rest') {
      alphaPower -= 10; // Alpha desynchronization
      betaPower += 15; // Beta synchronization
      gammaPower += 8; // Increased gamma activity
    }

    return {
      alphaPower: Math.max(0, Math.min(100, alphaPower)),
      betaPower: Math.max(0, Math.min(100, betaPower)),
      gammaPower: Math.max(0, Math.min(100, gammaPower)),
      thetaPower: Math.max(0, Math.min(100, thetaPower)),
    };
  }

  private classifySignal(c3Power: number, c4Power: number, alphaPower: number, betaPower: number): { classification: 'left' | 'right' | 'rest'; confidence: number } {
    // Simplified classification based on motor cortex power difference
    const powerDifference = c3Power - c4Power;
    const threshold = 8;
    
    // Consider alpha/beta ratio for confidence
    const alphaBetaRatio = alphaPower / betaPower;
    const baseConfidence = 0.6;
    const confidenceBoost = Math.min(0.3, Math.abs(powerDifference) / 20);
    
    let classification: 'left' | 'right' | 'rest';
    let confidence: number;
    
    if (Math.abs(powerDifference) < threshold) {
      classification = 'rest';
      confidence = baseConfidence - confidenceBoost;
    } else if (powerDifference > threshold) {
      classification = 'right'; // Left motor cortex active -> right hand imagery
      confidence = baseConfidence + confidenceBoost;
    } else {
      classification = 'left'; // Right motor cortex active -> left hand imagery
      confidence = baseConfidence + confidenceBoost;
    }
    
    // Adjust confidence based on alpha/beta ratio (lower ratio = more focused)
    if (alphaBetaRatio < 1.2) {
      confidence = Math.min(0.95, confidence + 0.1);
    }
    
    return {
      classification,
      confidence: Math.max(0.1, Math.min(0.95, confidence)),
    };
  }
}
