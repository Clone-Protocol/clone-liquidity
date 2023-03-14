import { GoogleSpreadsheet } from "google-spreadsheet";

export const getGoogleSheetsDoc = async () => {
  const doc = new GoogleSpreadsheet(process.env.NEXT_PUBLIC_GOOGLE_SHEETS_DOCUMENT_ID!);
  doc.useApiKey(process.env.NEXT_PUBLIC_GOOGLE_SHEETS_GOOGLE_API_KEY!);
  await doc.loadInfo();
  return doc
}