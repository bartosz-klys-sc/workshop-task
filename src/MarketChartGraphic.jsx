import React from "react";
import DynamicBarChart from "./DynamicBarChart.jsx";
import { formatMarketPercent, marketChartData } from "./marketChartData.js";

export default function MarketChartGraphic({
  data = marketChartData,
  width = 531,
  height = 300,
  yMin = 0,
  yMax = 50,
  yTickCount = 5,
}) {
  return (
    <DynamicBarChart
      data={data}
      width={width}
      height={height}
      yMin={yMin}
      yMax={yMax}
      yTickCount={yTickCount}
      valueFormatter={formatMarketPercent}
      yTickFormatter={formatMarketPercent}
    />
  );
}
