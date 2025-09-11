const { fetchPDFAttachments } = require('./email/emailService');
const { extractDataFromPDF } = require('./pdf/pdfExtractor');
const { formatWorkOrderData } = require('./utils/formatter');
const { sendToMonday } = require('./monday/mondayApi');
const fs = require('fs');

async function main() {
  const pdfPaths = await fetchPDFAttachments(3);
  console.log("Fetched PDF paths:", pdfPaths);
  for (const pdfPath of pdfPaths) {
    const rawData = await extractDataFromPDF(pdfPath);
    console.log("Extracted data:", rawData);
    const formattedData = formatWorkOrderData(rawData);
    await sendToMonday(formattedData);
    fs.unlinkSync(pdfPath); // Clean up
  }
}

main().catch(console.error);