import  { useEffect, useRef } from 'react';

interface DataPoint {
  year: number;
  value: number;
}

interface ChartProps {
  data: DataPoint[];
  title: string;
  yAxisLabel: string;
  color?: string;
}

const ChartComponent = ({ data, title, yAxisLabel, color = '#0284c7' }: ChartProps) => {
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
    const padding = 40;
    
    // Chart area
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // Find min and max values
    const minYear = Math.min(...data.map(d => d.year));
    const maxYear = Math.max(...data.map(d => d.year));
    const minValue = Math.min(...data.map(d => d.value));
    const maxValue = Math.max(...data.map(d => d.value));
    const valueRange = maxValue - minValue;
    
    // Draw axes
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // Draw labels
    ctx.fillStyle = '#475569';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // X-axis labels (years)
    data.forEach((point) => {
      const x = padding + ((point.year - minYear) / (maxYear - minYear)) * chartWidth;
      ctx.fillText(point.year.toString(), x, height - padding + 20);
    });
    
    // Y-axis labels
    const numYLabels = 5;
    for (let i = 0; i <= numYLabels; i++) {
      const value = minValue + (i / numYLabels) * valueRange;
      const y = height - padding - (i / numYLabels) * chartHeight;
      ctx.fillText(value.toFixed(0), padding - 20, y + 4);
    }
    
    // Y-axis title
    ctx.save();
    ctx.translate(padding - 35, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(yAxisLabel, 0, 0);
    ctx.restore();
    
    // Draw grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    
    // Horizontal grid lines
    for (let i = 1; i <= numYLabels; i++) {
      const y = height - padding - (i / numYLabels) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    
    // Draw data points and line
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((point, index) => {
      const x = padding + ((point.year - minYear) / (maxYear - minYear)) * chartWidth;
      const y = height - padding - ((point.value - minValue) / valueRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw data points with gradient
    data.forEach((point) => {
      const x = padding + ((point.year - minYear) / (maxYear - minYear)) * chartWidth;
      const y = height - padding - ((point.value - minValue) / valueRange) * chartHeight;
      
      // Create gradient for data points
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 6);
      gradient.addColorStop(0, '#0284c7');
      gradient.addColorStop(1, '#0369a1');
      
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add white center for better visibility
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });
    
    // Add title
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.fillText(title, width / 2, padding - 10);
  }, [data, title, yAxisLabel, color]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={500} 
      height={300} 
      className="w-full h-full"
    />
  );
};

export default ChartComponent;
 