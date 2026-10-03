import {LANGUAGE_STORAGE_KEY,translate} from './i18n.js';

export const CONSENT_STORAGE_KEY='ai-brief-storage-consent';
export const CONSENT_VERSION=1;
export const CONSENT_LIFETIME=180*24*60*60*1000;

function browserStorage() {
  try {return globalThis.localStorage;} catch {return null;}
}

// Optional language storage is gated by a valid, explicit choice.
export function createPrivacyPreferences(storage=browserStorage(),now=()=>Date.now()) {
  let consent=null;
  function reload() {
    consent=null;
    try {
      const value=JSON.parse(storage?.getItem(CONSENT_STORAGE_KEY) || 'null');
      if(value?.version===CONSENT_VERSION && typeof value.preferences==='boolean' &&
        Number.isFinite(value.savedAt) && Number.isFinite(value.expiresAt) &&
        value.savedAt<=now() && value.expiresAt>now() && value.expiresAt-value.savedAt===CONSENT_LIFETIME) consent=value;
    } catch {}
    if(!consent) {
      try {storage?.removeItem(CONSENT_STORAGE_KEY);} catch {}
    }
    if(!consent?.preferences) {
      try {storage?.removeItem(LANGUAGE_STORAGE_KEY);} catch {}
    }
  }
  reload();
  return {
    get consent(){return consent;},
    reload,
    language() {
      if(consent && consent.expiresAt<=now()) reload();
      if(!consent?.preferences) return null;
      try {return storage?.getItem(LANGUAGE_STORAGE_KEY)??null;} catch {return null;}
    },
    rememberLanguage(language) {
      if(consent && consent.expiresAt<=now()) reload();
      if(!consent?.preferences) return;
      try {storage?.setItem(LANGUAGE_STORAGE_KEY,language);} catch {}
    },
    choose(preferences) {
      const savedAt=now();
      consent={version:CONSENT_VERSION,preferences,savedAt,expiresAt:savedAt+CONSENT_LIFETIME};
      if(!preferences) {
        try {storage?.removeItem(LANGUAGE_STORAGE_KEY);} catch {}
      }
      try {
        if(!storage) return false;
        storage.setItem(CONSENT_STORAGE_KEY,JSON.stringify(consent));
        return true;
      } catch {return false;}
    },
  };
}

export function initCookieControls(preferences,getLanguage) {
  const container=document.createElement('div');
  container.innerHTML=`
    <section id="cookie-banner" class="cookie-banner" aria-labelledby="cookie-title" hidden>
      <div class="cookie-banner-inner">
        <div class="cookie-copy"><span class="cookie-eyebrow">COOKIE / LOCAL STORAGE</span>
          <h2 id="cookie-title" data-i18n="cookieTitle"></h2>
          <p data-i18n="cookieIntro"></p>
          <a class="cookie-policy" href="./privacy.html#browser-storage" data-legal-link data-i18n="cookiePolicy"></a>
        </div>
        <div class="cookie-actions">
          <button type="button" class="consent-button" data-consent="necessary" data-i18n="cookieNecessaryOnly"></button>
          <button type="button" class="consent-button" data-consent="preferences" data-i18n="cookieAllow"></button>
          <button type="button" class="cookie-customize" data-cookie-settings data-i18n="cookieCustomize"></button>
        </div>
      </div>
    </section>
    <dialog id="cookie-dialog" class="cookie-dialog" aria-labelledby="cookie-dialog-title" aria-describedby="cookie-dialog-intro">
      <button type="button" class="dialog-close" data-cookie-close data-i18n-aria-label="cookieClose">×</button>
      <h2 id="cookie-dialog-title" class="dialog-title" data-i18n="cookieDialogTitle"></h2>
      <p id="cookie-dialog-intro" class="cookie-dialog-intro" data-i18n="cookieDialogIntro"></p>
      <label class="cookie-option"><span><strong data-i18n="cookieRequired"></strong><small data-i18n="cookieRequiredCopy"></small></span>
        <input type="checkbox" checked disabled data-i18n-aria-label="cookieRequired">
      </label>
      <label class="cookie-option"><span><strong data-i18n="cookiePreferences"></strong><small data-i18n="cookiePreferencesCopy"></small></span>
        <input type="checkbox" id="cookie-preferences" data-i18n-aria-label="cookiePreferences">
      </label>
      <p class="cookie-tracking" data-i18n="cookieTracking"></p>
      <a class="cookie-policy" href="./privacy.html#browser-storage" data-legal-link data-i18n="cookiePolicy"></a>
      <div class="cookie-dialog-actions">
        <button type="button" class="consent-button" data-consent="necessary" data-i18n="cookieNecessaryOnly"></button>
        <button type="button" class="consent-button" data-cookie-save data-i18n="cookieSave"></button>
      </div>
    </dialog>
    <p id="cookie-status" class="sr-only" role="status" aria-live="polite"></p>`;
  document.body.append(container);
  const banner=document.getElementById('cookie-banner');
  const dialog=document.getElementById('cookie-dialog');
  const checkbox=document.getElementById('cookie-preferences');
  const status=document.getElementById('cookie-status');
  function refresh() {
    const language=getLanguage();
    container.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=translate(language,el.dataset.i18n));
    container.querySelectorAll('[data-i18n-aria-label]').forEach(el=>el.setAttribute('aria-label',translate(language,el.dataset.i18nAriaLabel)));
    document.querySelectorAll('[data-legal-link]').forEach(link=>{
      const url=new URL(link.href);url.searchParams.set('lang',language);link.href=url.href;
    });
    banner.hidden=Boolean(preferences.consent);
    document.body.style.setProperty('--cookie-space',banner.hidden?'0px':`${banner.offsetHeight}px`);
  }
  new ResizeObserver(()=>document.body.style.setProperty('--cookie-space',banner.hidden?'0px':`${banner.offsetHeight}px`)).observe(banner);
  function choose(allowed) {
    const bannerHadFocus=banner.contains(document.activeElement);
    const saved=preferences.choose(allowed);
    preferences.rememberLanguage(getLanguage());
    if(dialog.open) dialog.close();
    refresh();
    status.textContent=translate(getLanguage(),saved?'cookieSaved':'cookieSessionOnly');
    // If the focused banner button disappears, return keyboard users to the settings entry.
    if(bannerHadFocus) document.querySelector('footer [data-cookie-settings]')?.focus({preventScroll:true});
  }
  document.querySelectorAll('[data-cookie-settings]').forEach(button=>{
    button.hidden=false;
    button.addEventListener('click',()=>{
      checkbox.checked=Boolean(preferences.consent?.preferences);
      refresh();dialog.showModal();
    });
  });
  container.querySelectorAll('[data-consent]').forEach(button=>button.addEventListener('click',()=>choose(button.dataset.consent==='preferences')));
  container.querySelector('[data-cookie-save]').addEventListener('click',()=>choose(checkbox.checked));
  container.querySelector('[data-cookie-close]').addEventListener('click',()=>dialog.close());
  window.addEventListener('storage',event=>{
    if(event.key===CONSENT_STORAGE_KEY || event.key===null) {preferences.reload();refresh();}
  });
  refresh();
  return {refresh};
}
