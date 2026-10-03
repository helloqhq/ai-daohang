import {resolveLanguage,translate} from './i18n.js';
import {createPrivacyPreferences,initCookieControls} from './privacy.js';

const preferences=createPrivacyPreferences();
let language=resolveLanguage(location.search,preferences.language());
const cookieControls=initCookieControls(preferences,()=>language);
function applyLanguage() {
  const t=key=>translate(language,key);
  const page=document.body.dataset.legalPage;
  document.documentElement.lang=language==='zh'?'zh-CN':'en';
  document.title=`${t(page)} · ${t('title')}`;
  document.querySelector('meta[name="description"]').content=t(`${page}Description`);
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.i18nAriaLabel)));
  document.querySelectorAll('.brand-name').forEach(el=>el.textContent=t('title'));
  document.querySelectorAll('[data-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===language)));
  cookieControls.refresh();
}
document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>{
  language=button.dataset.language;
  preferences.rememberLanguage(language);
  const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url);
  applyLanguage();
}));
applyLanguage();
