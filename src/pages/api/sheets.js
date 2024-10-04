import { google } from 'googleapis';

const sheets = google.sheets('v4');

async function authenticate() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'trimmer.json', // Path to the service account key file
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return await auth.getClient();
  } catch (error) {
    console.error('Failed to authenticate:', error);
    throw new Error('Google Sheets authentication failed');
  }
}

async function checkEmailExists(email) {
  try {
    const auth = await authenticate();
    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: '1mYMBCU0Q-7CTF88jiSzd7UAQNQua9W2q62kG5uXvp8M', // Your Spreadsheet ID
      range: 'Sheet1!A:A', // Range to fetch data from (column A)
    });
    const emails = response.data.values || [];
    return emails.some(row => row[0].toLowerCase() === email.toLowerCase());
  } catch (error) {
    console.error('Failed to fetch sheet data:', error);
    throw new Error('Failed to check email existence');
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      const exists = await checkEmailExists(email);
      res.status(200).json({ exists });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}