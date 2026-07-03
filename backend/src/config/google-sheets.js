'use strict';

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

/**
 * Google Sheets Integration — Reads cost data from the team's spreadsheet.
 * Service Account: hackathon@gestion-estrategica-ti.iam.gserviceaccount.com
 * Spreadsheet ID: 12dLt8HxxVYp7eM-hXZO4gdfaoraN4HL9AxVSq0akOMM
 */

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || '12dLt8HxxVYp7eM-hXZO4gdfaoraN4HL9AxVSq0akOMM';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

/**
 * Get authenticated Google Sheets client.
 * Supports two methods:
 * 1. GOOGLE_CREDENTIALS_JSON env var (base64 encoded JSON)
 * 2. credentials.json file in backend/config/
 * @returns {Promise<import('googleapis').sheets_v4.Sheets>}
 */
const getSheetsClient = async () => {
  let auth;

  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    // From base64 env var (production / Docker)
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_CREDENTIALS_JSON, 'base64').toString('utf-8')
    );
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });
  } else {
    // From file (local development)
    const credentialsPath = path.join(__dirname, '..', '..', 'credentials.json');
    if (!fs.existsSync(credentialsPath)) {
      throw new Error(
        'No se encontraron credenciales de Google. ' +
        'Coloca credentials.json en backend/ o define GOOGLE_CREDENTIALS_JSON como variable de entorno.'
      );
    }
    auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: SCOPES,
    });
  }

  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
};

/**
 * Read a range from the spreadsheet.
 * @param {string} range - Sheet range (e.g., "Sheet1!A1:Z100" or "Costos AI!A:F")
 * @returns {Promise<Array<Array<string>>>} Rows of data
 */
const readRange = async (range) => {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range,
  });

  return response.data.values || [];
};

/**
 * Get all sheet names in the spreadsheet.
 * @returns {Promise<Array<string>>} Sheet/tab names
 */
const getSheetNames = async () => {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    fields: 'sheets.properties.title',
  });

  return response.data.sheets.map((s) => s.properties.title);
};

/**
 * Read all data from a specific sheet tab.
 * @param {string} sheetName - Name of the tab
 * @returns {Promise<{headers: string[], rows: Array<object>}>}
 */
const readSheet = async (sheetName) => {
  const data = await readRange(`${sheetName}!A:ZZ`);

  if (data.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = data[0];
  const rows = data.slice(1).map((row) => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] || '';
    });
    return obj;
  });

  return { headers, rows };
};

module.exports = {
  SPREADSHEET_ID,
  getSheetsClient,
  readRange,
  getSheetNames,
  readSheet,
};
