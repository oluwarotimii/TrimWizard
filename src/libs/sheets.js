// /lib/sheets.js
import { google } from 'googleapis';

const sheets = google.sheets('v4');

async function getSheetData(auth) {
  const response = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId: '1mYMBCU0Q-7CTF88jiSzd7UAQNQua9W2q62kG5uXvp8M', // Replace with your Google Sheet ID
    range: 'Sheet1!A:B', // Adjust the range as needed
  });
  return response.data.values;
}

async function addEmail(auth, email) {
  const request = {
    auth,
    spreadsheetId: '1mYMBCU0Q-7CTF88jiSzd7UAQNQua9W2q62kG5uXvp8M',
    range: 'Sheet1!A:A', // Assuming column A is for emails
    valueInputOption: 'RAW',
    resource: {
      values: [[email]],
    },
  };

  await sheets.spreadsheets.values.append(request);
}

export { getSheetData, addEmail };
