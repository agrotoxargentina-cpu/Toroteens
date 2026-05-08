const { google } = require('googleapis');

const SHEET_NAME = 'Escaneos';

async function getAuth() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function ensureHeaders(sheets, spreadsheetId) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_NAME}!A1:H1`,
  });

  if (!res.data.values || res.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          ['Fecha/Hora', 'Seguridad', 'Nombre', 'DNI', 'Nacimiento', 'Resultado', 'Detalle'],
        ],
      },
    });
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    await ensureHeaders(sheets, spreadsheetId);

    const now = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAME}!A:G`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [
          [
            now,
            data.guard_name || '',
            data.person_name || '',
            data.person_dni || '',
            data.person_birthdate || '',
            data.result_color?.toUpperCase() || '',
            data.result_message || '',
          ],
        ],
      },
    });

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
