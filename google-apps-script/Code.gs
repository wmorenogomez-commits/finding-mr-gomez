/**
 * Google Apps Script for Finding Mr. Gomez
 * 
 * SETUP:
 * 1. Create Google Sheet "Finding Mr Gomez Results"
 * 2. Create tabs: Period1 and Period3
 * 3. Headers in row 1 of each tab:
 *    Timestamp | SubmissionId | Name | Period | FinalScore | NurseScore | LibraryScore | CafeteriaScore | OfficeScore | CounselingScore | LoungeScore | TotalIncorrect | CompletionStatus | AnswersJSON
 * 4. Extensions > Apps Script → paste this code → Save
 * 5. Deploy → New deployment → Web app
 *    Execute as: Me
 *    Who has access: Anyone
 * 6. Copy the Web App URL into js/config.js as APPS_SCRIPT_URL
 * 7. Keep the Sheet private (share only with teachers)
 */

function doPost(e) {
  try {
    let raw = '';
    if (e.postData && e.postData.contents) {
      raw = e.postData.contents;
    } else if (e.parameter && e.parameter.data) {
      raw = e.parameter.data;
    }
    const data = JSON.parse(raw || '{}');
    const period = String(data.period || '1');
    const sheetName = period === '3' ? 'Period3' : 'Period1';
    const submissionId = data.submissionId || '';

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow([
        'Timestamp', 'SubmissionId', 'Name', 'Period', 'FinalScore',
        'NurseScore', 'LibraryScore', 'CafeteriaScore', 'OfficeScore',
        'CounselingScore', 'LoungeScore', 'TotalIncorrect', 'CompletionStatus', 'AnswersJSON'
      ]);
    }

    // Prevent duplicate submissions
    if (submissionId) {
      const ids = sheet.getRange(2, 2, Math.max(sheet.getLastRow() - 1, 1), 1).getValues().flat();
      if (ids.includes(submissionId)) {
        return ContentService
          .createTextOutput(JSON.stringify({ success: true, already: true }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    const ms = data.missionScores || {};
    const row = [
      new Date(),
      submissionId,
      data.name || 'Unknown',
      period,
      data.finalScore || 0,
      ms.nurse || 0,
      ms.library || 0,
      ms.cafeteria || 0,
      ms.office || 0,
      ms.counseling || 0,
      ms.lounge || 0,
      data.totalIncorrect || 0,
      data.completionStatus || 'Unknown',
      JSON.stringify(data.answers || {})
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput('Finding Mr. Gomez Results Web App is running.');
}
