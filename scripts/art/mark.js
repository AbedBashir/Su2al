// Shared icon drawing. mode: full | fg | bg | mono | splash
function iconSvg(mode, size) {
  const font = `<style>@font-face{font-family:T;src:url('../../assets/fonts/Tajawal_800ExtraBold.ttf')}</style>`;
  const bg = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8A5CFF"/><stop offset="0.55" stop-color="#6C3CE9"/><stop offset="1" stop-color="#4A1FB8"/></linearGradient>
    <radialGradient id="glow" cx="0.78" cy="0.18" r="0.6"><stop offset="0" stop-color="#B49BFF" stop-opacity="0.55"/><stop offset="1" stop-color="#B49BFF" stop-opacity="0"/></radialGradient></defs>
    <rect width="1024" height="1024" fill="url(#g)"/><rect width="1024" height="1024" fill="url(#glow)"/>`;
  const white = '#fff';
  const ink = '#6C3CE9';
  // Bubble: rounded square with a tail at the bottom-left (speech coming from the reader's side in RTL).
  const bubble = `
    <g transform="translate(512 500)">
      <path d="M-250 -210 Q-250 -270 -190 -270 L190 -270 Q250 -270 250 -210 L250 150 Q250 210 190 210 L-60 210 L-170 300 L-150 210 L-190 210 Q-250 210 -250 150 Z"
        fill="${white}" ${mode === 'mono' ? 'mask="url(#cut)"' : 'filter="url(#sh)"'}/>
      ${mode === 'mono' ? '' : `<text x="0" y="118" text-anchor="middle" font-family="T" font-weight="800" font-size="390" fill="${ink}">؟</text>`}
    </g>
    ${mode === 'mono' ? '' : `<g transform="translate(762 262)"><path d="M0 -70 C10 -18 18 -10 70 0 C18 10 10 18 0 70 C-10 18 -18 10 -70 0 C-18 -10 -10 -18 0 -70 Z" fill="#FFC53D"/></g>
    <circle cx="830" cy="380" r="16" fill="#FFC53D" opacity="0.9"/>`}`;
  const cut = `<defs><mask id="cut" maskUnits="userSpaceOnUse" x="-600" y="-600" width="1200" height="1200"><rect x="-600" y="-600" width="1200" height="1200" fill="#fff"/><text x="0" y="118" text-anchor="middle" font-family="T" font-weight="800" font-size="390" fill="#000">؟</text></mask></defs>`;
  const shadow = `<defs><filter id="sh" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="22" stdDeviation="26" flood-color="#2A0F77" flood-opacity="0.45"/></filter></defs>`;
  // Foreground layers must fit Android's 66% safe zone, so the mark shrinks there.
  const scale = { full: 1.08, fg: 0.8, mono: 0.8, splash: 0.95, bg: 1 }[mode];
  const mark = `<g transform="translate(512 512) scale(${scale}) translate(-512 -512)">${bubble}</g>`;
  const body = mode === 'bg' ? bg : mode === 'full' ? bg + shadow + mark : mode === 'mono' ? cut + mark : shadow + mark;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">${font}${body}</svg>`;
}
