const axios = require('axios');
require('dotenv').config();

async function sendToMonday(data) {
    const query = `
    mutation ($item_name: String!, $column_values: JSON!) {
      create_item (board_id: ${process.env.BOARD_ID}, item_name: $item_name, column_values: $column_values) {
        id
      }
    }
  `;

    // Build column values object - only include fields that have values
    const columnValues = {
        // Project/Address - text column
        text_mkvp3tbt: data.project || '',
        // Work Order Number - numbers column
        numeric_mkvpgyf4: data.wo || '',
        // Purchase Order Number - numbers column
        numeric_mkvpmh9a: data.po || '',
        // Notes - long_text column
        long_text_mkvp79an: data.notes || ''
    };

    // Only add State dropdown if value exists
    // This prevents errors if the dropdown isn't configured in Monday.com
    if (data.state && data.state.trim() !== '') {
        columnValues.dropdown_mkvppn8 = { labels: [data.state] };
    }

    // Only add Status if value exists
    if (data.status && data.status.trim() !== '') {
        columnValues.status = { label: data.status };
    }

    // Only add Date if value exists
    if (data.date && data.date.trim() !== '') {
        columnValues.date4 = { date: data.date };
    }

    const variables = {
        item_name: `${data.project || 'Work Order'} - WO#${data.wo}`,
        column_values: JSON.stringify(columnValues)
    };

    const response = await axios.post(
        "https://api.monday.com/v2",
        { query, variables },
        { headers: { Authorization: process.env.MONDAY_API_TOKEN } }
    );

    console.log('Monday.com response:', response.data);

    // CRITICAL: Check if Monday.com returned errors
    if (response.data.errors && response.data.errors.length > 0) {
        const errorMessages = response.data.errors.map(err => err.message).join(', ');
        throw new Error(`Monday.com API error: ${errorMessages}`);
    }

    // CRITICAL: Check if create_item is null (indicates failure)
    if (!response.data.data || !response.data.data.create_item) {
        throw new Error('Monday.com failed to create item - create_item is null');
    }

    return response.data;
}

module.exports = { sendToMonday };
