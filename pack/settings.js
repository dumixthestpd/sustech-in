InstitutionPackSettings.register({
  load(config) {
    document.querySelector('#username').value = config?.account?.username || '';
    document.querySelector('#password').value = config?.account?.password || '';
    document.querySelector('#submit').checked = config?.autoSubmit === true;
    document.querySelector('#consent').checked = config?.autoConsent === true;
    document.querySelector('#browser-only').checked = config?.browserOnly === true;
  },
  save() {
    const username = document.querySelector('#username').value.trim();
    const password = document.querySelector('#password').value;
    if (Boolean(username) !== Boolean(password) || username.length > 200 || password.length > 1000) throw new Error('Provide both account fields, or leave both empty.');
    return { account: { username, password }, autoSubmit: document.querySelector('#submit').checked, autoConsent: document.querySelector('#consent').checked, browserOnly: document.querySelector('#browser-only').checked };
  }
});
document.querySelector('#credentials-file').addEventListener('change', async (event) => {
  const feedback = document.querySelector('#import-feedback');
  try {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 32768) throw new Error();
    const source = (await file.text()).replace(/^\uFEFF/, '').trim();
    const split = source.indexOf(':');
    const value = source.startsWith('{') ? JSON.parse(source) : { username: source.slice(0, split), password: source.slice(split + 1) };
    const username = value.username ?? value.sid;
    const password = value.password ?? value.pwd;
    if ((!source.startsWith('{') && (split < 1 || /[\r\n]/.test(source))) || typeof username !== 'string' || !username.trim() || username.length > 200 || typeof password !== 'string' || !password || password.length > 1000) throw new Error();
    document.querySelector('#username').value = username.trim();
    document.querySelector('#password').value = password;
    feedback.textContent = 'Account imported. Review the choices and save institution settings.';
  } catch { feedback.textContent = 'Choose a small username:password file or JSON with username and password.'; }
  finally { event.target.value = ''; }
});
