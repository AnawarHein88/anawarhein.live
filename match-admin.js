const $=s=>document.querySelector(s),admin=$('#admin'),pinCard=$('#pinCard'),form=$('#matchForm'),list=$('#matchList'),output=$('#output'),toast=$('#toast');
let matches=JSON.parse(JSON.stringify(window.ANAWARHEIN_FOOTBALL_MATCHES||[])),editing=-1,homeData='',awayData='';
const say=t=>{toast.textContent=t;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1700)};
const safe=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const jsString=t=>JSON.stringify(String(t??''));

$('#pinForm').onsubmit=e=>{e.preventDefault();if($('#pin').value===window.ANAWARHEIN_ACCESS?.adminPin){pinCard.hidden=true;admin.hidden=false;render();resetForm();say('Admin ဖွင့်ပြီးပါပြီ')}else say('PIN မမှန်ပါ')};

function addStream(label='',url=''){
  const row=document.createElement('div');row.className='stream-row';
  row.innerHTML=`<input class="stream-label" placeholder="HD" value="${safe(label)}"><input class="stream-url" type="url" placeholder="https://...m3u8" value="${safe(url)}"><button type="button" aria-label="Remove">×</button>`;
  row.querySelector('button').onclick=()=>row.remove();$('#streams').append(row);
}
$('#addStream').onclick=()=>addStream();

async function imageData(file,preview){
  if(!file)return '';
  if(file.size>5*1024*1024)throw new Error('Logo file 5MB ထက်ကြီးနေပါတယ်');
  const bitmap=await createImageBitmap(file),size=192,canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
  const ctx=canvas.getContext('2d'),scale=Math.min(size/bitmap.width,size/bitmap.height),w=bitmap.width*scale,h=bitmap.height*scale;
  ctx.clearRect(0,0,size,size);ctx.drawImage(bitmap,(size-w)/2,(size-h)/2,w,h);bitmap.close?.();
  const data=canvas.toDataURL('image/png');preview.innerHTML=`<img src="${data}" alt="">`;return data;
}
$('#homeFile').onchange=async e=>{try{homeData=await imageData(e.target.files[0],$('#homePreview'))}catch(x){say(x.message)}};
$('#awayFile').onchange=async e=>{try{awayData=await imageData(e.target.files[0],$('#awayPreview'))}catch(x){say(x.message)}};

function resetForm(){editing=-1;form.reset();homeData='';awayData='';$('#homePreview').textContent='HOME';$('#awayPreview').textContent='AWAY';$('#streams').innerHTML='';addStream('FHD');addStream('HD');const n=String(matches.length+1).padStart(2,'0');$('#matchId').value=`match-${n}`;const d=new Date(Date.now()+3600000);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());$('#kickoff').value=d.toISOString().slice(0,16);form.querySelector('.primary').textContent='Match ထည့်မည်'}
$('#clearForm').onclick=resetForm;

form.onsubmit=e=>{
  e.preventDefault();
  const streams=[...document.querySelectorAll('.stream-row')].map(r=>({label:r.querySelector('.stream-label').value.trim(),url:r.querySelector('.stream-url').value.trim()})).filter(s=>s.label&&s.url);
  const homeLogo=homeData||$('#homeUrl').value.trim(),awayLogo=awayData||$('#awayUrl').value.trim();
  if(!homeLogo||!awayLogo){say('Home နဲ့ Away logo PNG သို့ URL ထည့်ပါ');return}
  const item={id:$('#matchId').value.trim(),league:$('#league').value.trim(),home:$('#home').value.trim(),away:$('#away').value.trim(),homeLogo,awayLogo,kickoff:`${$('#kickoff').value}:00+06:30`,status:$('#status').value,streams};
  if($('#homeScore').value!=='')item.homeScore=Number($('#homeScore').value);if($('#awayScore').value!=='')item.awayScore=Number($('#awayScore').value);
  const duplicate=matches.findIndex((m,i)=>m.id===item.id&&i!==editing);if(duplicate>=0){say('Match ID တူနေပါတယ်');return}
  const wasEditing=editing>=0;if(wasEditing)matches[editing]=item;else matches.push(item);render();resetForm();say(wasEditing?'Match ပြင်ပြီးပါပြီ':'Match ထည့်ပြီးပါပြီ')
};

