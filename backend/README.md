# OUR GLASS — screenshot intake deployment

**Owner account:** the approved OUR GLASS Google Workspace account. The website has no live payment intake until these steps are complete.

## Google Apps Script (one-time owner authorization)

1. Sign in to the owner Workspace account, then open [script.google.com](https://script.google.com) and create a new standalone Apps Script project named **OUR GLASS Payment Intake**.
2. Copy the contents of [Code.gs](Code.gs) into the project's Code.gs file.
3. Add an HTML file named **Upload** and copy the contents of [Upload.html](Upload.html). Save both.
4. Open the **Operator Guide** tab in the private **OUR GLASS Donations** Google Sheet. Under Project Settings → Script Properties in Apps Script, add the **three keys and their matching values** listed there:
   - `OURGLASS_SHEET_ID`
   - `OURGLASS_PROOFS_ID`
   - `OURGLASS_QR_FILE_ID`
5. Deploy → New deployment → Web app. Choose **Execute as: Me** and **Who has access: Anyone** (needed for people without a Google account). Review Google's permissions carefully and authorize the project.
6. On the phone, check that the QR is large, sharp, and has an unbroken white margin. Test **Save QR image** and use GCash → QR → Upload QR on that same phone, or scan the QR from a second phone. Verify the recipient displayed in GCash is the intended account **without sending payment**. The QR asset is copied from the private source, never regenerated, stylized, overlaid, or cropped.
7. Copy the deployed **/exec** web-app URL. Test this URL directly on a phone. Confirm the GCash QR opens in the GCash app, image submission receives an **OG-...** reference, the proof appears in the private folder and the new spreadsheet row says **Pending Verification**.
8. Submit the same reference again and verify it is rejected. Confirm the public cannot view the Sheet, proof folder, or files.
9. Set `window.OURGLASS_PAYMENT_FORM_URL` in the public [ourglass-config.js](../ourglass-config.js) to the deployed /exec URL. That change activates the real form in the **Donation & verification** route. Until then, the site intentionally refuses donations for setup.

## Review process

Review each uploaded screenshot against the transaction in the actual GCash app before changing `Status` in the private Sheet to `Approved`. The Apps Script upload is only an intake channel. **It does not authenticate accounts, grant access, send invitations, or send death notifications.** Those require separate verified backend workflows before release.

## Privacy & security

- Do not put private Google Drive file IDs, Script Properties, email secrets, or tokens in any GitHub file.
- The screenshot folder and donation tracker must remain private.
- The public web app has basic field, image-format, file-size, duplicate-reference, and per-email checks; these are **not** strong bot protection. Monitor abuse and quotas before large-scale use.
- Treat receipts as personal data. Provide a privacy notice and deletion contact before accepting real payments.
- Revoke/redeploy the web app if its public endpoint receives abuse.
