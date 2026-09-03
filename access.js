const form = document.querySelector('#loginForm');
const input = document.querySelector('#accessCode');
const error = document.querySelector('#loginError');
const loginButton = form.querySelector('.login');

input.addEventListener('input', () => {
  input.value = input.value.replace(/\D/g, '').slice(0, 8);
});

form.onsubmit = async event => {
  event.preventDefault();
  loginButton.disabled = true;
  error.textContent = 'Code စစ်ဆေးနေပါသည်…';

  const result = await AccessCore.verifyCode(input.value);
  if (!result.ok) {
    error.textContent = result.error;
    loginButton.disabled = false;
    return;
  }

  AccessCore.saveSession(result.data);
  error.style.color = '#5ddd9b';
  error.textContent = 'Login အောင်မြင်ပါပြီ';
  const next = new URLSearchParams(location.search).get('next') || 'index.html';
  setTimeout(() => location.replace(/^[a-z0-9-]+\.html$/i.test(next) ? next : 'index.html'), 400);
};

document.querySelector('#pasteCode').onclick = async () => {
  try {
    input.value = (await navigator.clipboard.readText()).replace(/\D/g, '').slice(0, 8);
  } catch {
    input.focus();
  }
};

if (AccessCore.session()?.exp > Date.now()) location.replace('index.html');
