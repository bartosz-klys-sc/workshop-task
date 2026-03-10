export function generateChartUrl(assetData, brand) {
  const barColor = brand === "ING" ? "#FF6200" : "#FF7A00";

  const labels = assetData.map((item) => item.name);
  const values = assetData.map((item) => item.value);

  const chartConfig = {
    type: "horizontalBar",
    data: {
      labels,
      datasets: [
        {
          label: "Performance",
          data: values,
          backgroundColor: barColor,
          borderRadius: 6,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
      },
      scales: {
        xAxes: [
          {
            ticks: {
              callback: (value) => `${value}%`,
              fontColor: "#4B5563",
            },
            gridLines: { color: "#E5E7EB" },
          },
        ],
        yAxes: [
          {
            ticks: { fontColor: "#111827" },
            gridLines: { display: false },
          },
        ],
      },
    },
  };

  const encoded = encodeURIComponent(JSON.stringify(chartConfig));
  return `https://quickchart.io/chart?c=${encoded}&format=png&backgroundColor=white`;
}
