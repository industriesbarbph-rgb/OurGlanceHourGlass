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

Review each uploaded screenshot against the actual completed transaction in GCash, including recipient, amount and transaction reference. For a legitimately verified submission, use the Apps Script editor to run `approveDonationRow(rowNumber)` with the exact spreadsheet row number (for example, create a temporary admin-only wrapper calling `approveDonationRow(2)`). **Do not simply change the Sheet status to Approved**, since the verified timestamp is what starts the 21-day preparation countdown. The function marks the row as Approved, records the verification time and attempts to email confirmation. Test this before real use. Once tested, run `installPreparationReminder()` once to create a daily trigger that emails the next-step notice **after approximately 21 days from verification**. Column I records verification, column J records the setup reminder, and column N stores the phone number. Ensure the private Donations sheet has at least 14 columns. The script **does not authenticate users, create accounts, send invitations to recipients, or send death notifications**. Those require separate verified workflows before release.

## Privacy & security

- Do not put private Google Drive file IDs, Script Properties, email secrets, or tokens in any GitHub file.
- The screenshot folder and donation tracker must remain private.
- The public web app has basic field, image-format, file-size, duplicate-reference, and per-email checks; these are **not** strong bot protection. Monitor abuse and quotas before large-scale use.
- Treat receipts as personal data. Provide a privacy notice and deletion contact before accepting real payments.
- Revoke/redeploy the web app if its public endpoint receives abuse.


## Three-week preparation policy

- The visitor donates, uploads a screenshot, and submits their name, email and phone number.
- Submission is **Pending Verification** until the actual payment is matched manually in the real GCash account.
- The preparation period starts only when the administrator calls `approveDonationRow(rowNumber)` for a genuinely verified payment.
- The visitor is asked to choose the person authorized to inform OUR GLASS of their death. **Do not collect that person's private details during the donation form**; obtain their permission and collect contact information later during secure setup.
- Approximately 21 days after approval, an automated email tells the visitor their preparation period is complete. It does not grant access or promise that a usable setup account exists.
- Configure a monitored sending account, test Workspace email quotas and bounce handling, and review privacy/retention notices before public launch.
