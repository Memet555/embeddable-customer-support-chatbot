const form = document.querySelector('#form');
const input = document.querySelector('#input');
const log = document.querySelector('#log');

function addMessage(text, who = 'bot') {
  const div = document.createElement('div');
  div.className = `msg msg--${who}`;
  const now = new Date();
  const time = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' }).format(now);
  div.innerHTML = `${escapeHtml(text)}<span class=\"time\">${time}</span>`;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function escapeHtml(str){
  return (str||'').replace(/[&<>\"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[s]));
}

async function askBackend(message){
  const base = (window.BASE_PATH || "/");
  const url = base.replace(/\/$/, '') + "/api/chat";
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ message })
  });
  if (!res.ok) throw new Error('Server error');
  const data = await res.json();
  return data.reply || '';
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const text = input.value.trim();
  if(!text) return;
  addMessage(text, 'me');
  input.value = '';

  const typing = document.createElement('div');
  typing.className = 'typing';
  typing.textContent = 'Yazıyor…';
  log.appendChild(typing); log.scrollTop = log.scrollHeight;

  try{
    const reply = await askBackend(text);
    log.removeChild(typing);
    addMessage(reply, 'bot');
  }catch(err){
    log.removeChild(typing);
    addMessage('Bir hata oluştu. Lütfen tekrar deneyin.', 'bot');
  }
});

addMessage('Merhaba! Butik destek botuna hoş geldiniz. Nasıl yardımcı olabilirim?');
