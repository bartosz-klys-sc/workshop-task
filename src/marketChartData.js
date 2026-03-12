export const marketChartData = [
  { label: "Staatsanleihen Eurozone", value: 0.5 },
  { label: "Unternehmensanleihen Euro", value: 2.2 },
  { label: "Geldmarkt", value: 3.0 },
  { label: "Aktien USA", value: 3.8 },
  { label: "Unternehmensanleihen US-Dollar", value: 3.9 },
  { label: "Staatsanleihen USA", value: 5.5 },
  { label: "Aktien kleine Unternehmen", value: 5.7 },
  { label: "Aktien Asien-Pazifik", value: 6.9 },
  { label: "Aktien Japan", value: 10.1 },
  { label: "Rohstoffe", value: 11.2 },
  { label: "Aktien China", value: 14.0 },
  { label: "Aktien Schwellenländer", value: 16.0 },
  { label: "Aktien Europa", value: 20.2 },
  { label: "Gold", value: 45.3 },
];

const percentFormatter = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export const formatMarketPercent = (value) => `${percentFormatter.format(value)} %`;
