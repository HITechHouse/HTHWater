import React, { useEffect, useRef } from 'react';

interface DataPoint {
  category?: string;
  value: number;
  year?: number;
  region?: string;
  governorate?: string;
}

interface BarChartProps {
  data: DataPoint[];
  title: string;
  yAxisLabel: string;
  color?: string;
  type?: 'bar' | 'line';
}

const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  title, 
  yAxisLabel, 
  color = '#3b82f6',
  type = 'bar'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Canvas dimensions
    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;
    
    // Chart area
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding - 40; // Extra space for labels
    
    // Find min and max values
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(0, Math.min(...data.map(d => d.value)));
    const valueRange = maxValue - minValue;
    
    // Draw axes
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, height - padding - 40);
    ctx.lineTo(width - padding, height - padding - 40);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding - 40);
    ctx.stroke();
    
    // Y-axis labels
    const numYLabels = 5;
    ctx.fillStyle = '#475569';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= numYLabels; i++) {
      const value = minValue + (i / numYLabels) * valueRange;
      const y = height - padding - 40 - (i / numYLabels) * chartHeight;
      ctx.fillText(value.toFixed(0), padding - 10, y + 4);
      
      // Draw horizontal grid lines
      if (i > 0) {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }
    }
    
    // Y-axis title
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(yAxisLabel, 0, 0);
    ctx.restore();
    
    if (type === 'bar') {
      // Draw bars
      const barWidth = chartWidth / data.length * 0.8;
      const barSpacing = chartWidth / data.length * 0.2;
      
      data.forEach((point, index) => {
        const x = padding + index * (chartWidth / data.length) + barSpacing / 2;
        const barHeight = ((point.value - minValue) / valueRange) * chartHeight;
        const y = height - padding - 40 - barHeight;
        
        // Create gradient for bars
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color + '80'); // Add transparency
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Add border to bars
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
        
        // Add value labels on top of bars
        ctx.fillStyle = '#1e293b';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
          point.value.toString(), 
          x + barWidth / 2, 
          y - 5
        );
      });
    } else {
      // Draw line chart
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      data.forEach((point, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = height - padding - 40 - ((point.value - minValue) / valueRange) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      
      // Draw data points
      data.forEach((point, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = height - padding - 40 - ((point.value - minValue) / valueRange) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
    
    // X-axis labels
    ctx.fillStyle = '#475569';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    
    data.forEach((point, index) => {
      const x = padding + (type === 'bar' 
        ? index * (chartWidth / data.length) + (chartWidth / data.length) / 2
        : (index / (data.length - 1)) * chartWidth);
      
      const label = point.category || point.region || point.governorate || point.year?.toString() || '';
      
      // Truncate long labels
      const maxLabelLength = 8;
      const displayLabel = label.length > maxLabelLength 
        ? label.substring(0, maxLabelLength) + '...' 
        : label;
      
      ctx.fillText(displayLabel, x, height - padding - 20);
    });
    
    // Add title
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.fillText(title, width / 2, 25);
    
  }, [data, title, yAxisLabel, color, type]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={600} 
      height={350} 
      className="w-full h-full"
    />
  );
};

export default BarChart;
