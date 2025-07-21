// --- CONFIGURATION ---
// SET YOUR OWN SECRET PASSWORD HERE. This is used to create or gain admin access to sessions.
const PRE_SHARED_PASSWORD = "change-this-secret-password";
const KEY_SHEET_NAME = '_session_keys';

// Handles GET requests (for the session page to read data)
function doGet(e) {
  try {
    const sessionName = e.parameter.session || 'default';
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sessionName);
    if (!sheet) {
      // doGet no longer creates sessions. It only reads. Creation is handled by a POST action.
      return ContentService.createTextOutput(JSON.stringify({ result: 'error', message: 'Session not found.' })).setMimeType(ContentService.MimeType.JSON);
    }
    const data = sheet.getDataRange().getValues();
    return ContentService.createTextOutput(JSON.stringify({ result: 'success', queue: data })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handles all POST requests (creating sessions, adding users, starting/deleting)

function doPost(e) {
  try {
    const params = e.parameter;
    const action = params.action || 'add';

    if (action === 'create_session') {
      const sessionName = params.session;
      const password = params.password;
      if (password !== PRE_SHARED_PASSWORD) { throw new Error("Invalid Password."); }
      if (!sessionName) { throw new Error("Session Name cannot be empty."); }
      return createOrUpdateSession(sessionName);
    }

    const sessionName = params.session;
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sessionName);
    if (!sheet) {
      throw new Error("Session not found. It must be created by the tutor first.");
    }

    if (action === 'add') {
      const studentName = params.name;
      if (!studentName) throw new Error("Student name is missing.");
      sheet.appendRow([studentName, new Date().toISOString(), '']);
      return ContentService.createTextOutput(JSON.stringify({ result: 'success' })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const key = params.key;
    if (!validateKey(sessionName, key)) {
      throw new Error("Unauthorized: Invalid session key.");
    }

    if (action === 'start') {
      const rowIndex = params.rowIndex;
      sheet.getRange(parseInt(rowIndex), 3).setValue(new Date().toISOString());
      return ContentService.createTextOutput(JSON.stringify({ result: 'success' })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'delete') {
      const rowIndex = params.rowIndex;
      sheet.deleteRow(parseInt(rowIndex));
      return ContentService.createTextOutput(JSON.stringify({ result: 'success' })).setMimeType(ContentService.MimeType.JSON);
    }
    
    throw new Error("Invalid action specified.");

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function createOrUpdateSession(sessionName) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const newKey = Utilities.getUuid();
  let keySheet = spreadsheet.getSheetByName(KEY_SHEET_NAME);
  if (!keySheet) {
    keySheet = spreadsheet.insertSheet(KEY_SHEET_NAME).hideSheet();
  }

  // Check if session already exists in the key sheet to update it
  const data = keySheet.getDataRange().getValues();
  let sessionRow = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === sessionName) {
      sessionRow = i + 1;
      break;
    }
  }

  if (sessionRow > -1) {
    // Session exists, update its key (voids old key)
    keySheet.getRange(sessionRow, 2).setValue(newKey);
  } else {
    // Session is brand new, append it
    keySheet.appendRow([sessionName, newKey]);
  }

  // Also create the actual session sheet if it doesn't exist
  let sessionSheet = spreadsheet.getSheetByName(sessionName);
  if (!sessionSheet) {
    sessionSheet = spreadsheet.insertSheet(sessionName);
    sessionSheet.appendRow(['Student Name', 'Join Timestamp', 'Active Start Timestamp']);
  }

  // Return the new key so the client can redirect
  return ContentService.createTextOutput(JSON.stringify({ result: 'success', newKey: newKey })).setMimeType(ContentService.MimeType.JSON);
}

function validateKey(sessionName, key) {
  // This function remains the same, it's the gatekeeper for all admin actions.
  const keySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(KEY_SHEET_NAME);
  if (!keySheet || !key) return false;
  const data = keySheet.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === sessionName && data[i][1] === key) {
      return true;
    }
  }
  return false;
}
