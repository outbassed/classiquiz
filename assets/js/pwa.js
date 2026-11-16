/* ClaQui OS: atualizações do shell hospedado. Sem cache offline do jogo. */
(()=>{'use strict';if(!('serviceWorker' in navigator)||!/^https?:$/.test(location.protocol))return;
window.addEventListener('load',()=>{navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).catch(err=>console.warn('[PWA]',err));});
})();
