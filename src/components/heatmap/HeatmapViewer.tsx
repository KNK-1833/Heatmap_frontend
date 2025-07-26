'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { HeatmapCanvas } from './HeatmapCanvas';
import { HeatmapControls } from './HeatmapControls';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useHeatmapData } from '@/hooks/useHeatmapData';
import { ClickLog } from '@/types';
import { AlertCircle, MousePointer } from 'lucide-react';

interface HeatmapViewerProps {
  articleId: string;
  width?: number;
  height?: number;
  className?: string;
}

export const HeatmapViewer: React.FC<HeatmapViewerProps> = ({
  articleId,
  width = 1200,
  height = 800,
  className = '',
}) => {
  // Heatmap settings state
  const [intensity, setIntensity] = useState(1.5);
  const [radius, setRadius] = useState(20);
  const [opacity, setOpacity] = useState(0.6);
  const [gradient, setGradient] = useState('classic');
  const [showClicks, setShowClicks] = useState(false);
  const [dateRange, setDateRange] = useState('last7days');
  const [hoveredClick, setHoveredClick] = useState<ClickLog | null>(null);

  // Get gradient colors based on selection
  const getGradientColors = (gradientType: string): string[] => {
    const gradients = {
      classic: ['blue', 'cyan', 'lime', 'yellow', 'red'],
      fire: ['black', 'red', 'orange', 'yellow', 'white'],
      cool: ['purple', 'blue', 'cyan', 'white'],
      monochrome: ['white', 'gray', 'black'],
      rainbow: ['red', 'orange', 'yellow', 'green', 'blue', 'purple'],
    };
    return gradients[gradientType as keyof typeof gradients] || gradients.classic;
  };

  // Fetch heatmap data
  const {
    clickData,
    loading,
    error,
    refetch,
  } = useHeatmapData({
    articleId,
    dateRange,
    limit: 10000, // Limit for performance
  });

  // Handle date range change
  const handleDateRangeChange = useCallback((newDateRange: string) => {
    setDateRange(newDateRange);
  }, []);

  // Handle export functionality
  const handleExport = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `heatmap-${articleId}-${dateRange}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  }, [articleId, dateRange]);

  // Handle hover events
  const handleHover = useCallback((clickData: ClickLog | null) => {
    setHoveredClick(clickData);
  }, []);

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load heatmap data: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer className="h-5 w-5" />
            Click Heatmap Analysis
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Controls Panel */}
        <div className="xl:col-span-1">
          <HeatmapControls
            intensity={intensity}
            onIntensityChange={setIntensity}
            radius={radius}
            onRadiusChange={setRadius}
            opacity={opacity}
            onOpacityChange={setOpacity}
            gradient={gradient}
            onGradientChange={setGradient}
            showClicks={showClicks}
            onShowClicksChange={setShowClicks}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            onRefresh={refetch}
            onExport={handleExport}
            isLoading={loading}
          />
        </div>

        {/* Heatmap Display */}
        <div className="xl:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Heatmap Visualization
                </CardTitle>
                <div className="text-sm text-gray-600">
                  {clickData.length} clicks recorded
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-96 w-full" />
                </div>
              ) : (
                <div className="relative">
                  {/* Background pattern to show the canvas area */}
                  <div 
                    className="border-2 border-dashed border-gray-200 bg-gray-50"
                    style={{ width, height }}
                  >
                    {clickData.length > 0 ? (
                      <HeatmapCanvas
                        clickData={clickData}
                        width={width}
                        height={height}
                        intensity={intensity}
                        radius={radius}
                        opacity={opacity}
                        gradient={getGradientColors(gradient)}
                        onHover={handleHover}
                        className="border rounded"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <MousePointer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No click data available for the selected period</p>
                          <p className="text-sm">Try selecting a different date range</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Individual click markers (if enabled) */}
                  {showClicks && clickData.length > 0 && (
                    <div className="absolute inset-0 pointer-events-none">
                      {clickData.slice(0, 100).map((click, index) => (
                        <div
                          key={index}
                          className="absolute w-2 h-2 bg-red-500 rounded-full opacity-70 transform -translate-x-1 -translate-y-1"
                          style={{
                            left: click.x_position,
                            top: click.y_position,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Click Details Panel */}
      {hoveredClick && (
        <Card>
          <CardHeader>
            <CardTitle>Click Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Position</div>
                <div>({hoveredClick.x_position}, {hoveredClick.y_position})</div>
              </div>
              <div>
                <div className="font-medium">Element</div>
                <div>{hoveredClick.element_info.tag}</div>
              </div>
              <div>
                <div className="font-medium">Time</div>
                <div>{new Date(hoveredClick.timestamp).toLocaleString()}</div>
              </div>
              <div>
                <div className="font-medium">Session</div>
                <div className="truncate">{hoveredClick.session_id}</div>
              </div>
              {hoveredClick.element_info.text && (
                <div className="col-span-2">
                  <div className="font-medium">Text Content</div>
                  <div className="truncate">{hoveredClick.element_info.text}</div>
                </div>
              )}
              {hoveredClick.element_info.href && (
                <div className="col-span-2">
                  <div className="font-medium">Link URL</div>
                  <div className="truncate">{hoveredClick.element_info.href}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {clickData.length}
              </div>
              <div className="text-sm text-gray-600">Total Clicks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {new Set(clickData.map(c => c.session_id)).size}
              </div>
              <div className="text-sm text-gray-600">Unique Sessions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {new Set(clickData.map(c => c.element_info.tag)).size}
              </div>
              <div className="text-sm text-gray-600">Element Types</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(clickData.length / Math.max(new Set(clickData.map(c => c.session_id)).size, 1) * 10) / 10}
              </div>
              <div className="text-sm text-gray-600">Avg Clicks/Session</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};