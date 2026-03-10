import React from "react";
import DynamicBarChart from "./DynamicBarChart";

// --- Data & Content ---

const ANALYSIS_CONTENT = {
  title: "Aktien",
  paragraphs: [
    "2025 war im historischen Vergleich ein **starkes Jahr für Aktien**: Europäische Titel legten um +20,2 % zu, Schwellenländeraktien um +16 %, die Kurse chinesischer Papiere (A-Aktien) stiegen um +14 %. Das Plus von +3,8 % bei US-Aktien sieht im Vergleich bescheiden aus. Tatsächlich lagen sie so deutlich wie seit 15 Jahren nicht mehr hinter einem globalen Aktienindex ohne US-Titel – etwa dem MSCI ACWI ex USA – zurück. Aus Sicht hiesiger Anlegender spielt ein weiterer Faktor eine gewichtige Rolle: der **Wertverlust des US-Dollar gegenüber dem Euro von -11,9 %**. Dadurch fällt die Rendite für in Euro geführte Depots geringer aus. In ihrer Heimatwährung legten US-Aktien um +17,8 % zu.",
    "Zweimal gaben die Kurse im Verlauf des Jahres deutlich nach: Am stärksten brachen sie Anfang April ein, als US-Präsident Donald Trump umfassende Zölle ankündigte. US-Aktien beispielsweise verloren in diesem Zeitraum gegenüber ihrem Hoch im März um bis zu -22,4 % (Maximum Drawdown). Im vierten Quartal gab es eine weitere Phase der Nervosität, als **Warnungen vor einer KI-Blase** an den Aktienmärkten immer lauter wurden. Erneut sanken die Kurse etwa von US-Titeln, allerdings weniger als rund um den sogenannten „Liberation Day“. Zum Jahresende hin hellte sich die Stimmung wieder auf. Der amerikanische Aktienmarkt (S&P 500) verzeichnete um Weihnachten sogar ein **neues Allzeithoch**.",
    "Die Erwartungen an Entwicklungen und Einsatz von **künstlicher Intelligenz waren der bestimmende Faktor** für die Bewegungen an den Aktienmärkten. Der führende Chiphersteller Nvidia beispielsweise, die am höchsten gewichtete Aktie im US-Index S&P 500, legte 2025 um +22,5 % (in US-Dollar: +38,9 %) zu. Der Titel war damit allein für 1,7 Prozentpunkte der Rendite von insgesamt +3,8 % bei US-Aktien verantwortlich. Zerlegt man den weltweiten Aktienmarkt in Sektoren, lagen Technologiewerte – wie Nvidia – allerdings nicht an der Spitze. Am stärksten entwickelten sich die Kurse im **Sektor Kommunikation**. Diesen dominiert die Aktie von Alphabet (Kursentwicklung 2025: +46,4 % in Euro, +66 % in US-Dollar). Das Unternehmen spielt neben seinen Geschäften rund um die Google-Suche und Cloud-Dienste über sein Sprachmodell Gemini ebenfalls im KI-Wettlauf mit. Das Beispiel zeigt, dass künstliche Intelligenz über den IT-Sektor im engeren Sinne hinaus eine gewichtige Rolle spielt.",
  ],
};

const FOOTNOTE =
  "Angaben in Euro vor Kosten. Anleihen in Fremdwährung sind währungsbesichert.";

const data = [
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

// --- Sub-Components ---

/**
 * Header section with main and sub-titles
 */
const PageHeader = ({ title, subtitle }) => (
  <header style={{ marginBottom: "40px" }}>
    <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: "0 0 8px 0" }}>
      {title}
    </h1>
    <p style={{ fontSize: "18px", color: "#333", margin: 0 }}>{subtitle}</p>
  </header>
);

/**
 * Small disclaimer/note text found between chart and analysis
 */
const MarketFootnote = ({ text }) => (
  <div style={{ margin: "24px 0", fontSize: "14px", color: "#000" }}>
    {text}
  </div>
);

/**
 * The textual analysis section with bullet points
 */
const MarketAnalysis = ({ title, paragraphs }) => (
  <section style={{ marginTop: "40px" }}>
    <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
      {title}
    </h2>
    <ul style={{ paddingLeft: "20px", margin: 0 }}>
      {paragraphs.map((text, index) => (
        <li
          key={index}
          style={{ marginBottom: "16px", lineHeight: "1.5", fontSize: "15px" }}
        >
          {/* Note: In a real app, use a markdown parser to handle the **bold** markers */}
          {text}
        </li>
      ))}
    </ul>
  </section>
);

// --- Main Component ---

const MarketReportPage = () => {
  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "40px",
        fontFamily: "sans-serif",
        color: "#333",
      }}
    >
      <PageHeader
        title="Markt"
        subtitle="Wertentwicklung unterschiedlicher Anlageklassen 2025"
      />

      {/* Chart component would be placed here */}
      {/* <div style={{ height: '300px', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc' }}>
          [Performance Chart Placeholder]
        </div> */}

      <span>hello</span>
      <DynamicBarChart
        data={data}
        width={531}
        height={300}
        yMin={0}
        yMax={50}
        yTickCount={5}
        valueFormatter={(value) => `${percentFormatter.format(value)} %`}
        yTickFormatter={(value) => `${percentFormatter.format(value)} %`}
      />

      <MarketFootnote text={FOOTNOTE} />

      <MarketAnalysis
        title={ANALYSIS_CONTENT.title}
        paragraphs={ANALYSIS_CONTENT.paragraphs}
      />
    </div>
  );
};

export default MarketReportPage;
