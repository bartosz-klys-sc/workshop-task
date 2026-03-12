import React, { useEffect, useMemo, useRef, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import EditorSidebar from "./EditorSidebar.jsx";
import MarketChartGraphic from "./MarketChartGraphic.jsx";
import PdfDocument from "./PdfDocument.jsx";
import { marketChartData } from "./marketChartData.js";

const initialMarketChartData = marketChartData.map((row) => ({
  label: row.label,
  value: String(row.value),
}));

const initialMarketChartCsv = [
  "label,value",
  ...initialMarketChartData.map((row) => `${row.label},${row.value}`),
].join("\n");

const initialData = {
  language: "de",
  brand: "Scalable",
  reportType: "Portfolio Report",
  reportDate: "31.12.2025",
  quarter: "Q4",
  year: "2025",
  sections: {
    inKuerze: "2025 war ein starkes Aktienjahr...",
    ausblick: "Eine neue Ära mit massiven staatlichen Eingriffen...",
  },
  secondPage: {
    summary:
      "Erfahren Sie die wichtigsten Hintergründe zur Wertentwicklung Ihrer Anlagestrategie im Gesamtjahr 2025. Erhalten Sie zudem einen Überblick über die wichtigsten Marktereignisse und unser Portfolio-Management in den vergangenen drei Monaten.",
    sections: [
      {
        title: "Märkte",
        content:
          "**2025 war ein starkes Aktienjahr** - mit zweistelligen Zuwächsen an den wichtigsten Märkten...",
      },
      {
        title: "Wertentwicklung",
        content:
          "Weltportfolios Klassisch legten je nach Risikokategorie um +5,8 % (Klassisch 30) bis +9,5 % (Klassisch 100) zu. Weltportfolios Klassisch + Gold legten um +9,8 % (Klassisch + Gold 30) bis +12 % (Klassisch + Gold 90) zu.",
      },
      {
        title: "Portfolio-Management im 4. Quartal",
        content:
          "Vor dem Jahreswechsel setzten wir für Kundinnen und Kunden mit noch nicht ausgeschöpftem Freistellungsauftrag die Steueroptimierung um...",
      },
      {
        title: "Ausblick",
        content:
          "Eine neue Ära mit massiven staatlichen Eingriffen in die Wirtschaft hat begonnen...",
      },
    ],
  },
  portfolioPerformance: [
    { portfolio: "Weltportfolio Klassisch 40", ytd: 6.7 },
    { portfolio: "Weltportfolio Klassisch 60", ytd: 8.2 },
  ],
  marketPage: {
    title: "Markt",
    subtitle: "Wertentwicklung unterschiedlicher Anlageklassen 2025",
    chartData: initialMarketChartData,
    chartDataCsv: initialMarketChartCsv,
    footnote:
      "Angaben in Euro vor Kosten. Anleihen in Fremdwährung sind währungsbesichert.",
    analysisTitle: "Aktien",
    analysisBody:
      "- 2025 war im historischen Vergleich ein **starkes Jahr für Aktien**: Europäische Titel legten um +20,2 % zu, Schwellenländeraktien um +16 %, die Kurse chinesischer Papiere (A-Aktien) stiegen um +14 %. Das Plus von +3,8 % bei US-Aktien sieht im Vergleich bescheiden aus. Tatsächlich lagen sie so deutlich wie seit 15 Jahren nicht mehr hinter einem globalen Aktienindex ohne US-Titel – etwa dem MSCI ACWI ex USA – zurück. Aus Sicht hiesiger Anlegender spielt ein weiterer Faktor eine gewichtige Rolle: der **Wertverlust des US-Dollar gegenüber dem Euro von -11,9 %**. Dadurch fällt die Rendite für in Euro geführte Depots geringer aus. In ihrer Heimatwährung legten US-Aktien um +17,8 % zu.\n- Zweimal gaben die Kurse im Verlauf des Jahres deutlich nach: Am stärksten brachen sie Anfang April ein, als US-Präsident Donald Trump umfassende Zölle ankündigte. US-Aktien beispielsweise verloren in diesem Zeitraum gegenüber ihrem Hoch im März um bis zu -22,4 % (Maximum Drawdown). Im vierten Quartal gab es eine weitere Phase der Nervosität, als **Warnungen vor einer KI-Blase** an den Aktienmärkten immer lauter wurden. Erneut sanken die Kurse etwa von US-Titeln, allerdings weniger als rund um den sogenannten „Liberation Day“. Zum Jahresende hin hellte sich die Stimmung wieder auf. Der amerikanische Aktienmarkt (S&P 500) verzeichnete um Weihnachten sogar ein **neues Allzeithoch**.\n- Die Erwartungen an Entwicklungen und Einsatz von **künstlicher Intelligenz waren der bestimmende Faktor** für die Bewegungen an den Aktienmärkten. Der führende Chiphersteller Nvidia beispielsweise, die am höchsten gewichtete Aktie im US-Index S&P 500, legte 2025 um +22,5 % (in US-Dollar: +38,9 %) zu. Der Titel war damit allein für 1,7 Prozentpunkte der Rendite von insgesamt +3,8 % bei US-Aktien verantwortlich. Zerlegt man den weltweiten Aktienmarkt in Sektoren, lagen Technologiewerte – wie Nvidia – allerdings nicht an der Spitze. Am stärksten entwickelten sich die Kurse im **Sektor Kommunikation**. Diesen dominiert die Aktie von Alphabet (Kursentwicklung 2025: +46,4 % in Euro, +66 % in US-Dollar). Das Unternehmen spielt neben seinen Geschäften rund um die Google-Suche und Cloud-Dienste über sein Sprachmodell Gemini ebenfalls im KI-Wettlauf mit. Das Beispiel zeigt, dass künstliche Intelligenz über den IT-Sektor im engeren Sinne hinaus eine gewichtige Rolle spielt.",
  },
};

const parseMarketChartValue = (value) => {
  const normalized = String(value ?? "")
    .trim()
    .replace(",", ".")
    .replace(/[^0-9.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildMarketChartRows = (rows = []) =>
  rows
    .map((row) => ({
      label: String(row?.label ?? "").trim(),
      value: parseMarketChartValue(row?.value),
    }))
    .filter((row) => row.label.length > 0 && row.value !== null);

const waitForPaint = () =>
  new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });

async function captureSvgAsPng(svgElement, scale = 3) {
  const serializer = new XMLSerializer();
  let svgMarkup = serializer.serializeToString(svgElement);

  if (!svgMarkup.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svgMarkup = svgMarkup.replace(
      "<svg",
      '<svg xmlns="http://www.w3.org/2000/svg"'
    );
  }
  if (!svgMarkup.includes('xmlns:xlink="http://www.w3.org/1999/xlink"')) {
    svgMarkup = svgMarkup.replace(
      "<svg",
      '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
    );
  }

  const sourceWidth =
    Number(svgElement.getAttribute("width")) ||
    svgElement.viewBox?.baseVal?.width ||
    531;
  const sourceHeight =
    Number(svgElement.getAttribute("height")) ||
    svgElement.viewBox?.baseVal?.height ||
    300;

  const svgBlob = new Blob([svgMarkup], {
    type: "image/svg+xml;charset=utf-8",
  });
  const objectUrl = URL.createObjectURL(svgBlob);

  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(sourceWidth * scale);
    canvas.height = Math.round(sourceHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) return null;

    context.scale(scale, scale);
    context.drawImage(image, 0, 0, sourceWidth, sourceHeight);

    return canvas.toDataURL("image/png", 1);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function App() {
  const [formData, setFormData] = useState(initialData);
  const [generatedData, setGeneratedData] = useState(initialData);
  const [generatedMarketChartImage, setGeneratedMarketChartImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chartCaptureRows, setChartCaptureRows] = useState(() =>
    buildMarketChartRows(initialData.marketPage?.chartData || [])
  );
  const chartCaptureRootRef = useRef(null);

  const generatedMarketChartRows = useMemo(
    () => buildMarketChartRows(generatedData.marketPage?.chartData || []),
    [generatedData]
  );

  const isDirty = useMemo(
    () => JSON.stringify(formData) !== JSON.stringify(generatedData),
    [formData, generatedData]
  );

  const captureMarketChartImage = async (rows) => {
    if (rows.length === 0) return null;
    setChartCaptureRows(rows);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await waitForPaint();
      const svgElement = chartCaptureRootRef.current?.querySelector("svg");
      if (svgElement) {
        return captureSvgAsPng(svgElement, 3);
      }
    }
    return null;
  };

  useEffect(() => {
    let isCancelled = false;
    const seedInitialChartImage = async () => {
      try {
        const chartImage = await captureMarketChartImage(generatedMarketChartRows);
        if (!isCancelled && chartImage) {
          setGeneratedMarketChartImage(chartImage);
        }
      } catch (error) {
        console.error("Failed to seed initial market chart image", error);
      }
    };

    void seedInitialChartImage();
    return () => {
      isCancelled = true;
    };
  }, [generatedMarketChartRows]);

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    const nextGeneratedData = JSON.parse(JSON.stringify(formData));
    const nextChartRows = buildMarketChartRows(
      nextGeneratedData.marketPage?.chartData || []
    );

    let chartImage = null;
    try {
      chartImage = await captureMarketChartImage(nextChartRows);
    } catch (error) {
      console.error("Failed to capture market chart image", error);
    } finally {
      setGeneratedMarketChartImage((previousImage) => {
        if (nextChartRows.length === 0) return null;
        return chartImage || previousImage;
      });
      setGeneratedData(nextGeneratedData);
      setIsGenerating(false);
    }
  };

  const pdfDocument = useMemo(
    () => (
      <PdfDocument
        formData={generatedData}
        marketChartImageSrc={generatedMarketChartImage}
      />
    ),
    [generatedData, generatedMarketChartImage]
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden max-[1024px]:flex-col">
      <div className="w-[40%] min-w-[360px] overflow-y-auto border-r border-black/5 bg-white px-9 py-8 max-[1024px]:h-1/2 max-[1024px]:w-full max-[1024px]:min-w-0 max-[1024px]:border-r-0 max-[1024px]:border-b max-[1024px]:px-6">
        <EditorSidebar
          formData={formData}
          setFormData={setFormData}
          onGenerate={handleGenerate}
          isDirty={isDirty}
          isGenerating={isGenerating}
        />
      </div>
      <div className="w-[60%] bg-[radial-gradient(circle_at_top,_#fff5eb_0%,_#f7f5f2_60%)] p-4 max-[1024px]:h-1/2 max-[1024px]:w-full">
        <div className="h-full w-full overflow-hidden rounded-md shadow-card">
          <PDFViewer width="100%" height="100%" showToolbar={true} className="h-full w-full">
            {pdfDocument}
          </PDFViewer>
        </div>
      </div>
      <div
        ref={chartCaptureRootRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          left: -10000,
          top: -10000,
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        <MarketChartGraphic
          data={chartCaptureRows}
          width={531}
          height={300}
          yTickCount={5}
        />
      </div>
    </div>
  );
}
