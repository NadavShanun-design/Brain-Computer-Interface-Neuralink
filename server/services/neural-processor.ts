import { RealtimeNeuralData, CursorUpdate } from "@shared/schema";
import { SignalGenerator } from "./signal-generator";

export class NeuralProcessor {
  private signalGenerator = new SignalGenerator();
  private cursorPosition = { x: 512, y: 384 };
  private sensitivity = 1.0;
  private smoothingFactor = 0.7;
  private previousMovement = { x: 0, y: 0 };
  
  // Target positions for distance calculation
  private targetPositions = {
    '1': { x: 150, y: 150 },
    '2': { x: 850, y: 150 },
    '3': { x: 150, y: 650 },
    '4': { x: 850, y: 650 },
    'center': { x: 512, y: 384 },
  };

  generateNeuralData(): RealtimeNeuralData {
    return this.signalGenerator.generateRealtimeData();
  }

  processCursorMovement(neuralData: RealtimeNeuralData): CursorUpdate {
    // Extract movement intention from neural signals
    const { deltaX, deltaY } = this.decodeMovementIntention(neuralData);
    
    // Apply smoothing to reduce jitter
    const smoothedDeltaX = this.smoothingFactor * this.previousMovement.x + (1 - this.smoothingFactor) * deltaX;
    const smoothedDeltaY = this.smoothingFactor * this.previousMovement.y + (1 - this.smoothingFactor) * deltaY;
    
    this.previousMovement = { x: smoothedDeltaX, y: smoothedDeltaY };
    
    // Update cursor position
    this.cursorPosition.x = Math.max(50, Math.min(950, this.cursorPosition.x + smoothedDeltaX));
    this.cursorPosition.y = Math.max(50, Math.min(650, this.cursorPosition.y + smoothedDeltaY));
    
    // Calculate target proximity
    const { targetDistance, activeTarget } = this.calculateTargetProximity();
    
    return {
      x: this.cursorPosition.x,
      y: this.cursorPosition.y,
      targetDistance,
      activeTarget,
      timestamp: Date.now(),
    };
  }

  private decodeMovementIntention(neuralData: RealtimeNeuralData): { deltaX: number; deltaY: number } {
    const { c3Power, c4Power, classification, confidence } = neuralData;
    
    // Base movement calculation on classification confidence
    const movementStrength = confidence * this.sensitivity;
    
    let deltaX = 0;
    let deltaY = 0;
    
    switch (classification) {
      case 'left':
        deltaX = -2 * movementStrength;
        break;
      case 'right':
        deltaX = 2 * movementStrength;
        break;
      case 'rest':
        // Small random movement to simulate natural cursor drift
        deltaX = (Math.random() - 0.5) * 0.5;
        deltaY = (Math.random() - 0.5) * 0.5;
        break;
    }
    
    // Add vertical movement based on alpha/beta ratio
    const alphaBetaRatio = neuralData.alphaPower / neuralData.betaPower;
    if (alphaBetaRatio < 1.0) {
      deltaY = -0.5 * movementStrength; // Move up when focused
    } else if (alphaBetaRatio > 1.8) {
      deltaY = 0.5 * movementStrength; // Move down when relaxed
    }
    
    return { deltaX, deltaY };
  }

  private calculateTargetProximity(): { targetDistance: number; activeTarget?: string } {
    let minDistance = Infinity;
    let closestTarget: string | undefined;
    
    Object.entries(this.targetPositions).forEach(([targetId, position]) => {
      const distance = Math.sqrt(
        Math.pow(this.cursorPosition.x - position.x, 2) + 
        Math.pow(this.cursorPosition.y - position.y, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestTarget = targetId;
      }
    });
    
    const activationThreshold = 60;
    return {
      targetDistance: minDistance,
      activeTarget: minDistance < activationThreshold ? closestTarget : undefined,
    };
  }

  setSensitivity(sensitivity: number) {
    this.sensitivity = Math.max(0.1, Math.min(2.0, sensitivity));
  }

  setSmoothingFactor(smoothing: number) {
    this.smoothingFactor = Math.max(0.1, Math.min(0.9, smoothing / 10));
  }

  resetCursorPosition() {
    this.cursorPosition = { x: 512, y: 384 };
  }
}
