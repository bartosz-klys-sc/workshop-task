import React, { useId } from "react";

/**
 * Helper function to calculate a human-readable step size for the Y-axis.
 */
function makeNiceStep(range, targetTickCount) {
  if (range <= 0) return 1;
  const roughStep = range / Math.max(1, targetTickCount);
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;

  if (residual <= 1) return magnitude;
  if (residual <= 2) return 2 * magnitude;
  if (residual <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

export function DynamicBarChart({
  data = [],
  width = 531,
  height = 290,
  yTickCount = 6,
  yMin: yMinProp,
  yMax: yMaxProp,
  valueFormatter = (value) => `${value}%`,
  yTickFormatter = (value) => `${value}%`,
}) {
  const gradientId = useId().replace(/:/g, "");
  const chartFontFamily = '"KH Teka SC", sans-serif';
  const topWhitespaceInsideSvg = 10;
  const xAxisLabelGapFromBars = 4;
  const xAxisLabelAreaHeight = 107;
  const yAxisLabelBoxHeight = 11;

  if (data.length === 0) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Empty chart"
      >
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#666"
          fontFamily={chartFontFamily}
        >
          No data
        </text>
      </svg>
    );
  }

  const margin = {
    top: topWhitespaceInsideSvg + yAxisLabelBoxHeight,
    right: 20,
    bottom: xAxisLabelGapFromBars + xAxisLabelAreaHeight,
    left: 58,
  };

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const values = data.map((d) => d.value);
  const rawMin = Math.min(...values, 0);
  const rawMax = Math.max(...values, 0);

  const resolvedYMin = yMinProp ?? rawMin;
  const resolvedYMax = yMaxProp ?? rawMax;
  const initialRange = Math.max(1, resolvedYMax - resolvedYMin);
  const step = makeNiceStep(initialRange, yTickCount);

  const yMin = Math.floor(resolvedYMin / step) * step;
  const yMax = Math.ceil(resolvedYMax / step) * step;
  const finalRange = Math.max(1, yMax - yMin);

  const ticks = [];
  for (let value = yMin; value <= yMax + step * 0.5; value += step) {
    ticks.push(Number(value.toFixed(10)));
  }

  const yToPx = (value) =>
    margin.top + chartHeight - ((value - yMin) / finalRange) * chartHeight;

  const zeroLineY = yToPx(0);
  const barGap = 8;
  const barWidth = 24;
  const barsTotalWidth = barWidth * data.length + barGap * (data.length - 1);
  const barStartX =
    margin.left + Math.max(0, (chartWidth - barsTotalWidth) / 2);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Bar chart"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={`barGradient-${gradientId}`}
          x1="0"
          y1="1"
          x2="0"
          y2="0"
        >
          <stop offset="0.2" stopColor="#4D4F51" />
          <stop offset="0.6" stopColor="#37393B" />
          <stop offset="1" stopColor="#212325" />
        </linearGradient>
      </defs>

      {ticks.map((tick) => {
        const y = yToPx(tick);
        const yAxisLabelCenterY = y - yAxisLabelBoxHeight / 2;
        return (
          <g key={tick}>
            <line
              x1={0}
              y1={y}
              x2={width - margin.right}
              y2={y}
              stroke="#10111233"
              strokeWidth={0.5}
            />
            <text
              x={0}
              y={yAxisLabelCenterY}
              textAnchor="start"
              dominantBaseline="middle"
              fill="#101112"
              fillOpacity={0.6}
              fontSize={8}
              fontFamily={chartFontFamily}
            >
              {yTickFormatter(tick)}
            </text>
          </g>
        );
      })}

      {data.map((datum, index) => {
        const x = barStartX + index * (barWidth + barGap);
        const valueY = yToPx(datum.value);
        const y = Math.min(valueY, zeroLineY);
        const h = Math.max(1, Math.abs(zeroLineY - valueY));
        const valueLabelOffset = 8;
        const xLabelY = y + h + xAxisLabelGapFromBars;
        const xLabelX = x + barWidth / 2;

        return (
          <g key={`${datum.label}-${index}`}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={h}
              rx={4}
              fill={`url(#barGradient-${gradientId})`}
              opacity={1}
            />
            <text
              x={x + barWidth / 2}
              y={valueY - valueLabelOffset}
              textAnchor="middle"
              fill="#101112"
              fontSize={7}
              fontWeight={700}
              fontStyle="normal"
              letterSpacing={0}
              style={{ lineHeight: "140%" }}
              fontFamily={chartFontFamily}
            >
              {valueFormatter(datum.value)}
            </text>
            <text
              x={xLabelX}
              y={xLabelY}
              textAnchor="end"
              dominantBaseline="hanging"
              transform={`rotate(-45 ${xLabelX} ${xLabelY})`}
              fill="#101112"
              fontSize={7}
              fontWeight={400}
              fontStyle="normal"
              letterSpacing={0}
              style={{ lineHeight: "140%" }}
              fontFamily={chartFontFamily}
            >
              {datum.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default DynamicBarChart;
