# PDF Generator Workshop Task

Interactive React app for editing report content and generating a multi-page PDF preview.

## Tech Stack

- React 18
- Vite 5
- `@react-pdf/renderer`
- Tailwind CSS

## Features

- Sidebar editor for report data:
  - language and brand
  - report metadata (title, quarter/year, manual report date)
  - rich-text sections (`In Kürze`, `Ausblick`)
  - portfolio performance rows
  - market page content (title, subtitle, footnote, analysis)
- Live PDF preview panel (embedded `PDFViewer`)
- Manual generation flow:
  - editing data does **not** regenerate the PDF immediately
  - click `GENERATE` to apply all changes to preview
  - `GENERATE` is disabled when there are no pending changes

## Project Structure

- `src/App.jsx` - app layout and generation state flow (`formData` vs `generatedData`)
- `src/EditorSidebar.jsx` - all editing controls and `GENERATE` button
- `src/PdfDocument.jsx` - PDF template and page rendering
- `src/index.css` - global and Tailwind-driven styles

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm

### Install

```bash
npm install
```

### Run Dev Server

```bash
npm run dev
```

Open the local Vite URL shown in terminal (usually `http://localhost:5173`).

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How Editing Works

1. Update values in the left sidebar.
2. Click `GENERATE` to regenerate the PDF preview on the right.
3. Repeat as needed.

This split prevents expensive PDF rerendering on every keystroke.

## Notes

- PDF currently renders 3 pages.
- Market page text is styled in black.
- `src/MarketReportPage.jsx` exists in the repository but is not part of the active rendering flow.
