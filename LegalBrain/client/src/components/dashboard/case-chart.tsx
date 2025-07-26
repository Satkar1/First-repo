import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef } from "react";

interface CaseChartProps {
  cases: Array<{ status: string }>;
}

export default function CaseChart({ cases }: CaseChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!chartRef.current || !cases?.length) return;

    // Count cases by status
    const statusCounts = cases.reduce((acc, case_) => {
      acc[case_.status] = (acc[case_.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);
    const colors = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444'];

    // Simple chart implementation
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const centerX = chartRef.current.width / 2;
    const centerY = chartRef.current.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height);

    let currentAngle = 0;
    const total = data.reduce((sum, val) => sum + val, 0);

    data.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      
      currentAngle += sliceAngle;
    });

  }, [cases]);

  if (!cases?.length) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No case data available
      </div>
    );
  }

  return (
    <div className="h-64 flex items-center justify-center">
      <canvas
        ref={chartRef}
        width={300}
        height={200}
        className="max-w-full max-h-full"
      />
    </div>
  );
}
