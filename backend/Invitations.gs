/**
 * OUR GLASS — invitation contact intake.
 *
 * Add this as a NEW script file named Invitations.gs inside the existing
 * OUR GLASS Payment Intake Apps Script project.
 * Project Settings > Script Properties must include:
 *   OURGLASS_INVITATIONS_SHEET_ID = ID of the private "OUR GLASS — Private Invitations" spreadsheet.
 *
 * Uses a plain browser form POST, so no Google account is required.
 * Keep the spreadsheet private. Deploy a NEW VERSION of the existing web app.
 */
function doPost(e) {
  const p = e && e.parameter ? e.parameter : {};
  if (p.formType === 'donate') return donationWebPost_(p);
  if (p.formType !== 'invite') {
    return invitationResponse_(false, 'This submission route is unavailable.');
  }
  try {
    // Honeypot: never acknowledge bot-supplied submissions as stored.
    if (p.website) return invitationResponse_(false, 'Unable to accept this submission.');
    if (p.consent !== 'yes') throw new Error('Please agree before submitting.');

    const name = inviteSafeText_(p.fullName, 120);
    const email = String(p.email || '').trim().toLowerCase();
    const mobile = inviteSafeText_(p.mobile, 35);
    const inviter = inviteSafeText_(p.invitedBy, 120);
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !inviter || (mobile && !/^[+0-9 ()-]{7,35}$/.test(mobile))) {
      throw new Error('Please check your name, email, phone number, and who invited you.');
    }
    const sheetId = PropertiesService.getScriptProperties().getProperty('OURGLASS_INVITATIONS_SHEET_ID');
    if (!sheetId) throw new Error('The invitation intake is not configured yet.');

    const lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) throw new Error('The service is busy. Please try again.');
    try {
      const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Invitations');
      if (!sheet) throw new Error('Invitation storage is not configured.');
      const now = new Date();
      const today = Utilities.formatDate(now, 'Etc/UTC', 'yyyy-MM-dd');
      const last = sheet.getLastRow();
      // Basic spam/retry protection; not a replacement for monitoring and stronger controls.
      if (last > 1) {
        const n = Math.min(last - 1, 250);
        const rows = sheet.getRange(last - n + 1, 2, n, 3).getValues();
        let count = 0;
        for (const row of rows) {
          const timestamp = row[0] instanceof Date ?
            Utilities.formatDate(row[0], 'Etc/UTC', 'yyyy-MM-dd') : String(row[0]).slice(0, 10);
          if (String(row[2]).replace(/^'/,'').toLowerCase() === email && timestamp === today) count++;
        }
        if (count >= 3) throw new Error('Too many submissions today. Please contact us by email.');
      }
      const id = 'OGI-' + Utilities.getUuid().slice(0, 16).toUpperCase();
      sheet.appendRow([
        id,
        now.toISOString(),
        inviteSheetText_(name),
        inviteSheetText_(email),
        inviteSheetText_(mobile),
        'Yes',
        'Pending association',
        inviteSheetText_('Website form | Invited by: ' + inviter)
      ]);
      // An invitation submission is contact intake only, not authorization
      // to announce a death, and is not linked to a verified owner account.
      return invitationResponse_(true,
        'Your details were received. Please keep your reference: ' + id +
        '. We will associate your contact details with the correct invitation during secure setup.');
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return invitationResponse_(false, err && err.message ?
      String(err.message) : 'Submission could not be completed. Please try again.');
  }
}
function inviteSafeText_(value, maxLen) {
  return String(value || '').trim().replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, maxLen);
}
function inviteSheetText_(value) {
  const s = String(value || '');
  return /^[=+@-]/.test(s) ? "'" + s : s;
}
function invitationEscape_(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function invitationResponse_(success, message) {
  const heading = success ? 'Details received' : 'Submission not completed';
  return HtmlService.createHtmlOutput(
    '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>OUR GLASS — ' + heading + '</title>' +
    '<style>body{background:#fcfbf9;color:#302a25;font:16px/1.6 Arial,sans-serif;margin:0;padding:clamp(25px,6vw,70px)}' +
    'main{max-width:560px;margin:8vh auto}h1{font:italic 500 46px/1.1 Georgia,serif}' +
    'a{color:#4b4540;text-decoration:underline}</style></head><body><main>' +
    '<p>OUR GLASS · The Afterword Concierge</p><h1>' + heading + '</h1><p>' +
    invitationEscape_(message) + '</p>' +
    '<p><a href="https://ourglass.barbph.com/invite.html">Return to OUR GLASS</a></p>' +
    '</main></body></html>'
  ).setTitle('OUR GLASS — ' + heading);
}

/**
 * Receives the restored Smart Move form via a normal cross-origin HTML POST.
 * Native navigation does not require CORS access or a Google account.
 * Do not publish a confirmation until proofSubmit has saved both the file
 * and spreadsheet row successfully.
 */
function donationWebPost_(p) {
  try {
    if (!p || p.website) throw new Error('Submission not accepted.');
    if (p.consent !== 'yes') throw new Error('Consent is required.');
    const result = proofSubmit({
      name: p.name,
      email: p.email,
      phone: p.phone,
      reference: p.reference,
      amount: p.amount,
      mime: p.mime,
      base64: p.base64,
      consent: true,
      website: ''
    });
    if (!result || result.ok !== true || !result.submissionId)
      throw new Error('The submission could not be verified as received. Please try again.');
    return donationWebResponse_(true, 'Proof received. Reference: ' +
      result.submissionId + '. Your submission is Pending Verification. ' +
      'Payment has NOT been confirmed. Keep your reference for your records.');
  } catch (err) {
    return donationWebResponse_(false, err && err.message ?
      String(err.message) : 'The submission could not be completed. Please try again.');
  }
}
function donationWebResponse_(success, message) {
  const title = success ? 'Payment proof received' : 'Submission not completed';
  return HtmlService.createHtmlOutput(
    '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>OUR GLASS — ' + title + '</title>' +
    '<style>body{margin:0;padding:clamp(25px,6vw,65px);font:16px/1.7 Arial,sans-serif;' +
    'background:#fcfbf9;color:#302a25}main{max-width:580px;margin:6vh auto}' +
    'h1{font:italic 500 clamp(39px,6vw,56px)/1.08 Georgia,serif}' +
    'a{color:#50483f;text-underline-offset:4px}</style></head><body><main>' +
    '<p>OUR GLASS · The Afterword Concierge</p><h1>' + title + '</h1><p>' +
    invitationEscape_(message) + '</p>' +
    '<p><a href="https://ourglass.barbph.com/">Return to The Afterword Concierge</a></p>' +
    '</main></body></html>'
  ).setTitle('OUR GLASS — ' + title);
}
