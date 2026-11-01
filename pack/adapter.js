/* Login-flow approach informed by sustech_survival; no Python runtime dependency. */
InstitutionPack.register(async (ctx) => {
  const policy = JSON.parse(ctx.resources['login.json']);
  const config = ctx.config || {};
  if (ctx.pageRole === 'return') {
    // Keep optional post-SSO personalization out of the personal-account route.
    if (location.hostname === 'auth.elsevier.com') {
      const skip = [...document.querySelectorAll('a,button')].find((element) => /^(?:skip|not now|continue without|暂不|跳过)/i.test(element.textContent.trim()));
      if (skip) await ctx.click('skip-personalization', skip);
      return;
    }
    if (ctx.researchPage) await ctx.complete();
    return;
  }
  const login = new URL(policy.loginUrl);
  if (location.origin === login.origin && location.pathname.replace(/\/$/, '') === login.pathname) {
    const parameters = new URL(location.href).searchParams;
    if (parameters.getAll('service').length !== 1) return;
    const service = parameters.get('service');
    let destination;
    try { destination = new URL(service); } catch { return; }
    if (!policy.servicePrefixes.some((prefix) => { const allowed = new URL(prefix); return destination.protocol === 'https:' && !destination.username && !destination.password && destination.origin === allowed.origin && destination.pathname.startsWith(allowed.pathname); })) return;
    const username = document.querySelector('input[name="username"],input#username');
    const password = document.querySelector('input[name="password"][type="password"],input#password[type="password"]');
    if (!username || !password || ctx.local.filled || password.value) return;
    const form = password.form;
    if (!form || username.form !== form || form.method.toLowerCase() !== 'post') return;
    const action = new URL(form.getAttribute('action') || location.href, location.href);
    if (action.origin !== login.origin || action.pathname.replace(/\/$/, '') !== login.pathname || action.username || action.password) return;
    if (action.search && (action.searchParams.getAll('service').length !== 1 || action.searchParams.get('service') !== service)) return;
    if (document.querySelector('input[name*="captcha" i],input[name*="otp" i],input[autocomplete="one-time-code"]') || [...document.querySelectorAll('.errors,#msg.errors,.alert-danger,[role="alert"]')].some((element) => element.textContent.trim())) {
      await ctx.notice('Complete the university verification on this page.'); return;
    }
    if (!config.account?.username || !config.account?.password) { await ctx.notice('Use your normal SUSTech sign-in, or configure the institution pack.'); return; }
    const saved = await ctx.storage.get();
    if (!ctx.current() || saved.attemptedFlow === ctx.flowId) return;
    ctx.local.filled = true;
    if (config.autoSubmit && !config.browserOnly && !ctx.settings?.browserOnly) {
      if (!ctx.flowId) { await ctx.notice('Update in-stitution before enabling automatic submission.'); return; }
      // Use the live form's execution/CSRF fields, but keep the account out of
      // page inputs. The worker stops at redirects; it never forwards a POST.
      const body = new URLSearchParams();
      for (const field of form.querySelectorAll('input[type="hidden"][name]')) {
        if (!field.disabled) body.append(field.name, field.value);
      }
      body.set('username', config.account.username);
      body.set('password', config.account.password);
      if (!body.has('_eventId')) body.set('_eventId', 'submit');
      const submitter = [...form.querySelectorAll('button[type="submit"],input[type="submit"]')].find((element) => element.form === form && !element.disabled);
      if (submitter?.name) body.set(submitter.name, submitter.value);
      await ctx.storage.set({ ...saved, attemptedFlow: ctx.flowId });
      if (!ctx.current()) return;
      await ctx.notice('Signing in through the background connection…');
      try {
        const response = await ctx.request(action.search ? action.href : location.href, {
          method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString(), redirect: 'manual'
        });
        if (!ctx.current()) return;
        if (response.opaqueRedirect) {
          // Fetch intentionally hides Location. A fresh GET uses the new CAS
          // cookie and lets the browser redeem a new ticket in its own session.
          const resume = new URL(policy.loginUrl);
          resume.searchParams.set('service', service);
          await ctx.navigate('cas-resume', resume.href);
        } else {
          await ctx.notice('Background sign-in did not finish. Continue on this page; check your account or choose visible-form compatibility in pack settings.');
        }
      } catch {
        if (ctx.current()) await ctx.notice('Background sign-in could not be confirmed. Continue manually, or choose visible-form compatibility in pack settings and start a new login.');
      }
      // Never retry or submit the visible form after an ambiguous POST result.
      return;
    }
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    for (const [element, value] of [[username, config.account.username], [password, config.account.password]]) {
      setter.call(element, value); element.dispatchEvent(new Event('input', { bubbles: true })); element.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (!config.autoSubmit) { await ctx.notice('Account filled. Review and sign in when ready.'); return; }
    if (!ctx.flowId) { await ctx.notice('Update in-stitution before enabling automatic submission.'); return; }
    await ctx.storage.set({ ...saved, attemptedFlow: ctx.flowId });
    if (!ctx.current()) return;
    const submitter = [...form.querySelectorAll('button[type="submit"],input[type="submit"]')].find((element) => element.form === form);
    HTMLFormElement.prototype.requestSubmit.call(form, submitter);
    return;
  }
  if (location.origin === policy.identityOrigin && /\/profile\/SAML[^/]*\/.*\/SSO\/?$/.test(location.pathname)) {
    if (config.autoConsent) await ctx.click('attribute-release', document.querySelector('input[type="submit"][name="_eventId_proceed"],button[name="_eventId_proceed"]'));
    else await ctx.notice('Review the information your university will share.');
  }
});
