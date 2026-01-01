const fs = require('fs');
const pdfParse = require('pdf-parse');

async function extractDataFromPDF(pdfPath) {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;

    let project = '';
    const projectBlock = /Oneway\s+([^\n]+)\n([^\n]+)\n([^\n]+, [A-Z]{2} \d{5})/i.exec(text);
    if (projectBlock) {
        project = `Oneway ${projectBlock[1].trim()} ${projectBlock[2].trim()} ${projectBlock[3].trim()}`;
    } else {
        const projectLine = /WO\/PO\s+(.+?), WO/i.exec(text);
        if (projectLine) project = projectLine[1].trim();
    }

    let wo = '';
    const woMatch1 = /K3D Work Order:\s*(\d+)/i.exec(text);
    const woMatch2 = /WO\s*(\d{6,})/i.exec(text);
    if (woMatch1) wo = woMatch1[1].trim();
    else if (woMatch2) wo = woMatch2[1].trim();

    let po = '';
    const poMatch1 = /P\.O\. #:\s*(\d+)/i.exec(text);
    const poMatch2 = /PO\s*(\d{6,})/i.exec(text);
    if (poMatch1) po = poMatch1[1].trim();
    else if (poMatch2) po = poMatch2[1].trim();

    let state = '';
    const stateMatch = /([A-Z]{2})\s*\d{5}/.exec(text);
    if (stateMatch) state = stateMatch[1].trim();

    let notes = '';
    const notesMatch = /Remarks:\s*([\s\S]*?)\n{2,}/i.exec(text) || /Instructions:\s*([\s\S]*?)\n{2,}/i.exec(text);
    if (notesMatch) notes = notesMatch[1].trim();

    let pm = '';
    const pmMatch = /Ordered By:\s*([^\n]*)/i.exec(text);
    if (pmMatch) pm = pmMatch[1].trim();

    return { project, pm, wo, po, state, notes };
}

module.exports = { extractDataFromPDF };
