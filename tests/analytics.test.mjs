import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function browser(hostname='go2-ai.com') {
  const scripts=[],deleted=[];
  const document={head:{append:script=>scripts.push(script)},createElement:()=>({})};
  Object.defineProperty(document,'cookie',{get:()=> '_ga=visitor; _ga_HGXR45VSBG=session; necessary=keep',set:value=>deleted.push(value)});
  const context=vm.createContext({window:{},location:{hostname,origin:`https://${hostname}`,pathname:'/'},document});
  vm.runInContext(readFileSync(new URL('../public/assets/analytics.js',import.meta.url),'utf8').replace('export function','function'),context);
  return {context,scripts,deleted,sync:allowed=>context.syncAnalytics(allowed)};
}
test('denied analytics makes no Google requests; a separate grant loads the real tag only once',()=>{
  const b=browser();
  b.sync(false);
  assert.equal(b.scripts.length,0);
  assert.equal(b.context.window.dataLayer,undefined);
  b.sync(true);b.sync(true);
  assert.equal(b.scripts.length,1);
  assert.equal(b.scripts[0].src,'https://www.googletagmanager.com/gtag/js?id=G-HGXR45VSBG');
  assert.equal(b.context.window['ga-disable-G-HGXR45VSBG'],false);
  b.sync(false);
  assert.equal(b.context.window['ga-disable-G-HGXR45VSBG'],true);
  assert.ok(b.deleted.some(cookie=>cookie.startsWith('_ga=;')));
  assert.ok(b.deleted.some(cookie=>cookie.startsWith('_ga_HGXR45VSBG=;')));
  assert.ok(b.deleted.every(cookie=>!cookie.startsWith('necessary=')));
});
test('preview traffic stays out of the production property even after consenting',()=>{
  const b=browser('localhost');b.sync(true);
  assert.equal(b.scripts.length,0);
  assert.equal(b.context.window.dataLayer,undefined);
});
