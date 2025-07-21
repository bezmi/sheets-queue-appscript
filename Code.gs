// A "private" sheet to store session names and their secret keys.
const KEY_SHEET_NAME = '_session_keys';
// A "private" sheet to store configuration for each session.
const CONFIG_SHEET_NAME = '_session_configs';
// --- IMPORTANT --- Set your secret password here.
const PRE_SHARED_PASSWORD = "change-this-secret-password";

/**
 * Helper function to get the configuration for a given session.
 * Returns default values if no specific config is found.
 */
function getSessionConfig(spreadsheet, sessionName) {
    const defaultConfig = { maxActive: 1, warningMinutes: 5 };
    const configSheet = spreadsheet.getSheetByName(CONFIG_SHEET_NAME);
    if (!configSheet) {
        return defaultConfig;
    }
    const data = configSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === sessionName) {
            return {
                maxActive: data[i][1] || defaultConfig.maxActive,
                warningMinutes: data[i][2] || defaultConfig.warningMinutes
            };
        }
    }
    return defaultConfig;
}

/**
 * Handles GET requests to READ queue data AND configuration for an EXISTING session.
 */
function doGet(e) {
    try {
        const sessionName = e.parameter.session;
        if (!sessionName) { throw new Error("Session name not provided."); }
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        const sheet = spreadsheet.getSheetByName(sessionName);
        let queueData = [];
        if (sheet) {
            queueData = sheet.getDataRange().getValues();
        }
        const config = getSessionConfig(spreadsheet, sessionName);
        return ContentService.createTextOutput(JSON.stringify({ result: 'success', queue: queueData, config: config })).setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ result: 'error', message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Handles ALL write actions: creating sessions, updating config, adding users, etc.
 */
function doPost(e) {
    try {
        const params = e.parameter;
        const action = params.action || 'add';
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

        // --- PUBLIC ACTIONS (NO KEY REQUIRED) ---

        // Action: Create or get a key for a session (Tutor Login)
        if (action === 'create_session') {
            const sessionName = params.session;
            const password = params.password;
            if (password !== PRE_SHARED_PASSWORD) { throw new Error("Invalid Password."); }
            if (!sessionName) { throw new Error("Session Name cannot be empty."); }
            return createOrUpdateSession(spreadsheet, sessionName);
        }

        // Action: Add a new student to the queue
        if (action === 'add') {
            const sessionName = params.session;
            const studentName = params.name;
            const sheet = spreadsheet.getSheetByName(sessionName);
            if (!sheet) { throw new Error("Session not found. It must be created by the tutor first."); }
            if (!studentName) { throw new Error("Student name is missing."); }
            const existingNames = sheet.getDataRange().getValues().slice(1).map(row => row[0].trim().toLowerCase());
            if (existingNames.includes(studentName.trim().toLowerCase())) {
                throw new Error("Name already exists in the queue.");
            }
            sheet.appendRow([studentName, new Date().toISOString(), '']);
            return ContentService.createTextOutput(JSON.stringify({ result: 'success' })).setMimeType(ContentService.MimeType.JSON);
        }

        // --- PRIVATE ADMIN ACTIONS (KEY REQUIRED FROM THIS POINT ON) ---

        const sessionName = params.session;
        const key = params.key;
        if (!validateKey(spreadsheet, sessionName, key)) {
            throw new Error("Unauthorized: Invalid session key.");
        }

        // Action: Update session configuration
        if (action === 'update_config') {
            const configKey = params.configKey;
            const configValue = params.configValue;
            updateSessionConfig(spreadsheet, sessionName, configKey, configValue);
            return ContentService.createTextOutput(JSON.stringify({ result: 'success' })).setMimeType(ContentService.MimeType.JSON);
        }
        
        const sheet = spreadsheet.getSheetByName(sessionName); // Re-get sheet just in case

        // Action: Start a student's timer
        if (action === 'start') {
            const rowIndex = params.rowIndex;
            sheet.getRange(parseInt(rowIndex), 3).setValue(new Date().toISOString());
            return ContentService.createTextOutput(JSON.stringify({ result: 'success' })).setMimeType(ContentService.MimeType.JSON);
        }
        
        // Action: Delete a student
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


function updateSessionConfig(spreadsheet, sessionName, configKey, configValue) {
    let configSheet = spreadsheet.getSheetByName(CONFIG_SHEET_NAME);
    if (!configSheet) {
        configSheet = spreadsheet.insertSheet(CONFIG_SHEET_NAME);
        configSheet.hideSheet();
        configSheet.appendRow(['Session Name', 'maxActive', 'warningMinutes']);
    }
    const data = configSheet.getDataRange().getValues();
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === sessionName) {
            rowIndex = i + 1;
            break;
        }
    }
    const colIndex = configKey === 'maxActive' ? 2 : configKey === 'warningMinutes' ? 3 : -1;
    if (colIndex === -1) return;
    if (rowIndex !== -1) {
        configSheet.getRange(rowIndex, colIndex).setValue(configValue);
    } else {
        const newRow = [sessionName, '', ''];
        newRow[colIndex - 1] = configValue;
        configSheet.appendRow(newRow);
    }
}

function createOrUpdateSession(spreadsheet, sessionName) {
  let sessionSheet = spreadsheet.getSheetByName(sessionName);
  if (!sessionSheet) {
    sessionSheet = spreadsheet.insertSheet(sessionName);
    sessionSheet.appendRow(['Student Name', 'Join Timestamp', 'Active Start Timestamp']);
  }
  const newKey = Utilities.getUuid();
  let keySheet = spreadsheet.getSheetByName(KEY_SHEET_NAME);
  if (!keySheet) {
    keySheet = spreadsheet.insertSheet(KEY_SHEET_NAME);
    keySheet.hideSheet();
    keySheet.appendRow(['Session Name', 'Session Key']);
  }
  const sessionNames = keySheet.getRange('A:A').getValues();
  let found = false;
  for (let i = 1; i < sessionNames.length; i++) {
    if (sessionNames[i][0] === sessionName) {
      keySheet.getRange(i + 1, 2).setValue(newKey);
      found = true;
      break;
    }
  }
  if (!found) {
    keySheet.appendRow([sessionName, newKey]);
  }
  return ContentService.createTextOutput(JSON.stringify({ result: 'success', key: newKey })).setMimeType(ContentService.MimeType.JSON);
}

function validateKey(spreadsheet, sessionName, key) {
  const keySheet = spreadsheet.getSheetByName(KEY_SHEET_NAME);
  if (!keySheet) return false;
  const data = keySheet.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === sessionName && data[i][1] === key) {
      return true;
    }
  }
  return false;
}
