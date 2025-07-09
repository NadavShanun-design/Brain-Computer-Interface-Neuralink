import { useEffect, useRef } from 'react';
import { NeuralData } from '@/lib/neural-types';

interface NeuralSignalChartProps {
  data: NeuralData | null;
  width?: number;
  height?: number;
}

export function NeuralSignalChart({ data, width = 400, height = 120 }: NeuralSignalChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataHistoryRef = useRef<{ c3: number[]; c4: number[] }>({
    c3: [],
    c4: [],
  });

  useEffect(() => {
    if (!data || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Add new data point
    dataHistoryRef.current.c3.push(data.c3Power);
    dataHistoryRef.current.c4.push(data.c4Power);

    // Keep only last 100 points
    const maxPoints = 100;
    if (dataHistoryRef.current.c3.length > maxPoints) {
      dataHistoryRef.current.c3.shift();
      dataHistoryRef.current.c4.shift();
    }

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // Horizontal grid lines
    for (let y = 0; y <= height; y += height / 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Vertical grid lines
    for (let x = 0; x <= width; x += width / 10) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Draw signals
    const drawSignal = (dataPoints: number[], color: string) => {
      if (dataPoints.length < 2) return;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      const xStep = width / (maxPoints - 1);
      const yScale = height / 100; // Assuming 0-100 range

      dataPoints.forEach((point, index) => {
        const x = index * xStep;
        const y = height - (point * yScale);

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    };

    // Draw C3 signal (blue)
    drawSignal(dataHistoryRef.current.c3, '#0066FF');
    
    // Draw C4 signal (green)
    drawSignal(dataHistoryRef.current.c4, '#00CC88');

    // Draw current values
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Inter';
    ctx.fillText(`C3: ${data.c3Power.toFixed(1)}%`, 10, 20);
    ctx.fillText(`C4: ${data.c4Power.toFixed(1)}%`, 10, 35);
    
    // Draw frequency info
    ctx.fillStyle = '#0066FF';
    ctx.font = '10px Inter';
    ctx.fillText('8-12 Hz', width - 60, 20);
    
    ctx.fillStyle = '#00CC88';
    ctx.fillText('-45 dB', width - 60, 35);

  }, [data, width, height]);

  return (
    <div className="bg-black rounded overflow-hidden relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full"
      />
    </div>
  );
}
