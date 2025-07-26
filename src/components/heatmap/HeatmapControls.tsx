'use client';

import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Settings } from 'lucide-react';

interface HeatmapControlsProps {
  intensity: number;
  onIntensityChange: (value: number) => void;
  radius: number;
  onRadiusChange: (value: number) => void;
  opacity: number;
  onOpacityChange: (value: number) => void;
  gradient: string;
  onGradientChange: (value: string) => void;
  showClicks: boolean;
  onShowClicksChange: (value: boolean) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  isLoading?: boolean;
  className?: string;
}

const gradientOptions = [
  { value: 'classic', label: 'Classic', colors: ['blue', 'cyan', 'lime', 'yellow', 'red'] },
  { value: 'fire', label: 'Fire', colors: ['black', 'red', 'orange', 'yellow', 'white'] },
  { value: 'cool', label: 'Cool', colors: ['purple', 'blue', 'cyan', 'white'] },
  { value: 'monochrome', label: 'Monochrome', colors: ['white', 'gray', 'black'] },
  { value: 'rainbow', label: 'Rainbow', colors: ['red', 'orange', 'yellow', 'green', 'blue', 'purple'] },
];

const dateRangeOptions = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 days' },
  { value: 'last30days', label: 'Last 30 days' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'lastMonth', label: 'Last month' },
  { value: 'custom', label: 'Custom range' },
];

export const HeatmapControls: React.FC<HeatmapControlsProps> = ({
  intensity,
  onIntensityChange,
  radius,
  onRadiusChange,
  opacity,
  onOpacityChange,
  gradient,
  onGradientChange,
  showClicks,
  onShowClicksChange,
  dateRange,
  onDateRangeChange,
  onRefresh,
  onExport,
  isLoading = false,
  className = '',
}) => {
  return (
    <div className={`bg-white border rounded-lg p-4 space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Heatmap Controls
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={isLoading}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Date Range Selection */}
      <div className="space-y-2">
        <Label htmlFor="dateRange">Time Period</Label>
        <Select value={dateRange} onValueChange={onDateRangeChange}>
          <SelectTrigger id="dateRange">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            {dateRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Intensity Control */}
      <div className="space-y-2">
        <Label htmlFor="intensity">
          Intensity: {intensity.toFixed(1)}
        </Label>
        <Slider
          id="intensity"
          min={0.1}
          max={3}
          step={0.1}
          value={[intensity]}
          onValueChange={([value]) => onIntensityChange(value)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Radius Control */}
      <div className="space-y-2">
        <Label htmlFor="radius">
          Radius: {radius}px
        </Label>
        <Slider
          id="radius"
          min={5}
          max={50}
          step={1}
          value={[radius]}
          onValueChange={([value]) => onRadiusChange(value)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Precise</span>
          <span>Broad</span>
        </div>
      </div>

      {/* Opacity Control */}
      <div className="space-y-2">
        <Label htmlFor="opacity">
          Opacity: {Math.round(opacity * 100)}%
        </Label>
        <Slider
          id="opacity"
          min={0.1}
          max={1}
          step={0.1}
          value={[opacity]}
          onValueChange={([value]) => onOpacityChange(value)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Transparent</span>
          <span>Opaque</span>
        </div>
      </div>

      {/* Color Gradient */}
      <div className="space-y-2">
        <Label htmlFor="gradient">Color Scheme</Label>
        <Select value={gradient} onValueChange={onGradientChange}>
          <SelectTrigger id="gradient">
            <SelectValue placeholder="Select color scheme" />
          </SelectTrigger>
          <SelectContent>
            {gradientOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {option.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-3 h-3 border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Additional Options */}
      <div className="space-y-3 pt-2 border-t">
        <div className="flex items-center justify-between">
          <Label htmlFor="showClicks" className="text-sm">
            Show individual clicks
          </Label>
          <Switch
            id="showClicks"
            checked={showClicks}
            onCheckedChange={onShowClicksChange}
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="pt-2 border-t">
        <h4 className="text-sm font-medium mb-2">Quick Stats</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Analyzing: {dateRangeOptions.find(opt => opt.value === dateRange)?.label}</div>
          <div>Intensity: {intensity}x</div>
          <div>Heat radius: {radius}px</div>
        </div>
      </div>
    </div>
  );
};