# sustech-in changelog

## 1.1.0

- Prepare the independent public preview with core/pack download links and portable attribution links. Keep institution sources and historical live evidence in this project.

- Submit opted-in CAS accounts through the extension worker using the current form's execution/CSRF fields. Keep passwords out of page inputs in this mode; resume with a normal browser GET and existing CAS cookie after a redirect.
- Preserve the original visible-form implementation as a pack-defined compatibility option. Pause on CAPTCHA/MFA and failed or uncertain requests; never automatically repeat the password POST.
- Require in-stitution 0.11.2 for stopped-redirect API support. Document which stages remain visible and retain separate fresh off-campus verification requirements.
- Authentication approach remains informed by sustech_survival's CAS/Shibboleth login stack.

## 1.0.0

- Establish an independently versioned institution project and installable API 2 pack, released separately from the in-stitution core.
- Own the CAS/Shibboleth flow, local setup/import, submission/consent choices, persistent attempt state and publisher completion.
- Attribute the authentication approach and original flow-stack knowledge to sustech_survival. No external credentials or sessions are imported automatically.
- Preserve the older bundled-engine implementation/evidence as reference; the new port has fixture coverage and needs fresh live off-campus verification.

## Earlier bundled library history

Institution-specific notes retained from earlier framework releases. See the [framework changelog](https://github.com/dumixthestpd/in-stitution/blob/main/CHANGELOG.md) for shared changes.

## 0.5.1

- Verified SUSTech's full login round trips across the supported publisher families on the user's off-campus connection; JSTOR reports no remote-login method for the institution. Recorded per-provider evidence without changing device proxy settings.

## 0.5.0

- Added direct SP-init plans for Springer, Nature, IEEE, Wiley, and Elsevier entry pages, based on the SUSTech Library's published sign-in links. Springer and Nature preserve the research return URL; existing authentication transactions remain intact. Added the observed Springer/Nature federation hosts.

- Preserve exact entity-ID strings and select native options by entity ID when publisher names are abbreviated. SUSTech's historical publisher names are maintained in its library and recognized by existing saved profiles.

- Added institution-library search priorities, bounded retries for unrelated JSTOR results, and an explicit stop when the provider offers no remote-login method. JSTOR's SUSTech listing was found under its historical name; its UI reported no remote login.

- Added protocol, worker-state and installed-Chromium regression checks. Live checks exercised fresh CAS login and multiple publisher round trips; campus access, missing directory matches, browser verification, and server errors remain explicit verification limits in the live report. The SUSTech authentication approach remains adopted from SUSTech Survival.

## 0.4.0

- Added worker-side protocol routing: CNKI entry pages skip institution menus/search, and compatible CARSI transactions receive the selected university's discovery response directly. The CNKI SP-init approach is adopted from SUSTech Survival; discovery responses follow the OASIS IdP Discovery protocol.

- Verified the direct CNKI route live through university authentication and return with SUSTech access. Added worker/resolver boundary tests and installed-Chromium fixtures for direct CNKI, CARSI responses, and compatibility mode.

- Require SUSTech's canonical entity ID and include worker imports in syntax validation.

- Organized SUSTech's library under `extension/institutions/sustech/` and documented sibling university directories for future integrations. Updated all runtime and test loaders without changing login behavior. The existing SUSTech authentication approach remains attributed to SUSTech Survival.

## 0.3.0

- Completed live off-campus sign-in on Springer Nature, IEEE Xplore, Wiley, ScienceDirect, and CNKI using the selected SUSTech library and saved credentials/session.

## 0.2.0

- Separated institution authentication into registered libraries with route classification, validation, credential policy, login, and identity hooks. Moved SUSTech CAS/Shibboleth behavior into its own library.

- Isolated credentials and preferences by institution and authentication configuration; migrated existing SUSTech storage and captured profiles per journey.

## 0.1.0

- Added a standalone Chrome / Edge Manifest V3 extension for SUSTech institutional sign-in across ten research provider families.

- Adopted the CARSI institution identifier, CHINA CERNET Federation selection, full-list discovery, separate Login step, and locale-independent Shibboleth consent approach from SUSTech Survival’s CARSI / Web of Science implementations and SUSTech userscript guidance. No parent-project runtime or credential dependency was introduced.
