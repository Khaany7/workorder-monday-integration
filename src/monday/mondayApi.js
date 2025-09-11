const imaps = require("imap-simple");
const { simpleParser } = require("mailparser");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const axios = require("axios");
require("dotenv").config();

const config = {
  imap: {
    user: process.env.EMAIL,
    password: process.env.PASSWORD,
    host: process.env.IMAP_SERVER,
    port: 993,
    tls: true,
    authTimeout: 3000,
  },
};

async function fetchEmailsAndProcess() {
  const connection = await imaps.connect(config);
  await connection.openBox("INBOX");
  const searchCriteria = ["UNSEEN"];
  const fetchOptions = { bodies: [""], struct: true };
  const messages = await connection.search(searchCriteria, fetchOptions);

  // Sort messages by date (latest first)
  messages.sort((a, b) => {
    const dateA = new Date(a.attributes.date);
    const dateB = new Date(b.attributes.date);
    return dateB - dateA;
  });

  // Only process the first (latest) email
  if (messages.length > 0) {
    const item = messages[0];
    const all = item.parts.find((part) => part.which === "");
    const mail = await simpleParser(all.body);

    for (const att of mail.attachments || []) {
      if (att.contentType === "application/pdf") {
        const pdfPath = `./work_order_${Date.now()}.pdf`;
        fs.writeFileSync(pdfPath, att.content);
        const workOrderDetails = await extractDataFromPDF(pdfPath);
        await sendToMonday(workOrderDetails);
        fs.unlinkSync(pdfPath); // Clean up
        break; // Only process the first PDF in the latest email
      }
    }
  }
  await connection.end();
}

async function extractDataFromPDF(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  const text = data.text;
  console.log("PDF TEXT:", text);

  // Project: Try address block, then fallback to WO/PO line
  let project = '';
  const projectBlock = /Oneway\s+([^\n]+)\n([^\n]+)\n([^\n]+, [A-Z]{2} \d{5})/i.exec(text);
  if (projectBlock) {
    project = `Oneway ${projectBlock[1].trim()} ${projectBlock[2].trim()} ${projectBlock[3].trim()}`;
  } else {
    const projectLine = /WO\/PO\s+(.+?), WO/i.exec(text);
    if (projectLine) project = projectLine[1].trim();
  }

  // WO#: Try "K3D Work Order: ..." then "WO 914578"
  let wo = '';
  const woMatch1 = /K3D Work Order:\s*(\d+)/i.exec(text);
  const woMatch2 = /WO\s*(\d{6,})/i.exec(text);
  if (woMatch1) wo = woMatch1[1].trim();
  else if (woMatch2) wo = woMatch2[1].trim();

  // PO#: Try "P.O. #: ..." then "PO 454300"
  let po = '';
  const poMatch1 = /P\.O\. #:\s*(\d+)/i.exec(text);
  const poMatch2 = /PO\s*(\d{6,})/i.exec(text);
  if (poMatch1) po = poMatch1[1].trim();
  else if (poMatch2) po = poMatch2[1].trim();

  // State: Find two uppercase letters before ZIP
  let state = '';
  const stateMatch = /([A-Z]{2})\s*\d{5}/.exec(text);
  if (stateMatch) state = stateMatch[1].trim();

  // Notes: Try to get everything after "Remarks:" or "Instructions:" or "Message Received in the email:"
  let notes = '';
  const notesMatch =
    /Remarks:\s*([\s\S]*?)\n{2,}/i.exec(text) ||
    /Instructions:\s*([\s\S]*?)\n{2,}/i.exec(text) ||
    /Message Received in the email:(.*)$/is.exec(text);
  if (notesMatch) notes = notesMatch[1].trim();

  // PM: Try to get after "Ordered By:" or "Confirm By:"
  let pm = '';
  const pmMatch = /Ordered By:\s*([^\n]*)/i.exec(text);
  if (pmMatch) pm = pmMatch[1].trim();

  return {
    project,
    pm,
    wo,
    po,
    state,
    notes
  };
}

function mapStatus(status) {
  if (!status) return "Working on it";
  // Add more mapping logic if needed
  if (status.toLowerCase().includes("done")) return "Done";
  if (status.toLowerCase().includes("stuck")) return "Stuck";
  return "Working on it";
}

async function sendToMonday(data) {
  const query = `
    mutation ($item_name: String!, $column_values: JSON!) {
      create_item (board_id: ${process.env.BOARD_ID}, item_name: $item_name, column_values: $column_values) {
        id
      }
    }
  `;
  const variables = {
    item_name: data.project || 'Work Order',
    column_values: JSON.stringify({
      text_mkvp3tbt: data.project,                  // Project
      numeric_mkvpgyf4: data.wo,                    // WO#
      numeric_mkvpmh9a: data.po,                    // PO#
      dropdown_mkvpmk7c: data.state,                // State
      long_text_mkvp79an: data.notes                // Notes
    })
  };

  const response = await axios.post(
    "https://api.monday.com/v2",
    { query, variables },
    { headers: { Authorization: process.env.MONDAY_API_TOKEN } }
  );
  console.log(response.data);
}

module.exports = { fetchEmailsAndProcess, sendToMonday };
