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

export default function PdfDocument({ formData, chartUrl }) {
  const t = dictionary[formData.language] || dictionary.de;
  const brandColor = formData.brand === "ING" ? "#FF6200" : "#FF7A00";
  const title = formData.brand === "ING" ? "Smart Invest" : formData.reportType;
  const showAmbassador = formData.brand === "Scalable";

  const renderInline = (text) => {
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
          styles.bodyText,
          part.mode === "bold" && styles.boldText,
          part.mode === "italic" && styles.italicText,
        ]}
      >
        {part.text}
      </Text>
    ));
  };

  const renderRichText = (value) => {
    return value.split("\n").map((line, idx) => {
      if (line.startsWith("## ")) {
        return (
          <Text style={styles.headingText} key={`line-${idx}`}>
            {line.replace("## ", "")}
          </Text>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <View style={styles.bulletRow} key={`line-${idx}`}>
            <Text style={styles.bulletMarker}>•</Text>
            <Text style={styles.bulletText}>
              {renderInline(line.replace("- ", ""))}
            </Text>
          </View>
        );
      }
      if (line.trim().length === 0) {
        return <Text style={styles.bodySpacer} key={`line-${idx}`}> </Text>;
      }
      return (
        <Text style={styles.bodyText} key={`line-${idx}`}>
          {renderInline(line)}
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
            {formData.quarter} {formData.year}
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

        <View style={styles.chartBlock}>
          <Text style={styles.sectionLabel}>Asset Performance</Text>
          <Image style={styles.chartImage} src={chartUrl} />
        </View>

        <Text style={styles.pageNumber}>
          {t.page} 1 / 2
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
          {t.page} 2 / 2
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
  chartBlock: {
    marginTop: 8,
  },
  chartImage: {
    marginTop: 6,
    width: 480,
    height: 220,
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
});
