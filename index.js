/* global InstitutionLibraries, InstitutionAuth */
(() => {
  "use strict";
  // SUSTech owns its routes and complete CAS -> Shibboleth institution flow.
  const preset = Object.freeze({
    id: "sustech", library: "sustech", name: "Southern University of Science and Technology", shortName: "SUSTech",
    aliases: ["南方科技大学", "Southern University of Science and Technology of China", "South University of Science and Technology of China", "South University of Science and Technology", "Southern Univ Sci & Techlgy China"],
    searchTerm: "Southern University of Science and Technology", carsiSearchTerm: "南方科技大学",
    entityId: "https://idp.sustech.edu.cn/idp/shibboleth", federation: "CHINA CERNET Federation",
    identityOrigins: ["https://idp.sustech.edu.cn"], discoveryOrigins: [],
    cas: { loginUrl: "https://cas.sustech.edu.cn/cas/login", servicePrefixes: ["https://idp.sustech.edu.cn/idp/"] }
  });
  InstitutionLibraries.register({
    id: "sustech", name: "SUSTech SSO", supportsCredentials: true, preset,
    async migrate(storage, core) {
      const data = Object.assign({}, ...await Promise.all([storage.get("credentials"), storage.get("settings")]));
      if (data.credentials) {
        if (!(await storage.get("credentials:sustech"))["credentials:sustech"]) await storage.set({ "credentials:sustech": { ...data.credentials, scope: core.credentialScope(preset) } });
        await storage.remove("credentials");
      }
      if (data.settings) {
        if (!(await storage.get("settings:sustech"))["settings:sustech"]) await storage.set({ "settings:sustech": core.sanitizeSettings(data.settings) });
        await storage.remove("settings");
      }
    },
    discoveryTerms(profile) { return [profile.shortName, "South University of Science and Technology of China", profile.carsiSearchTerm]; },
    validate(profile) {
      if (profile.entityId !== preset.entityId || profile.cas?.loginUrl !== preset.cas.loginUrl || JSON.stringify(profile.cas.servicePrefixes) !== JSON.stringify(preset.cas.servicePrefixes) ||
        !profile.identityOrigins.includes("https://idp.sustech.edu.cn")) throw new Error("The SUSTech library requires its canonical CAS and IdP routes. Choose another library for a different institution.");
    },
    classify(url, profile) {
      if (InstitutionAuth.casPage(url, profile)) return "login";
      return url.origin === "https://idp.sustech.edu.cn" ? "identity" : null;
    },
    credentialsAllowed(url, profile, core) { return InstitutionAuth.casCredentials(url, profile, core); },
    login(ctx) { return InstitutionAuth.casLogin(ctx); },
    identity(ctx) { return InstitutionAuth.shibbolethConsent(ctx); }
  });
})();
