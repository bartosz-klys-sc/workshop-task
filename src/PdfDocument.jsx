import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const dictionary = {
  de: {
    page: "Seite",
    summary: "In Kürze",
    outlook: "Ausblick",
    performance: "Performance",
    portfolio: "Portfolio",
    ytd: "YTD",
    legal: "Wichtige Hinweise",
    legalBody:
      "Die enthaltenen Informationen dienen ausschließlich der allgemeinen Information und stellen keine Anlageberatung dar.",
  },
  en: {
    page: "Page",
    summary: "Summary",
    outlook: "Outlook",
    performance: "Performance",
    portfolio: "Portfolio",
    ytd: "YTD",
    legal: "Legal Notice",
    legalBody:
      "The information provided is for general information only and does not constitute investment advice.",
  },
};

const defaultMarketPage = {
  title: "Markt",
  subtitle: "Wertentwicklung unterschiedlicher Anlageklassen 2025",
  footnote:
    "Angaben in Euro vor Kosten. Anleihen in Fremdwährung sind währungsbesichert.",
  analysisTitle: "Aktien",
  analysisBody:
    "- 2025 war im historischen Vergleich ein **starkes Jahr für Aktien**: Europäische Titel legten um +20,2 % zu, Schwellenländeraktien um +16 %, die Kurse chinesischer Papiere (A-Aktien) stiegen um +14 %. Das Plus von +3,8 % bei US-Aktien sieht im Vergleich bescheiden aus. Tatsächlich lagen sie so deutlich wie seit 15 Jahren nicht mehr hinter einem globalen Aktienindex ohne US-Titel – etwa dem MSCI ACWI ex USA – zurück. Aus Sicht hiesiger Anlegender spielt ein weiterer Faktor eine gewichtige Rolle: der **Wertverlust des US-Dollar gegenüber dem Euro von -11,9 %**. Dadurch fällt die Rendite für in Euro geführte Depots geringer aus. In ihrer Heimatwährung legten US-Aktien um +17,8 % zu.\n- Zweimal gaben die Kurse im Verlauf des Jahres deutlich nach: Am stärksten brachen sie Anfang April ein, als US-Präsident Donald Trump umfassende Zölle ankündigte. US-Aktien beispielsweise verloren in diesem Zeitraum gegenüber ihrem Hoch im März um bis zu -22,4 % (Maximum Drawdown). Im vierten Quartal gab es eine weitere Phase der Nervosität, als **Warnungen vor einer KI-Blase** an den Aktienmärkten immer lauter wurden. Erneut sanken die Kurse etwa von US-Titeln, allerdings weniger als rund um den sogenannten „Liberation Day“. Zum Jahresende hin hellte sich die Stimmung wieder auf. Der amerikanische Aktienmarkt (S&P 500) verzeichnete um Weihnachten sogar ein **neues Allzeithoch**.\n- Die Erwartungen an Entwicklungen und Einsatz von **künstlicher Intelligenz waren der bestimmende Faktor** für die Bewegungen an den Aktienmärkten. Der führende Chiphersteller Nvidia beispielsweise, die am höchsten gewichtete Aktie im US-Index S&P 500, legte 2025 um +22,5 % (in US-Dollar: +38,9 %) zu. Der Titel war damit allein für 1,7 Prozentpunkte der Rendite von insgesamt +3,8 % bei US-Aktien verantwortlich. Zerlegt man den weltweiten Aktienmarkt in Sektoren, lagen Technologiewerte – wie Nvidia – allerdings nicht an der Spitze. Am stärksten entwickelten sich die Kurse im **Sektor Kommunikation**. Diesen dominiert die Aktie von Alphabet (Kursentwicklung 2025: +46,4 % in Euro, +66 % in US-Dollar). Das Unternehmen spielt neben seinen Geschäften rund um die Google-Suche und Cloud-Dienste über sein Sprachmodell Gemini ebenfalls im KI-Wettlauf mit. Das Beispiel zeigt, dass künstliche Intelligenz über den IT-Sektor im engeren Sinne hinaus eine gewichtige Rolle spielt.",
};

