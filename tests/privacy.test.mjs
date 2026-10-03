import test from 'node:test';
import assert from 'node:assert/strict';
import {createPrivacyPreferences,CONSENT_STORAGE_KEY,CONSENT_LIFETIME,CONSENT_VERSION} from '../public/assets/privacy.js';
import {LANGUAGE_STORAGE_KEY} from '../public/assets/i18n.js';

function memoryStorage(entries=[]) {
  const values=new Map(entries);
  return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
}
const start=Date.UTC(2026,9,3);

test('first visit removes legacy language and never persists an optional preference before choosing',()=>{
  const storage=memoryStorage([[LANGUAGE_STORAGE_KEY,'en']]);
  const preferences=createPrivacyPreferences(storage,()=>start);
  assert.equal(preferences.consent,null);
  assert.equal(preferences.language(),null);
  assert.equal(storage.getItem(LANGUAGE_STORAGE_KEY),null);
  preferences.rememberLanguage('en');
  assert.equal(storage.getItem(LANGUAGE_STORAGE_KEY),null);
  assert.equal(storage.getItem(CONSENT_STORAGE_KEY),null);
});
test('necessary-only choice survives reload without allowing language storage',()=>{
  const storage=memoryStorage();
  const preferences=createPrivacyPreferences(storage,()=>start);
  assert.equal(preferences.choose(false),true);
  preferences.rememberLanguage('en');
  const nextVisit=createPrivacyPreferences(storage,()=>start+1);
  assert.equal(nextVisit.consent.preferences,false);
  assert.equal(nextVisit.language(),null);
  assert.equal(storage.getItem(LANGUAGE_STORAGE_KEY),null);
});
test('allowing preferences persists language; withdrawing removes it immediately and after reload',()=>{
  const storage=memoryStorage();
  const preferences=createPrivacyPreferences(storage,()=>start);
  preferences.choose(true);preferences.rememberLanguage('en');
  const nextVisit=createPrivacyPreferences(storage,()=>start+1);
  assert.equal(nextVisit.language(),'en');
  nextVisit.choose(false);
  assert.equal(storage.getItem(LANGUAGE_STORAGE_KEY),null);
  assert.equal(nextVisit.language(),null);
  assert.equal(createPrivacyPreferences(storage,()=>start+2).consent.preferences,false);
});
test('expired, malformed and older-version choices require a new choice and remove optional data',()=>{
  const valid={version:CONSENT_VERSION,preferences:true,analytics:false,savedAt:start,expiresAt:start+CONSENT_LIFETIME};
  for(const [value,time] of [
    [JSON.stringify(valid),start+CONSENT_LIFETIME],
    ['not json',start],['null',start],
    [JSON.stringify({...valid,version:CONSENT_VERSION-1}),start],
    [JSON.stringify({...valid,preferences:'true'}),start],
    [JSON.stringify({...valid,savedAt:start+1}),start],
    [JSON.stringify({...valid,expiresAt:valid.expiresAt+1}),start],
  ]) {
    const storage=memoryStorage([[CONSENT_STORAGE_KEY,value],[LANGUAGE_STORAGE_KEY,'en']]);
    const preferences=createPrivacyPreferences(storage,()=>time);
    assert.equal(preferences.consent,null);
    assert.equal(storage.getItem(CONSENT_STORAGE_KEY),null);
    assert.equal(preferences.language(),null);
    assert.equal(storage.getItem(LANGUAGE_STORAGE_KEY),null);
  }
});
test('optional access stops if a choice expires while the page is still open',()=>{
  const storage=memoryStorage();
  let time=start;
  const preferences=createPrivacyPreferences(storage,()=>time);
  preferences.choose(true);preferences.rememberLanguage('en');
  time+=CONSENT_LIFETIME;
  preferences.rememberLanguage('en');
  assert.equal(preferences.language(),null);
  assert.equal(preferences.consent,null);
  assert.equal(storage.getItem(CONSENT_STORAGE_KEY),null);
  assert.equal(storage.getItem(LANGUAGE_STORAGE_KEY),null);
});
test('blocked storage does not break reading or choosing and reports that choice was not saved',()=>{
  const blocked={getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');},removeItem(){throw new Error('blocked');}};
  for(const storage of [null,blocked]) {
    const preferences=createPrivacyPreferences(storage,()=>start);
    assert.equal(preferences.consent,null);
    assert.equal(preferences.choose(true),false);
    assert.equal(preferences.consent.preferences,true);
    assert.doesNotThrow(()=>preferences.rememberLanguage('en'));
    assert.equal(preferences.language(),null);
    assert.equal(preferences.choose(false),false);
    assert.equal(preferences.consent.preferences,false);
  }
});
test('another tab withdrawing preferences revokes optional writes in this tab',()=>{
  const storage=memoryStorage();
  let time=start;
  const first=createPrivacyPreferences(storage,()=>time);
  first.choose(true);first.rememberLanguage('en');
  time++;
  const second=createPrivacyPreferences(storage,()=>time);
  second.choose(false);
  first.reload();first.rememberLanguage('en');
  assert.equal(first.consent.preferences,false);
  assert.equal(storage.getItem(LANGUAGE_STORAGE_KEY),null);
});

test('analytics requires a separate choice and is never granted by language preferences',()=>{
  const storage=memoryStorage();
  const preferences=createPrivacyPreferences(storage,()=>start);
  preferences.choose(true);
  assert.equal(preferences.consent.analytics,false);
  preferences.choose(false,true);
  assert.equal(createPrivacyPreferences(storage,()=>start+1).consent.analytics,true);
  assert.equal(preferences.language(),null);
  preferences.choose(false);
  assert.equal(preferences.consent.analytics,false);
});
test('legacy language-only consent never authorizes analytics',()=>{
  const old={version:1,preferences:true,savedAt:start,expiresAt:start+CONSENT_LIFETIME};
  const preferences=createPrivacyPreferences(memoryStorage([[CONSENT_STORAGE_KEY,JSON.stringify(old)]]),()=>start);
  assert.equal(preferences.consent,null);
});
