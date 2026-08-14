const DEFAULTS={autoRefresh:true,refreshInterval:30,autoplay:true,accent:'#258df2'};
const saved=JSON.parse(localStorage.getItem('anawarheinSettings')||localStorage.getItem('y2Settings')||'{}');let settings={...DEFAULTS,...saved};
const autoRefresh=document.querySelector('#autoRefresh'),refreshInterval=document.querySelector('#refreshInterval'),autoplay=document.querySelector('#autoplay'),message=document.querySelector('#saved');
function fill(){autoRefresh.checked=settings.autoRefresh;refreshInterval.value=String(settings.refreshInterval);autoplay.checked=settings.autoplay;document.documentElement.style.setProperty('--blue',settings.accent);document.querySelectorAll('[data-color]').forEach(b=>b.classList.toggle('active',b.dataset.color===settings.accent))}
document.querySelectorAll('[data-color]').forEach(button=>button.onclick=()=>{settings.accent=button.dataset.color;fill()});
document.querySelector('#settingsForm').onsubmit=event=>{event.preventDefault();settings={...settings,autoRefresh:autoRefresh.checked,refreshInterval:Number(refreshInterval.value),autoplay:autoplay.checked};delete settings.fallbackUrl;localStorage.setItem('anawarheinSettings',JSON.stringify(settings));fill();message.classList.add('show');setTimeout(()=>message.classList.remove('show'),1600)};
document.querySelector('#reset').onclick=()=>{settings={...DEFAULTS};localStorage.removeItem('anawarheinSettings');localStorage.removeItem('y2Settings');fill()};fill();
document.querySelector('#logout').onclick=()=>{localStorage.removeItem('anawarheinAccessSession');location.href='access.html'};
