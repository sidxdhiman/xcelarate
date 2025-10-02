// src/types/pdfkit.d.ts

declare module "pdfkit" {
    // Export any so TS won't complain about missing types
    const PDFDocument: any;
    export default PDFDocument;
}