export default function PdfDocument({ formData }) {
  const t = dictionary[formData.language] || dictionary.de;
  const brandColor = formData.brand === "ING" ? "#FF6200" : "#FF7A00";
  const title = formData.brand === "ING" ? "Smart Invest" : formData.reportType;
  const showAmbassador = formData.brand === "Scalable";
  const metaDate = formData.reportDate?.trim() || `${formData.quarter} ${formData.year}`;
  const marketPage = { ...defaultMarketPage, ...(formData.marketPage || {}) };

  const renderInline = (text, variant = "default") => {
    const isMarket = variant === "market";
    const parts = [];
    let buffer = "";
    let mode = "normal";

    const flush = () => {
      if (buffer.length === 0) return;
      parts.push({ text: buffer, mode });
      buffer = "";
    };

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];
      if (char === "*" && next === "*") {
        flush();
        mode = mode === "bold" ? "normal" : "bold";
        i += 1;
        continue;
      }
      if (char === "*" && next !== "*") {
        flush();
        mode = mode === "italic" ? "normal" : "italic";
        continue;
      }
      buffer += char;
    }
    flush();

    return parts.map((part, idx) => (
      <Text
        key={`inline-${idx}`}
        style={[
          isMarket ? styles.marketBodyText : styles.bodyText,
          part.mode === "bold" && styles.boldText,
          part.mode === "italic" && styles.italicText,
        ]}
      >
        {part.text}
      </Text>
    ));
  };

  const renderRichText = (value, variant = "default") => {
    const isMarket = variant === "market";

    return value.split("\n").map((line, idx) => {
      if (line.startsWith("## ")) {
        return (
          <Text style={isMarket ? styles.marketHeadingText : styles.headingText} key={`line-${idx}`}>
            {line.replace("## ", "")}
          </Text>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <View style={styles.bulletRow} key={`line-${idx}`}>
            <Text style={isMarket ? styles.marketBulletMarker : styles.bulletMarker}>•</Text>
            <Text style={isMarket ? styles.marketBulletText : styles.bulletText}>
              {renderInline(line.replace("- ", ""), variant)}
            </Text>
          </View>
        );
      }
      if (line.trim().length === 0) {
        return <Text style={styles.bodySpacer} key={`line-${idx}`}> </Text>;
      }
      return (
        <Text style={isMarket ? styles.marketBodyText : styles.bodyText} key={`line-${idx}`}>
          {renderInline(line, variant)}
        </Text>
      );
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={[styles.brand, { color: brandColor }]}>
            {formData.brand}
          </Text>
          <Text style={styles.meta}>
            {metaDate}
          </Text>
        </View>
        <Text style={[styles.title, { color: brandColor }]}>{title}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.summary}</Text>
          <View style={styles.richBlock}>
            {renderRichText(formData.sections.inKuerze)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.outlook}</Text>
          <View style={styles.richBlock}>
            {renderRichText(formData.sections.ausblick)}
          </View>
        </View>

        <Text style={styles.pageNumber}>
          {t.page} 1 / 3
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={[styles.title, { color: brandColor }]}>{t.performance}</Text>

        <View style={styles.table}>
          <View style={styles.tableRowHeader}>
            <Text style={styles.tableHeaderCell}>{t.portfolio}</Text>
            <Text style={styles.tableHeaderCell}>{t.ytd}</Text>
          </View>
          {formData.portfolioPerformance.map((row, index) => (
            <View style={styles.tableRow} key={`row-${index}`}>
              <Text style={styles.tableCell}>{row.portfolio}</Text>
              <Text style={styles.tableCell}>{row.ytd.toFixed(1)}%</Text>
            </View>
          ))}
        </View>

        {showAmbassador ? (
          <View style={styles.ambassadorBlock}>
            <Image
              style={styles.ambassadorImage}
              src="https://via.placeholder.com/200x260.png?text=Christian"
            />
            <Text style={styles.ambassadorCaption}>Christian</Text>
          </View>
        ) : null}

        <View style={styles.legalBlock}>
          <Text style={styles.legalTitle}>{t.legal}</Text>
          <Text style={styles.legalBody}>{t.legalBody}</Text>
        </View>

        <Text style={styles.footerDisclaimer}>
          {formData.brand === "ING"
            ? "Die Wertentwicklungen finden Sie auf der Rendite-Seite bei der ING."
            : "Die Wertentwicklungen finden Sie auf unserer Rendite-Seite."}
        </Text>

        <Text style={styles.pageNumber}>
          {t.page} 2 / 3
        </Text>
      </Page>

      <Page size="A4" style={[styles.page, styles.marketPage]}>
        <Text style={styles.marketTitle}>{marketPage.title}</Text>
        <Text style={styles.marketSubtitle}>{marketPage.subtitle}</Text>

        <Text style={styles.marketFootnote}>{marketPage.footnote}</Text>

        <View style={styles.marketAnalysisSection}>
          <Text style={styles.marketSectionLabel}>{marketPage.analysisTitle}</Text>
          <View style={styles.richBlock}>
            {renderRichText(marketPage.analysisBody, "market")}
          </View>
        </View>

        <Text style={[styles.pageNumber, styles.marketPageNumber]}>
          {t.page} 3 / 3
        </Text>
      </Page>
    </Document>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    color: "#111827",
    fontFamily: "Helvetica",
  },
  marketPage: {
    color: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  brand: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  meta: {
    fontSize: 11,
    color: "#6B7280",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginTop: 12,
    marginBottom: 18,
  },
  section: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 11,
    lineHeight: 1.4,
    color: "#1F2937",
  },
  boldText: {
    fontWeight: 700,
  },
  italicText: {
    fontStyle: "italic",
  },
  headingText: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 4,
    color: "#111827",
  },
  richBlock: {
    gap: 4,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  bulletMarker: {
    width: 12,
    fontSize: 11,
    color: "#111827",
  },
  bulletText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.4,
    color: "#1F2937",
  },
  bodySpacer: {
    fontSize: 6,
    marginBottom: 2,
  },
  marketSubtitle: {
    marginTop: -6,
    marginBottom: 10,
    fontSize: 12,
    color: "#000000",
  },
  marketFootnote: {
    marginTop: 2,
    fontSize: 9,
    color: "#000000",
  },
  marketTitle: {
    fontSize: 22,
    fontWeight: 700,
    marginTop: 12,
    marginBottom: 18,
    color: "#000000",
  },
  marketSectionLabel: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
    color: "#000000",
  },
  marketBodyText: {
    fontSize: 11,
    lineHeight: 1.4,
    color: "#000000",
  },
  marketHeadingText: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 4,
    color: "#000000",
  },
  marketBulletMarker: {
    width: 12,
    fontSize: 11,
    color: "#000000",
  },
  marketBulletText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.4,
    color: "#000000",
  },
  marketAnalysisSection: {
    marginTop: 14,
    gap: 2,
  },
  table: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 8,
  },
  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: 700,
    padding: 8,
  },
  tableCell: {
    flex: 1,
    fontSize: 11,
    padding: 8,
  },
  ambassadorBlock: {
    marginTop: 18,
    alignItems: "flex-start",
  },
  ambassadorImage: {
    width: 180,
    height: 230,
    borderRadius: 8,
  },
  ambassadorCaption: {
    fontSize: 10,
    marginTop: 6,
    color: "#6B7280",
  },
  legalBlock: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 6,
  },
  legalTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 4,
  },
  legalBody: {
    fontSize: 9,
    lineHeight: 1.4,
    color: "#4B5563",
  },
  footerDisclaimer: {
    position: "absolute",
    bottom: 38,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#6B7280",
    textAlign: "center",
  },
  pageNumber: {
    position: "absolute",
    bottom: 18,
    right: 40,
    fontSize: 9,
    color: "#9CA3AF",
  },
  marketPageNumber: {
    color: "#000000",
  },
});
