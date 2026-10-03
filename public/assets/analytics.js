const MEASUREMENT_ID='G-HGXR45VSBG';
let started=false;
let enabled=false;

export function syncAnalytics(allowed) {
  // Local previews never send traffic to the production property.
  if(!['go2-ai.com','www.go2-ai.com'].includes(location.hostname)) return;
  window[`ga-disable-${MEASUREMENT_ID}`]=!allowed;
  if(!allowed) {
    if(enabled) {
      window.gtag('consent','update',{analytics_storage:'denied'});
      for(const cookie of document.cookie.split(';')) {
        const name=cookie.trim().split('=')[0];
        if(!/^_ga(?:_|$)/.test(name)) continue;
        for(const domain of ['', '; domain=go2-ai.com', '; domain=www.go2-ai.com']) {
          document.cookie=`${name}=; Max-Age=0; path=/${domain}; Secure; SameSite=Lax`;
        }
      }
    }
    enabled=false;
    return;
  }
  window.dataLayer=window.dataLayer || [];
  window.gtag=window.gtag || function(){window.dataLayer.push(arguments);};
  if(!started) {
    window.gtag('consent','default',{
      analytics_storage:'denied',ad_storage:'denied',
      ad_user_data:'denied',ad_personalization:'denied',
    });
    window.gtag('js',new Date());
  }
  if(!enabled) window.gtag('consent','update',{analytics_storage:'granted'});
  if(!started) {
    window.gtag('config',MEASUREMENT_ID,{
      allow_google_signals:false,
      allow_ad_personalization_signals:false,
      cookie_expires:180*24*60*60,
      page_location:location.origin+location.pathname,
    });
    const script=document.createElement('script');
    script.async=true;
    script.src=`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.append(script);
    started=true;
  }
  enabled=true;
}
