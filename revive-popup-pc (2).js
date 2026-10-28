/**
 * MSA Revive PC Popup Loader — MSA_AD_READY Signal / No Overlay
 */
(function () {
  'use strict';
  var currentScript=document.currentScript||document.querySelector('script[src*="/ads/revive-popup-pc.js"],script[src*="revive-popup-pc.js"]');
  if(!currentScript)return;
  var zoneId=String(currentScript.getAttribute('data-zone')||'').trim();
  if(!/^\d+$/.test(zoneId))return;
  if(window.__MSA_REVIVE_PC_POPUP_ACTIVE__)return;
  window.__MSA_REVIVE_PC_POPUP_ACTIVE__=true;

  var REVIVE_ID='787804e582d413f05180b1bcf7b4d832';
  var REVIVE_ASYNC_URL='https://sknteam.com/www/delivery/asyncjs.php';
  var AD_LOAD_TIMEOUT_MS=10000; // Wait up to 10s for MSA_AD_READY
  var AUTO_CLOSE_MS=5000;
  var overlay=null,observer=null,loadTimeout=null,closeTimeout=null,verifyTimer=null,closed=false;

  function injectStyles(){
    if(document.getElementById('msa-revive-pc-popup-style'))return;
    var style=document.createElement('style');
    style.id='msa-revive-pc-popup-style';
    style.textContent=`
      #msa-revive-pc-popup-overlay{position:fixed!important;inset:0!important;z-index:2147483647!important;display:flex!important;align-items:center!important;justify-content:center!important;width:100vw!important;height:100vh!important;height:100dvh!important;padding:60px!important;box-sizing:border-box!important;background:transparent!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
      #msa-revive-pc-popup-overlay.is-visible{visibility:visible!important;opacity:1!important;pointer-events:none!important}
      #msa-revive-pc-popup-box{position:relative!important;width:min(800px,calc(100vw - 120px),calc((100dvh - 120px)*1.7777778))!important;aspect-ratio:16/9!important;max-height:calc(100dvh - 120px)!important;overflow:hidden!important;
        border-radius: 0 !important;background:transparent!important;pointer-events:auto!important}
      #msa-revive-pc-popup-ad,#msa-revive-pc-popup-ad>ins,#msa-revive-pc-popup-ad>div,#msa-revive-pc-popup-ad iframe{display:block!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;margin:0!important;padding:0!important;border:0!important;border-radius:inherit!important;background:transparent!important;box-sizing:border-box!important}
      #msa-revive-pc-popup-close{position:absolute!important;top:12px!important;right:12px!important;z-index:2147483647!important;display:flex!important;align-items:center!important;justify-content:center!important;width:42px!important;height:42px!important;padding:0!important;border: 0 !important;border-radius: 0 !important;background: transparent !important;color:#fff!important;font:400 30px/1 Arial,sans-serif!important;cursor:pointer!important;pointer-events:auto!important;visibility:hidden!important;opacity:0!important}
      #msa-revive-pc-popup-overlay.is-visible #msa-revive-pc-popup-close{visibility:visible!important;opacity:1!important}
      @media(max-width:900px),(max-height:650px){#msa-revive-pc-popup-overlay{padding:32px!important}#msa-revive-pc-popup-box{width:min(800px,calc(100vw - 64px),calc((100dvh - 64px)*1.7777778))!important;max-height:calc(100dvh - 64px)!important}}
    `;
    document.head.appendChild(style);
  }

  function cleanup(){
    if(observer){observer.disconnect();observer=null;}
    if(loadTimeout){clearTimeout(loadTimeout);loadTimeout=null;}
    if(closeTimeout){clearTimeout(closeTimeout);closeTimeout=null;}
    if(verifyTimer){clearTimeout(verifyTimer);verifyTimer=null;}
    document.removeEventListener('keydown',onKeyDown);
    window.removeEventListener('message',onCreativeMessage);
  }
  function closePopup(){if(closed)return;closed=true;cleanup();if(overlay&&overlay.parentNode)overlay.parentNode.removeChild(overlay);overlay=null;window.__MSA_REVIVE_PC_POPUP_ACTIVE__=false;}
  function onKeyDown(e){if(e.key==='Escape')closePopup();}

  function showPopupFromReadySignal(){
    if(closed||!overlay)return;

    if(loadTimeout){
      clearTimeout(loadTimeout);
      loadTimeout=null;
    }

    if(observer){
      observer.disconnect();
      observer=null;
    }

    if(verifyTimer){
      clearTimeout(verifyTimer);
      verifyTimer=null;
    }

    overlay.classList.add('is-visible');

    if(!closeTimeout){
      closeTimeout=setTimeout(closePopup,AUTO_CLOSE_MS);
    }
  }

  function onCreativeMessage(event){
    if(closed||!event||!event.data)return;

    var data=event.data;

    if(typeof data==='string'){
      if(data!=='MSA_AD_READY')return;
    }else{
      if(data.type!=='MSA_AD_READY')return;
    }

    showPopupFromReadySignal();
  }

  function watchForCreative(){
    window.addEventListener('message',onCreativeMessage);

    loadTimeout=setTimeout(function(){
      closePopup();
    },AD_LOAD_TIMEOUT_MS);
  }

  function requestReviveScan(){window.reviveAsync=window.reviveAsync||[];window.reviveAsync.push({});}
  function loadRevive(){var existing=document.querySelector('script[src^="'+REVIVE_ASYNC_URL+'"],script[src^="//sknteam.com/www/delivery/asyncjs.php"]');if(existing){setTimeout(requestReviveScan,100);return;}var script=document.createElement('script');script.src=REVIVE_ASYNC_URL;script.async=true;script.defer=true;script.addEventListener('load',requestReviveScan,{once:true});script.addEventListener('error',closePopup,{once:true});document.body.appendChild(script);}

  function start(){
    if(!document.body){document.addEventListener('DOMContentLoaded',start,{once:true});return;}
    injectStyles();
    overlay=document.createElement('div');overlay.id='msa-revive-pc-popup-overlay';
    var box=document.createElement('div');box.id='msa-revive-pc-popup-box';
    var adContainer=document.createElement('div');adContainer.id='msa-revive-pc-popup-ad';
    var ins=document.createElement('ins');ins.setAttribute('data-revive-zoneid',zoneId);ins.setAttribute('data-revive-id',REVIVE_ID);
    var closeButton=document.createElement('button');closeButton.id='msa-revive-pc-popup-close';closeButton.type='button';closeButton.setAttribute('aria-label','Close advertisement');closeButton.innerHTML='&times;';
    adContainer.appendChild(ins);box.appendChild(adContainer);box.appendChild(closeButton);overlay.appendChild(box);document.body.appendChild(overlay);
    closeButton.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();closePopup();});
    document.addEventListener('keydown',onKeyDown);
    watchForCreative();loadRevive();
  }
  start();
})();
