// Ícones autorais da release 26nov16 (mesmo molde chanfrado de make-icons.js): navegador, rede, data/hora, ajuda, conectado/desconectado.
const fs=require('fs'),path=require('path');const dir=path.resolve(__dirname,'..','assets','icons');
const frame=(title,color,glyph)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" shape-rendering="crispEdges">
<title>${title}</title>
<rect x="7" y="8" width="37" height="37" fill="#062b50" opacity=".8"/>
<rect x="3" y="3" width="39" height="39" fill="#505c70"/>
<path d="M3 3H42V6H6V42H3Z" fill="#f5f7ff"/>
<path d="M42 3V42H3V39H39V3Z" fill="#465062"/>
<rect x="7" y="7" width="31" height="31" fill="${color}"/>
<path d="M7 7H38V9H9V38H7Z" fill="#fff" opacity=".55"/>
<path d="M38 7V38H7V36H36V7Z" fill="#172b51" opacity=".32"/>
${glyph}
</svg>
`;
const I={
 'navegador':['ClaQui Browser','#cfe6fa',`<circle cx="22.5" cy="22.5" r="13" fill="#173c97"/><circle cx="22.5" cy="22.5" r="11" fill="#3f8fd8"/><path d="M13 19h6l2-4h5l2 5h5v3h-6l-3 3v5h-4v-6l-3-3h-4z" fill="#5fb869"/><ellipse cx="22.5" cy="22.5" rx="4.6" ry="11" fill="none" stroke="#e7f6ff" stroke-width="1.2"/><path d="M11.5 22.5h22M13 17h19M13 28h19" stroke="#e7f6ff" stroke-width="1.2" fill="none"/><path d="M29 10l7 3-5 3z" fill="#f2bf3f"/>`],
 'rede':['Configurações de Rede','#d9dde6',`<rect x="10" y="10" width="14" height="11" fill="#2b3a55"/><rect x="12" y="12" width="10" height="7" fill="#8ec7e8"/><rect x="15" y="21" width="4" height="2" fill="#2b3a55"/><rect x="23" y="22" width="14" height="11" fill="#2b3a55"/><rect x="25" y="24" width="10" height="7" fill="#b9f2c1"/><rect x="28" y="33" width="4" height="2" fill="#2b3a55"/><path d="M17 23v6h6" stroke="#d33848" stroke-width="2" fill="none"/>`],
 'rede-on':['Conectado','#d9dde6',`<rect x="10" y="10" width="14" height="11" fill="#2b3a55"/><rect x="12" y="12" width="10" height="7" fill="#8ec7e8"/><rect x="23" y="22" width="14" height="11" fill="#2b3a55"/><rect x="25" y="24" width="10" height="7" fill="#b9f2c1"/><path d="M17 23v6h6" stroke="#2f8f5d" stroke-width="2" fill="none"/>`],
 'rede-off':['Desconectado','#d9dde6',`<rect x="10" y="10" width="14" height="11" fill="#2b3a55"/><rect x="12" y="12" width="10" height="7" fill="#9aa1ad"/><rect x="23" y="22" width="14" height="11" fill="#2b3a55"/><rect x="25" y="24" width="10" height="7" fill="#9aa1ad"/><path d="M10 34L36 10" stroke="#d33848" stroke-width="3" fill="none"/>`],
 'data-hora':['Data e Hora','#e8ecf6',`<rect x="10" y="12" width="17" height="18" fill="#fff"/><rect x="10" y="12" width="17" height="4" fill="#d33848"/><path d="M13 19h3v3h-3zM18 19h3v3h-3zM13 24h3v3h-3zM18 24h3v3h-3z" fill="#173c97"/><circle cx="29" cy="28" r="8" fill="#172b51"/><circle cx="29" cy="28" r="6.4" fill="#fff"/><rect x="28.3" y="23" width="1.6" height="5.6" fill="#172b51"/><rect x="28.3" y="27.4" width="4.6" height="1.6" fill="#d33848"/>`],
 'ajuda':['Ajuda e Tutorial','#f3e9b5',`<circle cx="22.5" cy="22.5" r="13" fill="#173c97"/><circle cx="22.5" cy="22.5" r="11" fill="#3f6fc8"/><path d="M18 19c0-3 2.2-5 5-5s5 1.7 5 4.4c0 2.5-2 3.1-3.3 4.2-.8.7-.8 1.4-.8 2.4h-3c0-2 .3-3.3 1.8-4.5 1.2-1 2-1.4 2-2.4s-.8-1.6-1.8-1.6-1.8.7-1.8 1.9z" fill="#fff"/><rect x="21" y="28" width="3.2" height="3.2" fill="#fff"/>`],
 'paciencia':['Paciência','#2f8f5d',`<rect x="11" y="11" width="15" height="21" fill="#fff" stroke="#172b51" stroke-width="1.4"/><text x="14" y="21" font-family="monospace" font-weight="bold" font-size="9" fill="#d33848">A</text><text x="14" y="30" font-family="monospace" font-size="9" fill="#d33848">♥</text><rect x="20" y="14" width="15" height="21" fill="#fff" stroke="#172b51" stroke-width="1.4"/><text x="23" y="24" font-family="monospace" font-weight="bold" font-size="9" fill="#172b51">K</text><text x="23" y="33" font-family="monospace" font-size="9" fill="#172b51">♠</text>`],
 'segredo':['Arquivo secreto','#2b2f3a',`<rect x="12" y="19" width="22" height="15" fill="#f2bf3f"/><path d="M16 19v-4a7 7 0 0 1 14 0v4" fill="none" stroke="#c8c8d0" stroke-width="3"/><rect x="21" y="23" width="4" height="7" fill="#2b2f3a"/>`]
};
for(const [id,[t,c,g]] of Object.entries(I))fs.writeFileSync(path.join(dir,id+'.svg'),frame(t,c,g));
console.log('ícones gerados:',Object.keys(I).join(', '));
