/**
 * OUR GLASS — Google Apps Script screenshot intake
 * Create a standalone Google Apps Script project in industries@barbph.com,
 * paste Code.gs and Upload.html, then configure project Script Properties:
 *   OURGLASS_SHEET_ID   = ID of private Donations spreadsheet
 *   OURGLASS_PROOFS_ID  = ID of private Payment Proofs folder
 * Deploy as Web app: execute as owner; access anyone.
 * Do NOT store private IDs in the public GitHub repository.
 */
const OG = { sheetName:'Donations', maxBytes:4*1024*1024, maxSubmissionsPerDay:3 };
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Upload')
    .setTitle('OUR GLASS — Payment Proof')
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
  const reference=clean_(payload.reference,90), amount=Number(payload.amount);
  if(!name || !validEmail_(email) || !reference || !Number.isFinite(amount) || amount<=0 || amount>1000000)
    throw new Error('Please check your name, email, transaction reference, and donation amount.');
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
      // Protect against reuse of payment references and excessive repeat attempts.
      const rows=sheet.getRange(Math.max(2,last-499),1,Math.min(last-1,500),8).getValues();
      let count=0;
      for(const row of rows){
        const dt=row[1] instanceof Date?Utilities.formatDate(row[1],'Etc/UTC','yyyy-MM-dd'):String(row[1]).slice(0,10);
        if(String(row[4]).replace(/^'/,'')===reference.replace(/^'/,'')) throw new Error('This transaction reference was already submitted.');
        if(String(row[3]).toLowerCase()===email&&dt===today)count++;
      }
      if(count>=OG.maxSubmissionsPerDay) throw new Error('Daily submission limit reached.');
    }
    const id='OG-'+Utilities.getUuid().slice(0,18).toUpperCase();
    const ext=mime==='image/png'?'png':mime==='image/webp'?'webp':'jpg';
    const file=DriveApp.getFolderById(folderId).createFile(Utilities.newBlob(bytes,mime,id+'.'+ext));
    file.setDescription('OUR GLASS payment proof '+id+' — private');
    const stamp=now.toISOString();
    try {
      sheet.appendRow([id,stamp,name,clean_(email,160),reference,amount,file.getUrl(),'Pending Verification','','','','','']);
      const audit=SpreadsheetApp.openById(sheetId).getSheetByName('Audit Log');
      if(audit)audit.appendRow([stamp,id,'Payment proof submitted','web form','Pending Verification']);
    }catch(err){file.setTrashed(true);throw err;}
    return {ok:true,submissionId:id,message:'Submission received. Pending manual GCash verification.'};
  }finally{lock.releaseLock();}
}
