'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ClickLog } from '@/types';

interface HeatmapCanvasProps {
  clickData: ClickLog[];
  width: number;
  height: number;
  intensity?: number;
  radius?: number;
  opacity?: number;
  gradient?: string[];
  onHover?: (data: ClickLog | null) => void;
  className?: string;
}

export const HeatmapCanvas: React.FC<HeatmapCanvasProps> = ({
  clickData,
  width,
  height,
  intensity = 1,
  radius = 20,
  opacity = 0.6,
  gradient = ['blue', 'cyan', 'lime', 'yellow', 'red'],
  onHover,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverCanvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<ClickLog | null>(null);

  // Generate heatmap data
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create gradient
    const gradientColors = createGradient(ctx, gradient);

    // Group clicks by proximity
    const heatmapPoints = generateHeatmapPoints(clickData, radius);

    // Draw heatmap
    drawHeatmap(ctx, heatmapPoints, gradientColors, intensity, opacity);
  }, [clickData, width, height, intensity, radius, opacity, gradient]);

  // Handle mouse events for hover
  useEffect(() => {
    const hoverCanvas = hoverCanvasRef.current;
    if (!hoverCanvas || !onHover) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = hoverCanvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Find closest click point
      const closest = findClosestClickPoint(clickData, x, y, radius);
      
      if (closest !== hoveredPoint) {
        setHoveredPoint(closest);
        onHover(closest);
      }
    };

    const handleMouseLeave = () => {
      setHoveredPoint(null);
      onHover(null);
    };

    hoverCanvas.addEventListener('mousemove', handleMouseMove);
    hoverCanvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      hoverCanvas.removeEventListener('mousemove', handleMouseMove);
      hoverCanvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [clickData, hoveredPoint, onHover, radius]);

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Main heatmap canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute inset-0 pointer-events-none"
        style={{ mixBlendMode: 'multiply' }}
      />
      
      {/* Invisible hover detection canvas */}
      {onHover && (
        <canvas
          ref={hoverCanvasRef}
          width={width}
          height={height}
          className="absolute inset-0 cursor-crosshair"
          style={{ background: 'transparent' }}
        />
      )}

      {/* Hover tooltip */}
      {hoveredPoint && (
        <div className="absolute bg-black text-white p-2 rounded shadow-lg text-xs z-10 pointer-events-none">
          <div>Position: ({hoveredPoint.x_position}, {hoveredPoint.y_position})</div>
          <div>Element: {hoveredPoint.element_info.tag}</div>
          {hoveredPoint.element_info.text && (
            <div>Text: {hoveredPoint.element_info.text.substring(0, 50)}...</div>
          )}
          <div>Time: {new Date(hoveredPoint.timestamp).toLocaleTimeString()}</div>
        </div>
      )}
    </div>
  );
};

// Helper functions
function createGradient(ctx: CanvasRenderingContext2D, colors: string[]): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, 0, 256, 0);
  
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });
  
  return gradient;
}

interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
  count: number;
}

function generateHeatmapPoints(clickData: ClickLog[], radius: number): HeatmapPoint[] {
  const points: HeatmapPoint[] = [];
  const gridSize = Math.floor(radius / 2);
  const pointMap = new Map<string, HeatmapPoint>();

  clickData.forEach((click) => {
    // Snap to grid to group nearby clicks
    const gridX = Math.floor(click.x_position / gridSize) * gridSize;
    const gridY = Math.floor(click.y_position / gridSize) * gridSize;
    const key = `${gridX},${gridY}`;

    if (pointMap.has(key)) {
      const point = pointMap.get(key)!;
      point.count++;
      point.intensity = Math.min(1, point.count * 0.1);
    } else {
      pointMap.set(key, {
        x: gridX + gridSize / 2,
        y: gridY + gridSize / 2,
        intensity: 0.1,
        count: 1,
      });
    }
  });

  return Array.from(pointMap.values());
}

function drawHeatmap(
  ctx: CanvasRenderingContext2D,
  points: HeatmapPoint[],
  gradient: CanvasGradient,
  intensity: number,
  opacity: number
): void {
  // Create off-screen canvas for better performance
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCanvas.width = ctx.canvas.width;
  tempCanvas.height = ctx.canvas.height;

  // Draw intensity map first
  points.forEach((point) => {
    const pointIntensity = point.intensity * intensity;
    const alpha = Math.min(1, pointIntensity);
    
    // Create radial gradient for each point
    const pointGradient = tempCtx.createRadialGradient(
      point.x, point.y, 0,
      point.x, point.y, 30
    );
    
    pointGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    pointGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    tempCtx.fillStyle = pointGradient;
    tempCtx.fillRect(point.x - 30, point.y - 30, 60, 60);
  });

  // Apply color gradient
  tempCtx.globalCompositeOperation = 'source-in';
  tempCtx.fillStyle = gradient;
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  // Draw to main canvas with opacity
  ctx.globalAlpha = opacity;
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.globalAlpha = 1;
}

function findClosestClickPoint(
  clickData: ClickLog[],
  x: number,
  y: number,
  maxDistance: number
): ClickLog | null {
  let closest: ClickLog | null = null;
  let minDistance = maxDistance;

  clickData.forEach((click) => {
    const distance = Math.sqrt(
      Math.pow(click.x_position - x, 2) + Math.pow(click.y_position - y, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closest = click;
    }
  });

  return closest;
}