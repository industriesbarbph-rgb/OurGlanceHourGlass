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
      gap:clamp(28px,4vw,50px);align-items:stretch;
    }
    .og-panel[data-route="prepare"] .og-intro-heading,
    .og-panel[data-route="prepare"] .og-intro-card{min-width:0}
    /* Keep the heading in place; anchor both links near the bottom green guide. */
    .og-panel[data-route="prepare"] .og-intro-heading{
      position:relative;align-self:stretch;
      padding-top:clamp(80px,14vh,125px);
      padding-bottom:110px;
    }
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
    /* Ordered timeline: visible stages, not a paragraph of labels. */
    .og-panel[data-route="prepare"] .og-steps-title{
      margin:0 0 15px;color:#94765b;
      font:700 10px/1.3 Arial,Helvetica,sans-serif;
      letter-spacing:.2em;text-transform:uppercase;
    }
    .og-panel[data-route="prepare"] .og-steps{
      list-style:none;margin:0;padding:0;
      display:grid;grid-template-columns:1fr;gap:0;
      counter-reset:ogstage;
    }
    .og-panel[data-route="prepare"] .og-steps li{
      position:relative;display:grid;
      grid-template-columns:29px minmax(0,1fr);
      gap:13px;align-items:center;
      min-height:43px;padding:3px 0;
      color:#39332e;font:500 13px/1.35 Arial,Helvetica,sans-serif;
    }
    .og-panel[data-route="prepare"] .og-steps li:not(:last-child)::after{
      content:"";position:absolute;left:14px;top:34px;bottom:-8px;
      width:1px;background:#ded3c5;pointer-events:none;
    }
    .og-panel[data-route="prepare"] .og-step-number{
      position:relative;z-index:1;
      display:grid;place-items:center;width:29px;height:29px;
      border:1px solid #d4c3b0;border-radius:50%;
      color:#826a52;background:#fcfbf9;
      font:600 10px/1 Arial,Helvetica,sans-serif;
      font-variant-numeric:tabular-nums;letter-spacing:0;
    }
    .og-panel[data-route="prepare"] .og-timeline-details{
      margin-top:16px;padding-top:15px;
      border-top:1px solid #e5ddd3;
    }
    .og-panel[data-route="prepare"] .og-muted{
      font-size:clamp(13px,1.09vw,14px);line-height:1.55;
    }
    .og-panel[data-route="prepare"] .og-intro-links{position:absolute;left:0;bottom:0;margin:0}
    .og-panel[data-route="prepare"] .og-intro-links .og-actions{
      display:flex;flex-direction:column;align-items:flex-start;
      justify-content:flex-start;gap:7px;margin:0;
    }
    .og-panel[data-route="prepare"] .og-intro-links .og-action{
      min-height:40px;justify-content:flex-start;text-align:left;
      font-size:clamp(22px,2.25vw,27px);
    }
    @media(max-width:760px){
      .og-panel[data-route="prepare"]{width:100%;padding:27px 23px 30px}
      .og-panel[data-route="prepare"] .og-intro-layout{display:block}
      .og-panel[data-route="prepare"] .og-intro-heading{padding:0}
      .og-panel[data-route="prepare"] .og-intro-links{position:static;margin-top:24px;margin-bottom:18px}
      .og-panel[data-route="prepare"] .og-title{font-size:clamp(34px,7vw,46px);margin-bottom:12px}
      .og-panel[data-route="prepare"] .og-copy{font-size:14px;margin-bottom:14px}
      .og-panel[data-route="prepare"] .og-card{padding:17px}
      .og-panel[data-route="prepare"] .og-actions{margin-top:12px}
    }
    @media(max-height:620px) and (min-width:761px){
      .og-panel[data-route="prepare"]{padding:18px 28px}
      .og-panel[data-route="prepare"] .og-intro-heading{padding-top:clamp(30px,9vh,70px);padding-bottom:100px}
      .og-panel[data-route="prepare"] .og-title{font-size:clamp(34px,3.7vw,46px);margin-bottom:10px}
      .og-panel[data-route="prepare"] .og-card{padding:15px}
      .og-panel[data-route="prepare"] .og-steps li{min-height:35px;padding:1px 0}.og-panel[data-route="prepare"] .og-steps li:not(:last-child)::after{top:29px;bottom:-5px}.og-panel[data-route="prepare"] .og-timeline-details{margin-top:9px;padding-top:9px}
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
  const home = '<a class="og-action" href="#/">Back to The Afterword Concierge</a>';
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
    if (!url) {
      return '<div class="og-card"><p class="og-muted"><strong>Donation submission is temporarily unavailable.</strong> Please return once the secure intake link is active.</p></div>';
    }
    return '<div class="og-card">' +
      '<p class="og-copy">Our donation and receipt-upload form is hosted securely by Google. Open it in a new tab to enter your details and submit your payment screenshot.</p>' +
      '<div class="og-actions"><a class="og-action og-action--primary" href="'+url+'" target="_blank" rel="noopener noreferrer">Open donation &amp; proof form</a></div>' +
      '<p class="og-muted">Check the GCash recipient before paying. Your submission remains pending until the actual payment is verified.</p>' +
      '</div>';
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
      '<div class="og-intro-links">' +
      actions('<a class="og-action og-action--primary" href="#/donate">Donation &amp; submission</a>',home) +
      '</div></div><div class="og-intro-card">' +
      '<div class="og-card"><p class="og-steps-title">The journey ahead</p><ol class="og-steps" aria-label="Your five steps"><li><span class="og-step-number">01</span><span>Donate</span></li><li><span class="og-step-number">02</span><span>Submit proof, email and phone number</span></li><li><span class="og-step-number">03</span><span>We verify and confirm</span></li><li><span class="og-step-number">04</span><span>Three-week preparation</span></li><li><span class="og-step-number">05</span><span>Setup invitation</span></li></ol>' +
      '<p class="og-muted og-timeline-details">Once your donation is verified, we will use your email to contact you at the end of the three-week preparation period with the next steps for your private setup. During that time, choose the <strong>official trusted person</strong> who will inform The Afterword Concierge of your death when the time comes. You will provide their details securely during setup.</p></div>' +
      '</div></div>',
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
    const proceed = window.confirm("To finish submitting, your email app will open. Attach the payment screenshot you selected and press Send. Selecting it on this page did not upload it or send your details. Continue to email?");
    if (!proceed) return;
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
