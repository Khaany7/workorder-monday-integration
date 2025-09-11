const imaps = require("imap-simple");
const { simpleParser } = require("mailparser");
const fs = require("fs");
const { extractDataFromPDF } = require("../pdf/pdfExtractor");
require("dotenv").config();

const config = {
  imap: {
    user: process.env.EMAIL,
    password: process.env.PASSWORD,
    host: process.env.IMAP_SERVER,
    port: 993,
    tls: true,
    authTimeout: 3000,
    tlsOptions: { rejectUnauthorized: false },
  },
};

async function fetchPDFAttachments(limit = 1) {
  const connection = await imaps.connect(config);
  await connection.openBox("INBOX");
  const searchCriteria = ["ALL"];
  const fetchOptions = { bodies: [""], struct: true };
  const messages = await connection.search(searchCriteria, fetchOptions);

  // Sort emails by date (latest first)
  messages.sort((a, b) => {
    const dateA = new Date(a.attributes.date);
    const dateB = new Date(b.attributes.date);
    return dateB - dateA;
  });

  const pdfPaths = [];
  let count = 0;
  for (const item of messages) {
    if (count >= limit) break;
    const all = item.parts.find((part) => part.which === "");
    const mail = await simpleParser(all.body);

    if (!mail.subject || !mail.subject.includes("Work Order")) continue;

    for (const att of mail.attachments || []) {
      if (att.contentType === "application/pdf") {
        const pdfPath = `./work_order_${Date.now()}_${count}.pdf`;
        fs.writeFileSync(pdfPath, att.content);
        pdfPaths.push(pdfPath);
        count++;
        if (count >= limit) break; // Stop after 3 PDFs
      }
    }
  }

  await connection.end();
  return pdfPaths;
}

module.exports = { fetchPDFAttachments };
