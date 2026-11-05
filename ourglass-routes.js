/* OUR GLASS navigation, built for tap and keyboard access.
 * Registration and donation remain unavailable until their verified backends are active.
 */
(() => {
  "use strict";

  const pages = ["join", "prepare", "donate", "verification", "pending", "setup"];
  const nav = document.querySelector("nav.og-nav");
  if (!nav) return;

  const styles = document.createElement("style");
  styles.textContent = `
    .og-backdrop[hidden]{display:none!important}
    .og-backdrop{
      position:fixed;inset:0;z-index:200;
      background:rgba(31,25,20,.56);
      display:flex;align-items:center;justify-content:center;
      padding:clamp(14px,4vw,36px);
    }
    .og-panel{
      position:relative;width:min(100%,560px);
      max-height:calc(100dvh - 32px);overflow-y:auto;overscroll-behavior:contain;
      padding:clamp(29px,5vw,48px);
      background:#fcfbf9;color:#302a25;
      border:1px solid #e4d9cd;border-radius:12px;
      box-shadow:0 25px 90px rgba(25,18,11,.25);
    }
    /* Smart Move: keep the complete introduction visible in a balanced two-column panel. */
    .og-panel[data-route="prepare"]{
      width:min(94vw,960px);
      max-height:calc(100dvh - 36px);
      padding:clamp(24px,3vw,38px) clamp(28px,3.6vw,48px);
    }
    .og-panel[data-route="prepare"] .og-intro-layout{
      display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.08fr);
      gap:clamp(28px,4vw,50px);align-items:center;
    }
    .og-panel[data-route="prepare"] .og-intro-heading,
    .og-panel[data-route="prepare"] .og-intro-card{min-width:0}
    .og-panel[data-route="prepare"] .og-title{
      font-size:clamp(35px,3.15vw,48px);line-height:1.08;
      margin:0 0 18px;max-width:13em;letter-spacing:-.025em;
    }
    .og-panel[data-route="prepare"] .og-copy{
      font-size:clamp(14px,1.16vw,16px);line-height:1.55;margin:0;
    }
    .og-panel[data-route="prepare"] .og-card{
      margin:0;padding:clamp(17px,1.9vw,24px);background:rgba(255,254,250,.72);
    }
    .og-panel[data-route="prepare"] .og-steps{
      list-style:none;margin:0 0 17px;padding:0;
      display:grid;grid-template-columns:minmax(0,1fr);row-gap:5px;
      color:#8a704f;font:700 clamp(12px,1vw,13px)/1.45 Arial,Helvetica,sans-serif;
    }
    .og-panel[data-route="prepare"] .og-steps li{
      display:grid;grid-template-columns:29px minmax(0,1fr);
      align-items:baseline;column-gap:10px;
    }
    .og-panel[data-route="prepare"] .og-step-number{
      color:#a28b73;font-variant-numeric:tabular-nums;letter-spacing:.045em;
    }
    .og-panel[data-route="prepare"] .og-muted{
      font-size:clamp(13px,1.09vw,14px);line-height:1.55;
    }
    .og-panel[data-route="prepare"] .og-actions{
      justify-content:center;margin-top:clamp(18px,2.6vh,26px);
      gap:clamp(25px,4vw,70px);
    }
    @media(max-width:760px){
      .og-panel[data-route="prepare"]{width:100%;padding:27px 23px 30px}
      .og-panel[data-route="prepare"] .og-intro-layout{display:block}
      .og-panel[data-route="prepare"] .og-title{font-size:clamp(34px,7vw,46px);margin-bottom:12px}
      .og-panel[data-route="prepare"] .og-copy{font-size:14px;margin-bottom:14px}
      .og-panel[data-route="prepare"] .og-card{padding:17px}
      .og-panel[data-route="prepare"] .og-actions{margin-top:12px}
    }
    @media(max-height:620px) and (min-width:761px){
      .og-panel[data-route="prepare"]{padding:18px 28px}
      .og-panel[data-route="prepare"] .og-title{font-size:clamp(34px,3.7vw,46px);margin-bottom:10px}
      .og-panel[data-route="prepare"] .og-card{padding:15px}
      .og-panel[data-route="prepare"] .og-steps{row-gap:2px;margin-bottom:10px}
      .og-panel[data-route="prepare"] .og-muted{line-height:1.45}
      .og-panel[data-route="prepare"] .og-actions{margin-top:6px}
    }
    /* A minimal unboxed close control; override browser and page button styles. */
    .og-panel .og-close,.og-panel .og-close:hover,.og-panel .og-close:active{
      position:absolute;z-index:3;top:14px;right:16px;
      display:flex;align-items:center;justify-content:center;
      width:32px;height:32px;min-width:0;min-height:0;
      margin:0!important;padding:0!important;
      border:0!important;border-radius:0!important;
      outline:0!important;box-shadow:none!important;
      background:transparent!important;background-image:none!important;
      -webkit-appearance:none;appearance:none;
      color:#3e3832!important;-webkit-text-fill-color:#3e3832!important;
      font:400 25px/1 Arial,Helvetica,sans-serif;
      text-shadow:none!important;filter:none!important;cursor:pointer;
    }
    .og-panel .og-close:hover{opacity:.66}
    .og-panel .og-close:focus-visible{
      text-decoration:underline;text-underline-offset:4px;
    }
    .og-action:focus-visible{outline:2px solid #777c87;outline-offset:5px}
    .og-kicker{margin:0 36px 12px 0;font:700 11px/1.5 Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#92795f}
    .og-title{margin:0 22px 17px 0;font:400 clamp(36px,7vw,54px)/1.05 Georgia,serif;letter-spacing:-.035em}
    .og-copy{margin:0 0 20px;color:#5a5048;font:15px/1.7 Arial,Helvetica,sans-serif}
    .og-card{margin:18px 0;padding:19px 20px;border:1px solid #dfd5c9;background:#fffefa;border-radius:8px}
    .og-muted{margin:0;color:#655b51;font:14px/1.65 Arial,sans-serif}
    .og-muted strong{color:#332b24}
    .og-step{margin:0 0 15px;color:#8a704f;font:700 12px/1.9 Arial,sans-serif}
    .og-actions{display:flex;align-items:center;flex-wrap:wrap;gap:10px 28px;margin-top:25px}
    .og-action,.og-action--primary,.og-action:visited{
      position:relative;display:inline-flex;align-items:center;justify-content:center;
      min-height:48px;padding:6px 1px;
      border:0!important;border-radius:0!important;box-shadow:none!important;
      background-color:transparent!important;
      background-image:linear-gradient(155deg,#16181b 3%,#4e545b 29%,#adb2ba 47%,#23262a 62%,#565d66 79%,#131519 96%)!important;
      background-clip:text;-webkit-background-clip:text;
      -webkit-text-fill-color:transparent;color:#22262a;
      font:italic 600 clamp(22px,3vw,27px)/1.13 'Cormorant Garamond',Georgia,serif;
      letter-spacing:-.008em;text-align:center;text-decoration:none;text-transform:none;
      text-shadow:none!important;
      filter:drop-shadow(0 -1px 0 rgba(255,255,255,.65)) drop-shadow(0 1px 1px rgba(23,27,31,.21));
      cursor:pointer;transition:filter .2s ease;
    }
    .og-action::after{
      content:"";position:absolute;left:7%;right:7%;bottom:4px;height:1px;
      background:linear-gradient(90deg,transparent,#66717f 25%,#bbc1c8 51%,#4b535d 78%,transparent);
      opacity:0;transform:scaleX(.5);transition:opacity .2s ease,transform .2s ease;
    }
    .og-action:hover,.og-action--primary:hover{
      filter:drop-shadow(0 0 4px rgba(120,133,151,.55));
    }
    .og-action:hover::after,.og-action:focus-visible::after{opacity:.85;transform:scaleX(1)}
    .og-donation-step[hidden],#og-name-gate[hidden],#og-proof-error[hidden]{display:none!important}
    .og-question{font:italic 500 clamp(23px,3.7vw,31px)/1.2 'Cormorant Garamond',Georgia,serif!important;letter-spacing:0!important;margin:15px 0 13px!important}
    .og-upload-label{font-weight:700!important}
    .og-donation-step{margin-top:18px}
    .og-form-heading{font:italic 500 32px/1.15 'Cormorant Garamond',Georgia,serif;margin:0 0 18px}
    .og-file-error{color:#973f32;font-size:13px}
    #og-proof{max-width:100%;margin:6px 0 12px}
    .og-payment-qr{display:block;width:min(100%,280px);height:auto;margin:0 auto 15px;background:white;padding:7px;border:1px solid #e3dcd3}
    .og-donation-form label{display:block;margin:12px 0 7px;font:600 13px/1.5 Arial,sans-serif;color:#514b44}
    .og-donation-form input:not([type="checkbox"]){display:block;width:100%;border:1px solid #ccc1b4;background:#fff;padding:11px;border-radius:5px;font:15px Arial,sans-serif;margin-top:5px}
    .og-donation-form .og-consent{display:flex;gap:9px;align-items:start;font-weight:400;margin:17px 0}
    .og-donation-form .og-consent input{margin-top:3px;flex-shrink:0}
    .og-send-email{display:block;width:100%;padding:13px;background:#302a25;color:#fff;border:0;border-radius:5px;font:600 15px Arial,sans-serif;cursor:pointer;margin:16px 0}
    .og-send-email:focus-visible{outline:2px solid #687788;outline-offset:3px}
    .og-iframe{display:block;width:100%;height:min(65dvh,610px);border:1px solid #dfd5c9;border-radius:8px;background:white}
    @media(max-width:700px){
      .og-backdrop{padding:0;align-items:flex-end}
      .og-panel{
        width:100%;max-height:92dvh;border-radius:20px 20px 0 0;
        padding:30px 22px max(26px,env(safe-area-inset-bottom));
      }
      .og-actions{flex-direction:column;align-items:stretch}
      .og-action{width:100%}
      .og-title{font-size:clamp(34px,8vw,48px)}
    }
  `;
  document.head.appendChild(styles);

  const overlay = document.createElement("div");
  overlay.className = "og-backdrop";
  overlay.hidden = true;
  overlay.innerHTML = '<section class="og-panel" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="og-modal-title"><button class="og-close" aria-label="Close and return to OUR GLASS" type="button">×</button><div class="og-body"></div></section>';
  document.body.appendChild(overlay);

  const panel = overlay.querySelector(".og-panel");
  const contents = overlay.querySelector(".og-body");
  const closeButton = overlay.querySelector(".og-close");
  const home = '<a class="og-action" href="#/">Back to OUR GLASS</a>';
  let previousOverflow = "";
  let lastTrigger = null;

  function header(kicker, title, copy) {
    return '<p class="og-kicker">'+kicker+'</p><h2 class="og-title" id="og-modal-title">'+title+'</h2><p class="og-copy">'+copy+'</p>';
  }
  function actions(primary, secondary) {
    return '<div class="og-actions">'+(primary||"")+(secondary||home)+'</div>';
  }
  function paymentFormUrl() {
    const url = String(window.OURGLASS_PAYMENT_FORM_URL || "");
    return /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url) ? url : "";
  }
  function donationContent() {
    const url=paymentFormUrl();
    if(url) return '<div class="og-card"><p class="og-muted">Complete the donation and proof submission in the secure form below. Payment verification is required before confirmation.</p></div>' +
      '<iframe class="og-iframe" title="OUR GLASS donation proof and contact submission" referrerpolicy="no-referrer" src="'+url+'"></iframe>';
    return '<form id="og-name-gate" class="og-donation-form">' +
      '<label for="og-guest-name" class="og-question">Who do we have the pleasure of receiving a donation from today?</label>' +
      '<input id="og-guest-name" name="guestName" type="text" autocomplete="name" maxlength="120" placeholder="Your name" required>' +
      '<button class="og-send-email" type="submit">Continue</button></form>' +
      '<section id="og-qr-stage" class="og-donation-step" hidden>' +
      '<p class="og-muted">Thank you, <strong id="og-guest-greeting"></strong>. Start with your donation, then select a screenshot showing the GCash transaction reference number.</p>' +
      '<div class="og-card"><img class="og-payment-qr" src="data:image/png;base64,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P62qnh7hL9399Ah/mc4z3c/0691ef/t8bs/j+fratf3Zfn7T3w9v87b7de19C/8LX+gBACCYoAcAgGCCHgAAggl6AAAIJugBACCYoAcAgGCCHgAAggl6AAAIJugBACCYoAcAgGCCHgAAgn2eHuDtqmr0++5emuQf03murT813c9r86fbPs/brp0H5/lr2/vztvWnts/b287/2+7vteu9xhd6AAAIJugBACCYoAcAgGCCHgAAggl6AAAIJugBACCYoAcAgGCCHgAAggl6AAAIJugBACCYoAcAgGCfpwe4rrtHv6+qpUn+3frT+ae/v2a6P9v7eW397XmmzPO17ffJ1LX9mbr2PG7vT/r5vHZ+0qWfz2vvw2t8oQcAgGCCHgAAggl6AAAIJugBACCYoAcAgGCCHgAAggl6AAAIJugBACCYoAcAgGCCHgAAggl6AAAI9nl6gN+mu0e/r6qlSX5m/XTp92s6f7rt/dnez2vn55r0+bdt70/687I9/3Set53nt/0/usYXegAACCboAQAgmKAHAIBggh4AAIIJegAACCboAQAgmKAHAIBggh4AAIIJegAACCboAQAgmKAHAIBgn6cHeLvuHv2+qlbX37Y9/3T9a952vVNv25/053d7/6/tz/Y82+f/2v+Xa/d36tr8185D+vv5Gl/oAQAgmKAHAIBggh4AAIIJegAACCboAQAgmKAHAIBggh4AAIIJegAACCboAQAgmKAHAIBggh4AAIJ9nh7guqoa/b67V9fftn29U9fmmdo+D+n7P10/fX+2Xduf9PNw7f5OpZ//a+/zbdeeX7L4Qg8AAMEEPQAABBP0AAAQTNADAEAwQQ8AAMEEPQAABBP0AAAQTNADAEAwQQ8AAMEEPQAABBP0AAAQ7PP0ANd19+j3VbU0yc+YXu810/2fXu/2/rxt/6euPY/p81xzbf7tebbfV1PXzmf6/9Op9PN/7fy8jS/0AAAQTNADAEAwQQ8AAMEEPQAABBP0AAAQTNADAEAwQQ8AAMEEPQAABBP0AAAQTNADAEAwQQ8AAME+Tw/wdt09+n1Vrf7+bab7s32/putPXbvea65db/p+bs+//bxsu3beprb3/9r78Nr68J98oQcAgGCCHgAAggl6AAAIJugBACCYoAcAgGCCHgAAggl6AAAIJugBACCYoAcAgGCCHgAAggl6AAAIVtM/6O7e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" alt="OUR GLASS GCash QR code. Check the recipient in GCash before sending." width="756" height="756">' +
      '<p style="text-align:center"><a class="og-action" href="data:image/png;base64,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P62qnh7hL9399Ah/mc4z3c/0691ef/t8bs/j+fratf3Zfn7T3w9v87b7de19C/8LX+gBACCYoAcAgGCCHgAAggl6AAAIJugBACCYoAcAgGCCHgAAggl6AAAIJugBACCYoAcAgGCCHgAAgn2eHuDtqmr0++5emuQf03murT813c9r86fbPs/brp0H5/lr2/vztvWnts/b287/2+7vteu9xhd6AAAIJugBACCYoAcAgGCCHgAAggl6AAAIJugBACCYoAcAgGCCHgAAggl6AAAIJugBACCYoAcAgGCfpwe4rrtHv6+qpUn+3frT+ae/v2a6P9v7eW397XmmzPO17ffJ1LX9mbr2PG7vT/r5vHZ+0qWfz2vvw2t8oQcAgGCCHgAAggl6AAAIJugBACCYoAcAgGCCHgAAggl6AAAIJugBACCYoAcAgGCCHgAAggl6AAAI9nl6gN+mu0e/r6qlSX5m/XTp92s6f7rt/dnez2vn55r0+bdt70/687I9/3Set53nt/0/usYXegAACCboAQAgmKAHAIBggh4AAIIJegAACCboAQAgmKAHAIBggh4AAIIJegAACCboAQAgmKAHAIBgn6cHeLvuHv2+qlbX37Y9/3T9a952vVNv25/053d7/6/tz/Y82+f/2v+Xa/d36tr8185D+vv5Gl/oAQAgmKAHAIBggh4AAIIJegAACCboAQAgmKAHAIBggh4AAIIJegAACCboAQAgmKAHAIBggh4AAIJ9nh7guqoa/b67V9fftn29U9fmmdo+D+n7P10/fX+2Xduf9PNw7f5OpZ//a+/zbdeeX7L4Qg8AAMEEPQAABBP0AAAQTNADAEAwQQ8AAMEEPQAABBP0AAAQTNADAEAwQQ8AAMEEPQAABBP0AAAQ7PP0ANd19+j3VbU0yc+YXu810/2fXu/2/rxt/6euPY/p81xzbf7tebbfV1PXzmf6/9Op9PN/7fy8jS/0AAAQTNADAEAwQQ8AAMEEPQAABBP0AAAQTNADAEAwQQ8AAMEEPQAABBP0AAAQTNADAEAwQQ8AAME+Tw/wdt09+n1Vrf7+bab7s32/putPXbvea65db/p+bs+//bxsu3beprb3/9r78Nr68J98oQcAgGCCHgAAggl6AAAIJugBACCYoAcAgGCCHgAAggl6AAAIJugBACCYoAcAgGCCHgAAggl6AAAIVtM/6O7e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" download="OUR-GLASS-GCash-QR.png">Save QR</a></p>' +
      '<label for="og-proof" class="og-upload-label">Select your payment screenshot</label>' +
      '<input type="file" id="og-proof" accept="image/png,image/jpeg,image/webp" aria-describedby="og-proof-note">' +
      '<p id="og-proof-note" class="og-muted">Choose a JPG, PNG or WEBP screenshot (up to 4 MB). Make sure the reference number is visible. Selecting a file unlocks the remaining fields; the screenshot must still be attached to the email when you send it.</p>' +
      '<p id="og-proof-error" class="og-file-error" role="alert" hidden></p></div></section>' +
      '<section id="og-contact-stage" class="og-donation-step" hidden>' +
      '<h3 class="og-form-heading">Complete your details</h3>' +
      '<form class="og-donation-form" id="og-donation-form">' +
      '<input type="hidden" name="name" id="og-donor-name">' +
      '<label>Email address<input name="email" type="email" maxlength="160" autocomplete="email" required></label>' +
      '<label>Phone number<input name="phone" type="tel" maxlength="35" autocomplete="tel" required></label>' +
      '<label>Donation amount (PHP)<input name="amount" type="number" min="0.01" step="0.01" required></label>' +
      '<label>GCash transaction reference<input name="reference" maxlength="90" required></label>' +
      '<label class="og-consent"><input type="checkbox" name="consent" required> I agree that The Afterword Concierge may use my contact details and payment proof to verify my donation and contact me about my three-week preparation and next steps.</label>' +
      '<button type="submit" class="og-send-email">Prepare my proof email</button>' +
      '<p class="og-muted"><strong>Important:</strong> Your email app will open with these details. Attach the screenshot you selected and press Send. Selecting it here does not upload it automatically. We confirm your donation only after checking the actual GCash transaction.</p>' +
      '</form></section>';
  }

  const views = {
    join: () =>
      header("Your people", "Join someone’s circle",
        "If a loved one invites you into their circle, this is where you will be able to register to receive their future messages.") +
      '<div class="og-card"><p class="og-muted"><strong>Not yet accepting registrations.</strong> We will only collect recipient information after secure invitations and private data storage are ready.</p></div>' +
      actions(null, home),
    prepare: () =>
      '<div class="og-intro-layout"><div class="og-intro-heading">' +
      header("Begin yours", "Your Afterword Account begins here",
        "Your three-week preparation period gives you time to consider your wishes and the people who matter. Personal setup follows donation verification and confirmation.") +
      '</div><div class="og-intro-card">' +
      '<div class="og-card"><ol class="og-steps" aria-label="Your five steps"><li><span class="og-step-number">01</span><span>Donate</span></li><li><span class="og-step-number">02</span><span>Submit proof, email and phone number</span></li><li><span class="og-step-number">03</span><span>We verify and confirm</span></li><li><span class="og-step-number">04</span><span>Three-week preparation</span></li><li><span class="og-step-number">05</span><span>Setup invitation</span></li></ol>' +
      '<p class="og-muted">Once your donation is verified, we will use your email to contact you at the end of the three-week preparation period with the next steps for your private setup. During that time, choose the <strong>official trusted person</strong> who will inform The Afterword Concierge of your death when the time comes. You will provide their details securely during setup; please ask for their consent first.</p></div>' +
      '</div></div>' +
      actions('<a class="og-action og-action--primary" href="#/donate">Donation &amp; submission</a>',home),
    donate: () =>
      header("Begin yours", "Donation & submission",
        "We'll guide you through the details one step at a time.") +
      donationContent() +
      actions(null,home),
    verification: () =>
      header("Our process","Verification",
        "Uploaded proof is checked against the actual GCash transaction history. Submission never means automatic approval.") +
      '<div class="og-card"><p class="og-muted">Only genuinely received and confirmed donations can be approved. We will never request your GCash PIN, password or one-time code.</p></div>' +
      actions('<a class="og-action og-action--primary" href="#/pending">What happens next?</a>',home),
    pending: () =>
      header("Review","Pending confirmation",
        "Once the real form is active and a payment proof is submitted, the request remains pending until someone verifies the corresponding GCash transaction.") +
      '<div class="og-card"><p class="og-muted">This page is informational. Opening it does not mean you have submitted a payment.</p></div>' +
      actions(null,home),
    setup: () =>
      header("Private access","Setup is locked",
        "Account setup requires an approved, verified donation and secure access. The account registration system is not open yet.") +
      actions(null,home)
  };

  function currentRoute() {
    const match = /^#\/([a-z-]+)$/.exec(window.location.hash);
    return match && pages.includes(match[1]) ? match[1] : null;
  }

  function close() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    nav.hidden = false;
    document.body.style.overflow = previousOverflow;
    if (lastTrigger && lastTrigger.isConnected) lastTrigger.focus();
  }
  function render() {
    const name = currentRoute();
    if (!name) { close(); return; }
    if (overlay.hidden) {
      previousOverflow = document.body.style.overflow;
      lastTrigger = document.activeElement;
    }
    panel.dataset.route = name;
    contents.innerHTML = views[name]();
    panel.scrollTop = 0;
    overlay.hidden = false;
    nav.hidden = true;
    document.body.style.overflow = "hidden";
    panel.focus({preventScroll:true});
  }
  function goHome() {
    if (window.location.hash !== "#/") window.location.hash = "#/";
    else close();
  }

  overlay.addEventListener("submit", event => {
    if (!event.target) return;
    if (event.target.id === "og-name-gate") {
      event.preventDefault();
      const gate=event.target;
      if(!gate.reportValidity())return;
      const name=gate.elements.guestName.value.trim();
      if(name.length < 2)return;
      document.getElementById("og-donor-name").value=name;
      document.getElementById("og-guest-greeting").textContent=name;
      gate.hidden=true;
      const stage=document.getElementById("og-qr-stage");
      stage.hidden=false;
      stage.scrollIntoView({block:"start",behavior:"smooth"});
      return;
    }
    if (event.target.id !== "og-donation-form") return;
    event.preventDefault();
    const f = event.target;
    if (!f.reportValidity()) return;
    const proof=document.getElementById("og-proof");
    if(!proof || !proof.files.length || document.getElementById("og-contact-stage").hidden) return;
    const data = new FormData(f);
    const clean = key => String(data.get(key) || "").trim().replace(/[\\r\\n]/g," ");
    const name=clean("name"),email=clean("email"),phone=clean("phone");
    const amount=clean("amount"),reference=clean("reference");
    if(!name||!email||!phone||!reference||!amount||!data.get("consent")) return;
    const subject = "OUR GLASS donation proof — pending verification";
    const body = "Hello The Afterword Concierge,\\n\\nPlease find my donation details below.\\n\\n"+
      "Name: "+name+"\\nEmail: "+email+"\\nPhone: "+phone+"\\nAmount (PHP): "+amount+
      "\\nGCash reference: "+reference+"\\n\\nI consent to manual processing of my details and proof for verification and onboarding correspondence.\\n\\n"+
      "IMPORTANT: I WILL ATTACH MY ACTUAL GCASH PAYMENT SCREENSHOT BEFORE SENDING THIS EMAIL.\\n"+
      "I understand that my three-week preparation begins only after payment verification and confirmation.";
    window.location.href="mailto:industries@barbph.com?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
  });
  overlay.addEventListener("change", event => {
    if(!event.target || event.target.id !== "og-proof")return;
    const file=event.target.files && event.target.files[0];
    const error=document.getElementById("og-proof-error");
    const contact=document.getElementById("og-contact-stage");
    const allowed=["image/png","image/jpeg","image/webp"];
    const good=!!file && allowed.includes(file.type) && file.size>0 && file.size<=4*1024*1024;
    if(!good){
      contact.hidden=true;
      error.textContent="Please select a JPG, PNG or WEBP screenshot smaller than 4 MB.";
      error.hidden=false;
      return;
    }
    error.hidden=true;
    contact.hidden=false;
    contact.scrollIntoView({block:"start",behavior:"smooth"});
  });
  closeButton.addEventListener("click", goHome);
  overlay.addEventListener("click", event => {
    if (event.target === overlay) goHome();
  });
  document.addEventListener("keydown", event => {
    if (overlay.hidden) return;
    if (event.key === "Escape") {event.preventDefault();goHome();return;}
    if (event.key !== "Tab") return;
    const focusables = [...overlay.querySelectorAll('a[href],button:not([disabled]),iframe')];
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length-1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();first.focus();
    }
  });
  window.addEventListener("hashchange", render);
  render();
})();
