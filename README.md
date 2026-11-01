# sustech-in

The independently versioned SUSTech institution pack for in-stitution. Project version: **1.1.0**. Requires in-stitution **0.11.2+**, adapter API 2 and Chrome 135+ with Allow User Scripts enabled.

## Attribution and starting point

Our SUSTech integration was only possible with help from **sustech_survival** and its login-flow stack. Its CAS, CARSI, Shibboleth and research-provider knowledge informed this project. The earlier integration's attribution is retained in [CHANGELOG.md](CHANGELOG.md). No Python source is vendored into this pack, and it has no runtime dependency on that project or automatic access to its credentials/session files.

Before building another institution's pack, look for its equivalent maintained SSO library, campus CLI, library access documentation or developer community. Verify reuse rights, preserve attribution and follow that institution's actual flow. See the framework's Institution Pack Developer Guide when using the shared checkout.

## Install and configure

Download the core extension from [in-stitution releases](https://github.com/dumixthestpd/in-stitution/releases) and this pack from [sustech-in releases](https://github.com/dumixthestpd/sustech-in/releases). Install the core separately. Drop `sustech-in-1.1.0.instpack` into **Institution packs**, review its login and return sites, and enable Allow User Scripts when requested. The stable pack/profile ID is `sustech`; the separately released project is named `sustech-in`.

Its setup screen accepts optional university account fields, local username:password/JSON file import, automatic submission and attribute-release choices. Both automatic choices default off. Private settings stay in this browser without extension-level encryption; export excludes them. Browser/password-manager login remains available with account fields empty.

## Background and browser stages

With automatic submission enabled, the default CAS path sends the account and live form tokens through the extension worker. Page inputs remain empty. The request stops at a redirect, then a browser GET resumes the CAS session; a redirect alone does not establish success. CAPTCHA/MFA, rejected accounts and ambiguous requests require manual continuation. **Use the visible login form (compatibility backup)** restores the original form submission; the framework's existing compatibility preference is also respected.

| Stage | Where it runs |
| --- | --- |
| Supported publisher entry and CARSI discovery shortcuts | Worker-generated URL, browser navigation; existing verified entry restrictions apply |
| CAS password POST, when opted in | Worker by default; current form supplies execution/CSRF tokens |
| CAS ticket redemption, IdP consent and SAML handoff | Browser session and native pages/forms |
| Unsupported publisher discovery, personalization and verification | Page controls; human input for challenges |

This reduces page interaction; it is not a wholly background SSO implementation. Keep stateful publisher brokers and SAML handoffs in their normal browser context until an alternative is verified. No remote login server, cookie export or proxy configuration change is required. See Chrome's [extension cookie rules](https://developer.chrome.com/docs/extensions/develop/concepts/storage-and-cookies) and the [Fetch redirect model](https://fetch.spec.whatwg.org/#concept-filtered-response-opaque-redirect).

## Develop and package

This directory is an independent project root. In the shared checkout:

```sh
npm --prefix extension/institutions/sustech test
npm --prefix extension/institutions/sustech run package
```

When extracted into its own repository, set `INSTITUTION_FRAMEWORK` to an in-stitution source checkout, then run `npm test` and `npm run package`. The framework is a build/test SDK only. The output is `dist/sustech-in-1.1.0.instpack`.

`pack/` contains the current executable adapter, public login policy and setup UI. `index.js`, `sustech.institution.json` and `library.test.cjs` preserve the earlier trusted bundled engine and migration contract for reference/regression testing; the core release does not load or distribute them. The old settings-only JSON requires that earlier engine and is not the current installation artifact.

## Verification status

The independent adapter has fake-account contract tests for approved CAS services, background and visible submissions, one-attempt handling, opt-in behavior, verification pauses and publisher return. Core Chromium tests verify real loopback HTTPS redirect/cookie behavior separately. A full fresh live off-campus check of this port is still required. Historical [live browser results](live-browser-checks.md) describe the earlier bundled engine; they do not certify the new runtime or every current provider. Subscription participation remains institution-specific.

The project is independently released and is not presented as an official SUSTech product. Keep implementation, rules, attribution, tests and live evidence here; keep core changes generic.