function logoHtml(src,name){return src?`<img src="${safe(src)}" alt="">`:`<span class="team-letter">${safe(name.slice(0,2))}</span>`}
function editMatch(i){const m=matches[i];editing=i;$('#matchId').value=m.id;$('#league').value=m.league;$('#home').value=m.home;$('#away').value=m.away;$('#kickoff').value=String(m.kickoff).slice(0,16);$('#status').value=m.status||'upcoming';$('#homeScore').value=m.homeScore??'';$('#awayScore').value=m.awayScore??'';homeData=m.homeLogo||'';awayData=m.awayLogo||'';$('#homePreview').innerHTML=logoHtml(homeData,m.home);$('#awayPreview').innerHTML=logoHtml(awayData,m.away);$('#streams').innerHTML='';(m.streams||[]).forEach(s=>addStream(s.label,s.url));if(!(m.streams||[]).length)addStream('HD');form.querySelector('.primary').textContent='Match Update လုပ်မည်';window.scrollTo({top:0,behavior:'smooth'})}
function removeMatch(i){if(confirm(`${matches[i].home} vs ${matches[i].away} ဖျက်မလား?`)){matches.splice(i,1);render();resetForm();say('Match ဖျက်ပြီးပါပြီ')}}

function code(){
  const entries=matches.map(m=>{const scores=[m.homeScore!==undefined?`    homeScore: ${Number(m.homeScore)},`:null,m.awayScore!==undefined?`    awayScore: ${Number(m.awayScore)},`:null].filter(Boolean).join('\n');const streams=(m.streams||[]).map(s=>`      { label: ${jsString(s.label)}, url: ${jsString(s.url)} }`).join(',\n');return`  {\n    id: ${jsString(m.id)},\n    league: ${jsString(m.league)},\n    home: ${jsString(m.home)},\n    away: ${jsString(m.away)},\n    homeLogo: ${jsString(m.homeLogo)},\n    awayLogo: ${jsString(m.awayLogo)},\n    kickoff: ${jsString(m.kickoff)},\n    status: ${jsString(m.status)},${scores?'\n'+scores:''}\n    streams: [\n${streams}\n    ]\n  }`}).join(',\n\n');
  return`// Shared AR YONE + ANAWAR HEIN match data\nwindow.ARYONE_FOOTBALL_MATCHES = [\n${entries}\n];\n`;
}
function render(){
  $('#matchCount').textContent=`${matches.length} Matches`;
  list.innerHTML=matches.map((m,i)=>`<article class="match-item"><div class="versus">${logoHtml(m.homeLogo,m.home)}${logoHtml(m.awayLogo,m.away)}</div><div><b>${safe(m.home)} vs ${safe(m.away)}</b><small>${safe(m.league)} • ${safe(m.status)} • ${safe(String(m.kickoff).replace('T',' '))}</small></div><div class="item-actions"><button type="button" data-edit="${i}">Edit</button><button type="button" class="delete" data-delete="${i}">Delete</button></div></article>`).join('')||'<div class="empty">Match မရှိသေးပါ</div>';
  output.value=code();
}
list.onclick=e=>{const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');if(edit)editMatch(Number(edit.dataset.edit));if(del)removeMatch(Number(del.dataset.delete))};
$('#removeAll').onclick=()=>{if(matches.length&&confirm('Match အားလုံးဖျက်မလား?')){matches=[];render();resetForm()}};
$('#copyCode').onclick=async()=>{try{await navigator.clipboard.writeText(output.value);say('Code copy လုပ်ပြီးပါပြီ')}catch{output.select();document.execCommand('copy');say('Code copy လုပ်ပြီးပါပြီ')}};
$('#downloadCode').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([output.value],{type:'text/javascript'}));a.download='custom-matches.js';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
