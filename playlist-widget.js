/* ══ 本週推薦歌單：每一頁右下角的浮動唱片（所有頁面共用）══
   歌單資料：playlist.json（泰劇站後台「🎵 歌單」上傳）；同一個瀏覽器若有較新的本機草稿（tb-playlist）會優先顯示，方便管理者預覽。
   只播放 YouTube 官方影片；換頁時記住歌曲與播放位置，下一頁可一鍵「繼續播放」。 */
(function(){
  if(window.__plw)return;window.__plw=true;
  const STATE='plw-state';
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ytId=u=>{u=String(u||'').trim();const m=u.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/);return m?m[1]:(/^[\w-]{11}$/.test(u)?u:'');};
  const cover=s=>{const c=String(s.cover||'').trim();if(c&&!/^(javascript|data:(?!image\/))/i.test(c))return c;const id=ytId(s.yt);return id?'https://i.ytimg.com/vi/'+id+'/hqdefault.jpg':'';};
  const ss={get(){try{return JSON.parse(sessionStorage.getItem(STATE)||'null');}catch(e){return null;}},set(v){try{sessionStorage.setItem(STATE,JSON.stringify(v));}catch(e){}}};

  const CSS=`
#plw{position:fixed;right:20px;bottom:20px;z-index:7500;font-family:'Noto Sans TC',sans-serif;--b:18 14 11;--f:245 237 216;--a:#E8863A;--ar:232 134 58;--on:#1A0F08;color:rgb(var(--f));}
#plw *{box-sizing:border-box;}
.plw-fab,.plw-tip,.plw-resume,.plw-panel *{transition:background-color .5s,color .5s,border-color .5s,box-shadow .5s;}
.plw-fab{position:relative;width:60px;height:60px;border-radius:50%;border:none;padding:0;cursor:pointer;background:rgb(var(--b));box-shadow:0 10px 28px rgba(0,0,0,.35),0 0 0 2px rgb(var(--ar)/.6);display:block;}
.plw-fab:focus-visible,.plw-panel button:focus-visible,.plw-panel a:focus-visible,.plw-item:focus-visible{outline:2px solid var(--a);outline-offset:2px;}
.plw-fab-disc{position:absolute;inset:5px;border-radius:50%;background:repeating-radial-gradient(circle,#151515 0 1.5px,#222 1.5px 3px);animation:plwSpin 2.6s linear infinite;animation-play-state:paused;}
.plw-fab-disc::after{content:'';position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 30deg,transparent 0 40deg,rgba(255,255,255,.1) 55deg,transparent 75deg 220deg,rgba(255,255,255,.07) 235deg,transparent 255deg);}
.plw-fab-lbl{position:absolute;inset:32%;border-radius:50%;background:var(--a) center/cover;}
.plw-fab-lbl::after{content:'';position:absolute;left:50%;top:50%;width:18%;height:18%;border-radius:50%;background:#0B0B0B;transform:translate(-50%,-50%);}
.plw-fab-note{position:absolute;right:-2px;top:-2px;width:22px;height:22px;border-radius:50%;background:var(--a);color:var(--on);font-size:12px;line-height:22px;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.3);}
#plw.playing .plw-fab-disc{animation-play-state:running;}
#plw.playing .plw-fab{box-shadow:0 10px 28px rgba(0,0,0,.35),0 0 0 2px var(--a),0 0 18px rgb(var(--ar)/.55);}
.plw-tip{position:absolute;right:70px;bottom:16px;white-space:nowrap;background:rgb(var(--b)/.96);border:1px solid rgb(var(--ar)/.35);border-radius:20px;padding:.32rem .8rem;font-size:.74rem;color:var(--a);opacity:0;transform:translateX(6px);transition:opacity .25s,transform .25s,background-color .5s,color .5s;pointer-events:none;}
#plw:not(.open) .plw-fab:hover + .plw-tip{opacity:1;transform:none;}
.plw-resume{position:absolute;right:70px;bottom:12px;white-space:nowrap;max-width:min(260px,calc(100vw - 110px));overflow:hidden;text-overflow:ellipsis;background:var(--a);color:var(--on);border:none;border-radius:22px;padding:.5rem .95rem;font-size:.78rem;font-weight:600;cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,.3);font-family:inherit;}
.plw-resume[hidden]{display:none;}
.plw-panel{position:absolute;right:0;bottom:74px;width:340px;max-height:min(640px,calc(100vh - 110px));overflow-y:auto;background:rgb(var(--b)/.97);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgb(var(--ar)/.3);border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.4);padding:1.1rem 1.1rem 1rem;opacity:0;transform:translateY(14px) scale(.98);transform-origin:bottom right;pointer-events:none;transition:opacity .28s,transform .28s,background-color .5s,border-color .5s;}
#plw.open .plw-panel{opacity:1;transform:none;pointer-events:auto;}
.plw-head{display:flex;justify-content:space-between;align-items:flex-start;gap:.6rem;margin-bottom:.9rem;}
.plw-eyebrow{font-family:'Space Mono',monospace;font-size:.58rem;letter-spacing:.26em;color:var(--a);}
.plw-title{font-family:'Noto Serif TC',serif;font-size:1.12rem;color:rgb(var(--f));margin-top:.15rem;}
.plw-week{font-family:'Space Mono',monospace;font-size:.6rem;letter-spacing:.14em;color:rgb(var(--f)/.6);margin-top:.2rem;}
.plw-close{width:30px;height:30px;flex-shrink:0;border-radius:50%;border:1px solid rgb(var(--f)/.2);background:none;color:rgb(var(--f)/.75);cursor:pointer;font-size:.8rem;}
.plw-now{display:flex;gap:.9rem;align-items:center;}
.plw-disc{position:relative;width:72px;height:72px;flex-shrink:0;border-radius:50%;background:repeating-radial-gradient(circle,#141414 0 1.5px,#1F1F1F 1.5px 3px);box-shadow:0 0 0 4px rgb(var(--f)/.12);animation:plwSpin 2.6s linear infinite;animation-play-state:paused;}
.plw-disc-lbl{position:absolute;inset:30%;border-radius:50%;background:var(--a) center/cover;}
#plw.playing .plw-disc{animation-play-state:running;}
.plw-now-tag{font-family:'Space Mono',monospace;font-size:.56rem;letter-spacing:.24em;color:var(--a);}
.plw-now-t{font-size:.95rem;font-weight:500;color:rgb(var(--f));margin-top:.15rem;}
.plw-now-s{font-size:.72rem;color:rgb(var(--f)/.6);margin-top:.1rem;}
.plw-ctrl{display:flex;align-items:center;gap:.5rem;margin:.9rem 0 .2rem;}
.plw-ctrl button{width:36px;height:36px;border-radius:50%;border:1px solid rgb(var(--f)/.22);background:none;color:rgb(var(--f));cursor:pointer;font-size:.8rem;}
.plw-ctrl button:hover{border-color:var(--a);color:var(--a);}
.plw-ctrl .plw-play{width:44px;height:44px;border:none;background:var(--a);color:var(--on);font-size:.95rem;}
.plw-ctrl .plw-play:hover{color:var(--on);filter:brightness(1.08);}
.plw-ctrl a{margin-left:auto;font-size:.7rem;color:rgb(var(--f)/.55);text-decoration:none;}
.plw-ctrl a:hover{color:var(--a);}
.plw-msg{font-size:.7rem;color:var(--a);min-height:1em;margin:.3rem 0;}
.plw-video{display:none;border-radius:10px;overflow:hidden;aspect-ratio:16/9;background:#000;margin-bottom:.8rem;}
.plw-video.on{display:block;}
.plw-video iframe{width:100%;height:100%;border:0;display:block;}
.plw-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.4rem;}
.plw-item{display:flex;gap:.7rem;align-items:center;padding:.45rem;border-radius:10px;cursor:pointer;border:1px solid transparent;}
.plw-item:hover{background:rgb(var(--ar)/.09);}
.plw-item.active{background:rgb(var(--ar)/.15);border-color:rgb(var(--ar)/.4);}
.plw-item img,.plw-item .plw-noimg{width:46px;height:46px;flex-shrink:0;border-radius:5px;object-fit:cover;background:rgb(var(--f)/.1);}
.plw-it{min-width:0;flex:1;}
.plw-it-t{font-size:.84rem;color:rgb(var(--f));white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.plw-it-s{font-size:.68rem;color:rgb(var(--f)/.58);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.plw-it-n{font-size:.7rem;color:var(--a);margin-top:.1rem;}
.plw-it-n:empty{display:none;}
.plw-no{font-family:'Space Mono',monospace;font-size:.6rem;color:rgb(var(--ar)/.85);width:1.4rem;flex-shrink:0;}
.plw-intro{font-size:.72rem;line-height:1.7;color:rgb(var(--f)/.55);margin-top:.8rem;}
.plw-intro:empty{display:none;}
@keyframes plwSpin{to{transform:rotate(360deg);}}
@media(max-width:520px){#plw{right:14px;bottom:14px;}.plw-panel{position:fixed;left:10px;right:10px;bottom:84px;width:auto;}}
@media(prefers-reduced-motion:reduce){.plw-fab-disc,.plw-disc{animation:none!important;}.plw-panel,.plw-fab,.plw-tip,.plw-resume,.plw-panel *{transition:none!important;}}
@media print{#plw{display:none;}}`;

  let data=null,songs=[],idx=-1,player=null,ready=false,playing=false,pending=null,root=null;

  function pickData(json){
    let local=null;try{local=JSON.parse(localStorage.getItem('tb-playlist')||'null');}catch(e){}
    if(local&&Array.isArray(local.songs)&&(+local.savedAt||0)>(+(json&&json.savedAt)||0))return local;
    return json;
  }
  function load(){
    return fetch('playlist.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null).then(j=>pickData(j));
  }
  function el(sel){return root.querySelector(sel);}

  function build(){
    if(!document.getElementById('plw-css')){const st=document.createElement('style');st.id='plw-css';st.textContent=CSS;document.head.appendChild(st);}
    root=document.createElement('div');root.id='plw';
    root.innerHTML='<button class="plw-fab" type="button" aria-expanded="false" aria-controls="plw-panel" aria-label="打開本週推薦歌單"><span class="plw-fab-disc"><span class="plw-fab-lbl"></span></span><span class="plw-fab-note" aria-hidden="true">♪</span></button>'
      +'<span class="plw-tip">本週推薦歌單</span>'
      +'<button class="plw-resume" type="button" hidden></button>'
      +'<div class="plw-panel" id="plw-panel" role="dialog" aria-label="本週推薦歌單">'
        +'<div class="plw-head"><div><div class="plw-eyebrow">WEEKLY PLAYLIST</div><div class="plw-title"></div><div class="plw-week"></div></div><button class="plw-close" type="button" aria-label="收起歌單">✕</button></div>'
        +'<div class="plw-now"><div class="plw-disc" aria-hidden="true"><div class="plw-disc-lbl"></div></div><div><div class="plw-now-tag">NOW PLAYING</div><div class="plw-now-t">選一首歌開始聽</div><div class="plw-now-s"></div></div></div>'
        +'<div class="plw-ctrl"><button type="button" class="plw-prev" aria-label="上一首">⏮</button><button type="button" class="plw-play" aria-label="播放">▶</button><button type="button" class="plw-next" aria-label="下一首">⏭</button><a class="plw-yt" href="#" target="_blank" rel="noopener" style="visibility:hidden;">在 YouTube 開啟 ↗</a></div>'
        +'<div class="plw-msg" aria-live="polite"></div>'
        +'<div class="plw-video"><div id="plw-player"></div></div>'
        +'<ol class="plw-list"></ol><div class="plw-intro"></div>'
      +'</div><!--/plw-->';
    document.body.appendChild(root);
    el('.plw-fab').addEventListener('click',()=>setOpen(!root.classList.contains('open')));
    el('.plw-close').addEventListener('click',()=>{setOpen(false);el('.plw-fab').focus();});
    el('.plw-prev').addEventListener('click',()=>step(-1));
    el('.plw-next').addEventListener('click',()=>step(1));
    el('.plw-play').addEventListener('click',toggle);
    el('.plw-list').addEventListener('click',e=>{const li=e.target.closest('.plw-item');if(li)play(+li.dataset.i);});
    el('.plw-resume').addEventListener('click',resume);
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&root.classList.contains('open')){setOpen(false);el('.plw-fab').focus();}});
  }
  function setOpen(on){
    root.classList.toggle('open',on);
    el('.plw-fab').setAttribute('aria-expanded',on?'true':'false');
    el('.plw-fab').setAttribute('aria-label',on?'收起本週推薦歌單':'打開本週推薦歌單');
    if(on)el('.plw-resume').hidden=true;
  }
  function render(){
    el('.plw-title').textContent=data.title||'本週推薦歌單';
    el('.plw-week').textContent=data.week||'';
    el('.plw-intro').textContent=data.intro||'';
    el('.plw-list').innerHTML=songs.map((s,i)=>{const cv=cover(s);
      return '<li class="plw-item'+(i===idx?' active':'')+'" data-i="'+i+'" tabindex="0" role="button" aria-label="播放 '+esc(s.title)+'">'
        +'<span class="plw-no">'+String(i+1).padStart(2,'0')+'</span>'
        +(cv?'<img src="'+esc(cv)+'" alt="" loading="lazy">':'<span class="plw-noimg"></span>')
        +'<div class="plw-it"><div class="plw-it-t">'+esc(s.title)+'</div><div class="plw-it-s">'+esc(s.artist||'')+(s.drama?' · 《'+esc(s.drama)+'》':'')+'</div><div class="plw-it-n">'+esc(s.note||'')+'</div></div></li>';}).join('');
    el('.plw-list').querySelectorAll('.plw-item').forEach(li=>li.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();play(+li.dataset.i);}}));
    const first=songs[0];if(first&&idx<0)setLabel(cover(first));
  }
  function setLabel(cv){const v=cv?'url("'+cv.replace(/"/g,'%22')+'")':'';el('.plw-fab-lbl').style.backgroundImage=v;el('.plw-disc-lbl').style.backgroundImage=v;}
  function setPlaying(on){
    playing=on;root.classList.toggle('playing',on);
    const b=el('.plw-play');b.textContent=on?'❚❚':'▶';b.setAttribute('aria-label',on?'暫停':'播放');
    el('.plw-list').querySelectorAll('.plw-item').forEach((li,i)=>li.classList.toggle('active',i===idx));
    saveState();
  }
  function saveState(){
    const s=songs[idx];if(!s)return;
    let t=0;try{if(player&&ready&&player.getCurrentTime)t=Math.floor(player.getCurrentTime()||0);}catch(e){}
    ss.set({yt:ytId(s.yt),title:s.title,t:t,playing:playing});
  }
  function loadYT(cb){
    if(window.YT&&window.YT.Player){cb();return;}
    const prev=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=function(){if(typeof prev==='function')prev();cb();};
    if(!document.getElementById('plw-yt-api')){const s=document.createElement('script');s.id='plw-yt-api';s.src='https://www.youtube.com/iframe_api';document.head.appendChild(s);}
  }
  function play(i,start){
    const s=songs[i];if(!s)return;
    idx=i;const id=ytId(s.yt);
    el('.plw-now-t').textContent=s.title;
    el('.plw-now-s').textContent=(s.artist||'')+(s.drama?' · 《'+s.drama+'》':'');
    setLabel(cover(s));
    const a=el('.plw-yt');a.href=id?'https://www.youtube.com/watch?v='+id:'#';a.style.visibility=id?'visible':'hidden';
    el('.plw-msg').textContent=id?'':'這首歌還沒有 YouTube 連結。';
    setPlaying(false);
    if(!id){if(player&&ready)player.pauseVideo();el('.plw-video').classList.remove('on');return;}
    el('.plw-video').classList.add('on');
    const opts={videoId:id,startSeconds:start||0};
    if(player&&ready){player.loadVideoById(opts);return;}
    pending=opts;if(player)return;
    loadYT(()=>{
      player=new YT.Player('plw-player',{videoId:id,playerVars:{autoplay:1,playsinline:1,rel:0,modestbranding:1},
        events:{
          onReady:e=>{ready=true;e.target.loadVideoById(pending);},
          onStateChange:e=>{
            if(e.data===YT.PlayerState.PLAYING){setPlaying(true);el('.plw-msg').textContent='';}
            else if(e.data===YT.PlayerState.PAUSED)setPlaying(false);
            else if(e.data===YT.PlayerState.ENDED){setPlaying(false);step(1);}
          },
          onError:()=>{setPlaying(false);el('.plw-msg').textContent='這首歌的版權方不允許在其他網站播放，請點「在 YouTube 開啟」收聽。';}
        }});
    });
  }
  function toggle(){if(idx<0){play(0);return;}if(!player||!ready)return;playing?player.pauseVideo():player.playVideo();}
  function step(d){const n=songs.length;if(!n)return;play(((idx<0?0:idx+d)%n+n)%n);}
  function resume(){
    const st=ss.get();const i=st?songs.findIndex(s=>ytId(s.yt)===st.yt):-1;
    el('.plw-resume').hidden=true;
    if(i>=0){setOpen(true);play(i,st.t||0);}
  }

  // ── 顏色跟著背後的網頁背景走：取按鈕正後方元素的背景色（漸層取平均），亮底配深字、暗底配淺字 ──
  function hexRGB(h){h=h.slice(1);if(h.length<6)h=h.split('').map(c=>c+c).join('');const n=parseInt(h.slice(0,6),16);return [n>>16&255,n>>8&255,n&255,h.length>=8?parseInt(h.slice(6,8),16)/255:1];}
  function parseRGB(c){if(c[0]==='#')return hexRGB(c);const m=c.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,\/]+([\d.]+)(%?))?/);if(!m)return null;return [+m[1],+m[2],+m[3],m[4]==null?1:(m[5]?+m[4]/100:+m[4])];}
  function gradAvg(img){const cols=(img.match(/rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}\b/g)||[]).map(parseRGB).filter(c=>c&&c[3]>.3);if(!cols.length)return null;return [0,1,2].map(k=>cols.reduce((t,c)=>t+c[k],0)/cols.length).concat(1);}
  function bgUnder(x,y){
    const els=document.elementsFromPoint(x,y).filter(e=>!root.contains(e));
    for(const e of els){
      if(/^(IMG|VIDEO|CANVAS|SVG|IFRAME)$/i.test(e.tagName))continue;
      const cs=getComputedStyle(e);if(cs.visibility==='hidden'||+cs.opacity<.5)continue;
      const c=parseRGB(cs.backgroundColor||'');
      if(c&&c[3]>=.6)return c;
      if(cs.backgroundImage&&cs.backgroundImage.indexOf('gradient')>=0){const g=gradAvg(cs.backgroundImage);if(g)return g;}
    }
    return parseRGB(getComputedStyle(document.body).backgroundColor||'')||[18,14,11,1];
  }
  let lastTone='';
  function adapt(){
    if(!root)return;
    const r=el('.plw-fab').getBoundingClientRect();
    const c=bgUnder(r.left+r.width/2,r.top+r.height/2);
    const lin=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};
    const L=.2126*lin(c[0])+.7152*lin(c[1])+.0722*lin(c[2]);
    const light=L>.4;
    // 保留同一個色相，但把明度推到文字讀得清楚的範圍：暗底壓到夠暗、亮底提到夠亮
    const lum=p=>.2126*lin(p[0])+.7152*lin(p[1])+.0722*lin(p[2]);
    let p=c.slice(0,3);const to=light?[255,255,255]:[0,0,0];
    for(let i=0;i<12&&(light?lum(p)<.55:lum(p)>.07);i++)p=p.map((v,k)=>v+(to[k]-v)*.12);
    const base=p.map(Math.round).join(' ');
    const key=base+(light?'L':'D');if(key===lastTone)return;lastTone=key;
    const st=root.style;
    st.setProperty('--b',base);
    st.setProperty('--f',light?'42 26 14':'245 237 216');
    st.setProperty('--a',light?'#B4521F':'#E8863A');
    st.setProperty('--ar',light?'180 82 31':'232 134 58');
    st.setProperty('--on',light?'#FFF6EC':'#1A0F08');
  }
  let adaptQ=false;
  function queueAdapt(){if(adaptQ)return;adaptQ=true;requestAnimationFrame(()=>{adaptQ=false;adapt();});}

  // 發布（把網頁烤成 HTML）時移除浮動歌單，載入時會重新產生
  window.plwStrip=function(html){
    return html.replace(/<div id="plw"[\s\S]*?<!--\/plw--><\/div>/,'')
      .replace(/<style id="plw-css">[\s\S]*?<\/style>/,'')
      .replace(/<script[^>]*src="https:\/\/www\.youtube\.com\/[^"]*"[^>]*><\/script>/g,'');
  };
  // 後台儲存歌單後即時更新
  window.plwReload=function(){load().then(d=>{if(!d)return;data=d;songs=(d.songs||[]).filter(s=>s&&s.title);if(!songs.length){if(root)root.style.display='none';return;}if(!root)build();root.style.display='';idx=Math.min(idx,songs.length-1);render();});};

  function init(){
    load().then(d=>{
      if(!d)return;data=d;songs=(d.songs||[]).filter(s=>s&&s.title);
      if(!songs.length)return;
      build();render();adapt();
      window.addEventListener('scroll',queueAdapt,{passive:true});window.addEventListener('resize',queueAdapt);setInterval(adapt,1200);
      const st=ss.get();
      if(st&&st.playing&&songs.some(s=>ytId(s.yt)===st.yt)){
        const b=el('.plw-resume');b.innerHTML='▶ 繼續播放：<b>'+esc(st.title)+'</b>';b.hidden=false;
      }
      setInterval(()=>{if(playing)saveState();},3000);
      window.addEventListener('pagehide',saveState);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
