/**
 * OUR GLASS — Google Apps Script screenshot intake
 * Create a standalone Google Apps Script project in industries@barbph.com,
 * paste Code.gs and Upload.html, then configure project Script Properties:
 *   OURGLASS_SHEET_ID   = ID of private Donations spreadsheet
 *   OURGLASS_PROOFS_ID  = ID of private Payment Proofs folder
 *   OURGLASS_QR_FILE_ID = ID of approved QR image in Drive
 * Deploy as Web app: execute as owner; access anyone.
 * Do NOT store private IDs in the public GitHub repository.
 */
const OG = { sheetName:'Donations', maxBytes:4*1024*1024, maxSubmissionsPerDay:3 };
function doGet() {
  const qrId=PropertiesService.getScriptProperties().getProperty('OURGLASS_QR_FILE_ID');
  if(!qrId) {
    return HtmlService.createHtmlOutput('<main style="font:16px/1.6 Arial;padding:30px;max-width:480px;margin:auto"><h1>OUR GLASS</h1><p>The GCash QR code is not configured. Please do not send donations for account setup yet.</p></main>')
      .setTitle('OUR GLASS — Donation QR Unavailable');
  }
  const bytes=DriveApp.getFileById(qrId).getBlob().getBytes();
  const png=bytes.length>8 && [137,80,78,71,13,10,26,10].every((v,i)=>(bytes[i]&255)===v);
  if(!png) throw new Error('The configured donation QR image must be a PNG.');
  const t=HtmlService.createTemplateFromFile('Upload');
  // Trusted pixel-exact image from the private owner-controlled file.
  t.qrDataUrl='data:image/png;base64,'+Utilities.base64Encode(bytes);
  return t.evaluate().setTitle('OUR GLASS — Donation Proof')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function clean_(v, max){
  const s=String(v===undefined?'':v).trim().slice(0,max).replace(/[\u0000-\u001f\u007f]/g,' ');
  return /^[=+@-]/.test(s)?"'"+s:s;
}
function validEmail_(s){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)&&s.length<=160;}
function proofSubmit(payload) {
  if(!payload || typeof payload!=='object') throw new Error('Missing form data.');
  if(payload.website) throw new Error('Submission not accepted.');
  if(payload.consent!==true) throw new Error('Consent is required.');
  const name=clean_(payload.name,120), email=String(payload.email||'').trim().toLowerCase();
  const reference=clean_(payload.reference,90), phone=clean_(payload.phone,35), amount=Number(payload.amount);
  if(!name || !validEmail_(email) || !/^[+0-9 ()-]{7,35}$/.test(phone.replace(/^'/,'')) || !Number.isFinite(amount) || amount<=0 || amount>1000000)
    throw new Error('Please check your name, email, phone number, and donation amount.');
  const mime=String(payload.mime||'').toLowerCase();
  if(!['image/jpeg','image/png','image/webp'].includes(mime)) throw new Error('Upload a JPG, PNG, or WEBP screenshot.');
  const encoded=String(payload.base64||'');
  if(!encoded || encoded.length>Math.ceil(OG.maxBytes*4/3)+50 || !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded))
    throw new Error('The screenshot must be smaller than 4 MB.');
  const bytes=Utilities.base64Decode(encoded);
  if(bytes.length>OG.maxBytes) throw new Error('Screenshot exceeds 4 MB.');
  // Identify common image magic bytes independently of browser-provided MIME.
  const b=bytes.map(v=>v&255);
  const jpeg=b.length>3&&b[0]===255&&b[1]===216&&b[2]===255;
  const png=b.length>8&&b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71;
  const webp=b.length>12&&String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP';
  if(!((mime==='image/jpeg'&&jpeg)||(mime==='image/png'&&png)||(mime==='image/webp'&&webp))) throw new Error('Invalid screenshot file.');
  const props=PropertiesService.getScriptProperties();
  const sheetId=props.getProperty('OURGLASS_SHEET_ID'), folderId=props.getProperty('OURGLASS_PROOFS_ID');
  if(!sheetId||!folderId) throw new Error('Intake is not activated yet.');
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(10000)) throw new Error('The service is busy. Please try again.');
  try {
    const sheet=SpreadsheetApp.openById(sheetId).getSheetByName(OG.sheetName);
    if(!sheet) throw new Error('Submission service not configured.');
    const last=sheet.getLastRow(), now=new Date(), today=Utilities.formatDate(now,'Etc/UTC','yyyy-MM-dd');
    if(last>1){
      // Protect against reuse of donation references and excessive repeat attempts.
      const rows=sheet.getRange(Math.max(2,last-499),1,Math.min(last-1,500),8).getValues();
      let count=0;
      for(const row of rows){
        const dt=row[1] instanceof Date?Utilities.formatDate(row[1],'Etc/UTC','yyyy-MM-dd'):String(row[1]).slice(0,10);
        if(reference && String(row[4]).replace(/^'/,'')===reference.replace(/^'/,'')) throw new Error('This transaction reference was already submitted.');
        if(String(row[3]).toLowerCase()===email&&dt===today)count++;
      }
      if(count>=OG.maxSubmissionsPerDay) throw new Error('Daily submission limit reached.');
    }
    const id='OG-'+Utilities.getUuid().slice(0,18).toUpperCase();
    const ext=mime==='image/png'?'png':mime==='image/webp'?'webp':'jpg';
    const file=DriveApp.getFolderById(folderId).createFile(Utilities.newBlob(bytes,mime,id+'.'+ext));
    file.setDescription('OUR GLASS donation proof '+id+' — private');
    const stamp=now.toISOString();
    try {
      sheet.appendRow([id,stamp,name,clean_(email,160),reference,amount,file.getUrl(),'Pending Verification','','','','','',phone]);
      const audit=SpreadsheetApp.openById(sheetId).getSheetByName('Audit Log');
      if(audit)audit.appendRow([stamp,id,'Donation proof submitted','web form','Pending Verification']);
    }catch(err){file.setTrashed(true);throw err;}
    return {ok:true,submissionId:id,message:'Submission received. Pending manual GCash verification.'};
  }finally{lock.releaseLock();}
}


/** ADMIN ONLY: verify donation in the real GCash ledger BEFORE calling this.
 * The verified timestamp starts the 21-day preparation period.
 * Pass a visible spreadsheet row number >= 2, e.g. approveDonationRow(2).
 */
function approveDonationRow(rowNumber) {
  const props=PropertiesService.getScriptProperties();
  const sheet=SpreadsheetApp.openById(props.getProperty('OURGLASS_SHEET_ID')).getSheetByName(OG.sheetName);
  rowNumber=Number(rowNumber);
  if(!Number.isInteger(rowNumber)||rowNumber<2||rowNumber>sheet.getLastRow())throw new Error('Invalid row');
  const lock=LockService.getScriptLock();lock.waitLock(15000);
  try {
    const row=sheet.getRange(rowNumber,1,1,14).getValues()[0];
    if(row[7]!=='Pending Verification')throw new Error('Only pending donations can be approved.');
    if(!validEmail_(String(row[3]).replace(/^'/,'')))throw new Error('Invalid contact email.');
    // Columns: H status, I verified timestamp, J setup notification timestamp.
    sheet.getRange(rowNumber,8,1,2).setValues([['Approved',new Date()]]);
    const audit=SpreadsheetApp.openById(props.getProperty('OURGLASS_SHEET_ID')).getSheetByName('Audit Log');
    if(audit)audit.appendRow([new Date().toISOString(),row[0],'Donation verified','admin','21-day preparation started']);
    MailApp.sendEmail({
      to:String(row[3]).replace(/^'/,''),
      subject:'OUR GLASS — Your donation has been verified',
      body:'Hello '+String(row[2]).replace(/^'/,'')+',\n\nWe have verified your donation. Your three-week preparation period begins today. Please take this time to consider your wishes and choose the trusted person who will officially inform The Afterword Concierge of your death when the time comes. Ask for their permission before sharing their details.\n\nWe will email you after approximately three weeks with the next steps for account setup.\n\nSubmission reference: '+row[0]+'\n\nThe Afterword Concierge'
    });
  } finally {lock.releaseLock();}
}

/** Set once by the admin after completing a test using verified sample data. */
function installPreparationReminder() {
  ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()==='sendDuePreparationNotices')
    .forEach(t=>ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('sendDuePreparationNotices').timeBased().everyDays(1).atHour(9).create();
}

/** Runs daily. A notice is NOT a functional account or invitation. */
function sendDuePreparationNotices() {
  const props=PropertiesService.getScriptProperties();
  const sheet=SpreadsheetApp.openById(props.getProperty('OURGLASS_SHEET_ID')).getSheetByName(OG.sheetName);
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try {
    const rows=sheet.getDataRange().getValues();
    const due=21*24*60*60*1000;
    for(let i=1;i<rows.length;i++) {
      const row=rows[i];
      if(row[7]!=='Approved'||!(row[8] instanceof Date)||row[9])continue;
      if(Date.now()-row[8].getTime()<due)continue;
      const email=String(row[3]).replace(/^'/,'');
      MailApp.sendEmail({
        to:email,
        subject:'OUR GLASS — Your three-week preparation period is complete',
        body:'Hello '+String(row[2]).replace(/^'/,'')+',\n\nYour three-week preparation period is complete. We will provide your secure account setup instructions when onboarding is ready. Please have the name and contact information of your nominated official death reporter ready, and obtain their consent first. Do not send their private details by replying to this email.\n\nSubmission reference: '+row[0]+'\n\nThe Afterword Concierge'
      });
      sheet.getRange(i+1,10).setValue(new Date());
    }
  } finally {lock.releaseLock();}
}
