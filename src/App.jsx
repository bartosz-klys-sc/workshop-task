import React, { useMemo, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import EditorSidebar from "./EditorSidebar.jsx";
import PdfDocument from "./PdfDocument.jsx";

const initialData = {
  language: "de",
  brand: "Scalable",
  reportType: "Weltportfolios Klassisch",
  reportDate: "31.12.2025",
  quarter: "Q4",
  year: "2025",
  sections: {
    inKuerze: "2025 war ein starkes Aktienjahr...",
    ausblick: "Eine neue Ära mit massiven staatlichen Eingriffen...",
  },
  portfolioPerformance: [
    { portfolio: "Weltportfolio Klassisch 40", ytd: 6.7 },
    { portfolio: "Weltportfolio Klassisch 60", ytd: 8.2 },
  ],
  marketPage: {
    title: "Markt",
    subtitle: "Wertentwicklung unterschiedlicher Anlageklassen 2025",
    footnote:
      "Angaben in Euro vor Kosten. Anleihen in Fremdwährung sind währungsbesichert.",
    analysisTitle: "Aktien",
    analysisBody:
      "- 2025 war im historischen Vergleich ein **starkes Jahr für Aktien**: Europäische Titel legten um +20,2 % zu, Schwellenländeraktien um +16 %, die Kurse chinesischer Papiere (A-Aktien) stiegen um +14 %. Das Plus von +3,8 % bei US-Aktien sieht im Vergleich bescheiden aus. Tatsächlich lagen sie so deutlich wie seit 15 Jahren nicht mehr hinter einem globalen Aktienindex ohne US-Titel – etwa dem MSCI ACWI ex USA – zurück. Aus Sicht hiesiger Anlegender spielt ein weiterer Faktor eine gewichtige Rolle: der **Wertverlust des US-Dollar gegenüber dem Euro von -11,9 %**. Dadurch fällt die Rendite für in Euro geführte Depots geringer aus. In ihrer Heimatwährung legten US-Aktien um +17,8 % zu.\n- Zweimal gaben die Kurse im Verlauf des Jahres deutlich nach: Am stärksten brachen sie Anfang April ein, als US-Präsident Donald Trump umfassende Zölle ankündigte. US-Aktien beispielsweise verloren in diesem Zeitraum gegenüber ihrem Hoch im März um bis zu -22,4 % (Maximum Drawdown). Im vierten Quartal gab es eine weitere Phase der Nervosität, als **Warnungen vor einer KI-Blase** an den Aktienmärkten immer lauter wurden. Erneut sanken die Kurse etwa von US-Titeln, allerdings weniger als rund um den sogenannten „Liberation Day“. Zum Jahresende hin hellte sich die Stimmung wieder auf. Der amerikanische Aktienmarkt (S&P 500) verzeichnete um Weihnachten sogar ein **neues Allzeithoch**.\n- Die Erwartungen an Entwicklungen und Einsatz von **künstlicher Intelligenz waren der bestimmende Faktor** für die Bewegungen an den Aktienmärkten. Der führende Chiphersteller Nvidia beispielsweise, die am höchsten gewichtete Aktie im US-Index S&P 500, legte 2025 um +22,5 % (in US-Dollar: +38,9 %) zu. Der Titel war damit allein für 1,7 Prozentpunkte der Rendite von insgesamt +3,8 % bei US-Aktien verantwortlich. Zerlegt man den weltweiten Aktienmarkt in Sektoren, lagen Technologiewerte – wie Nvidia – allerdings nicht an der Spitze. Am stärksten entwickelten sich die Kurse im **Sektor Kommunikation**. Diesen dominiert die Aktie von Alphabet (Kursentwicklung 2025: +46,4 % in Euro, +66 % in US-Dollar). Das Unternehmen spielt neben seinen Geschäften rund um die Google-Suche und Cloud-Dienste über sein Sprachmodell Gemini ebenfalls im KI-Wettlauf mit. Das Beispiel zeigt, dass künstliche Intelligenz über den IT-Sektor im engeren Sinne hinaus eine gewichtige Rolle spielt.",
  },
};

export default function App() {
  const [formData, setFormData] = useState(initialData);
  const [generatedData, setGeneratedData] = useState(initialData);

  const isDirty = useMemo(
    () => JSON.stringify(formData) !== JSON.stringify(generatedData),
    [formData, generatedData]
  );

  const handleGenerate = () => {
    setGeneratedData(JSON.parse(JSON.stringify(formData)));
  };

  const pdfDocument = useMemo(
    () => <PdfDocument formData={generatedData} />,
    [generatedData]
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden max-[1024px]:flex-col">
      <div className="w-[40%] min-w-[360px] overflow-y-auto border-r border-black/5 bg-white px-9 py-8 max-[1024px]:h-1/2 max-[1024px]:w-full max-[1024px]:min-w-0 max-[1024px]:border-r-0 max-[1024px]:border-b max-[1024px]:px-6">
        <EditorSidebar
          formData={formData}
          setFormData={setFormData}
          onGenerate={handleGenerate}
          isDirty={isDirty}
        />
      </div>
      <div className="w-[60%] bg-[radial-gradient(circle_at_top,_#fff5eb_0%,_#f7f5f2_60%)] p-4 max-[1024px]:h-1/2 max-[1024px]:w-full">
        <div className="h-full w-full overflow-hidden rounded-md shadow-card">
          <PDFViewer width="100%" height="100%" showToolbar={true} className="h-full w-full">
            {pdfDocument}
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}
