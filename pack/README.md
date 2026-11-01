# sustech-in 1.1.0

Independent SUSTech CAS/Shibboleth institution pack for in-stitution 0.11.2+.
Install the core separately, then drag this archive into Institution packs.
Configure optional account details and automatic submission/attribute release in
its own setup screen. Both automatic choices start off. A chosen local file is
imported in the browser; no external credentials or session file is read automatically.

Automatic CAS submission uses the background worker by default; the password is
not filled into page inputs. Redirects resume in the browser, which still handles
IdP consent and the publisher's SAML handoff. Choose visible-form compatibility
in this pack's settings to restore the original submission path. An uncertain
request is never automatically retried. CAPTCHA/MFA remain manual.

Login-flow approach informed by sustech_survival and its authentication stack.
The pack has no Python runtime dependency. Its port has fake-account tests;
historical bundled-engine live results do not certify this new pack. Maintainers
must verify fresh off-campus flows and current provider subscriptions separately.

Private browser settings are excluded from exports. Source distribution includes
license and attribution. This community project is not an official university product.
