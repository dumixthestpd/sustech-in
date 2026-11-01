# SUSTech live browser checks

## Independent pack 1.1.0 verification boundary

The background-CAS port has fake-account contract tests for current form tokens, one-attempt submission, service/action checks, empty page credential inputs and manual compatibility. Shared Chromium tests separately establish background HTTP redirect/cookie mechanics against a loopback HTTPS server. Port 9222 was unavailable for this change; no fresh live off-campus login was performed. The live results below concern the earlier bundled engine and do not certify the independent pack's new submission path.

Testing used user-authorized Chrome sessions on localhost ports 9222 and 9223. No password, cookie, token, or SAML assertion was printed or exported.

## Findings and fixes

- Chrome had the extracted `dist/in-stitution-0.2.0` directory loaded, so editing `extension/` alone did not update the installed copy. The loaded directory was synchronized and reloaded during testing.
- The live popup received tab metadata without a URL and incorrectly disabled Start on a supported research page. It now obtains origin/path from the extension's content script when necessary. The real popup subsequently identified Web of Science and enabled Start.
- Web of Science already displayed SUSTech institutional access. The helper now ends assistance with an explicit existing-access message rather than opening personal sign-in.
- A newly opened provider tab inherited an unrelated provider's journey, locking Start. Unrelated journeys now deactivate; popup state also checks whether a journey belongs to the current provider.
- Springer's visible header login led to its personal account gateway. Its institutional entry is separate, as explained in [Springer's support article](https://support.springer.com/en/support/solutions/articles/6000270226-logging-into-athens-or-shibboleth-on-the-new-springerlink-platform-design). Known personal-only header links are excluded from automatic clicks. Without an institutional control, the page notice directs the user to an article, chapter, or book.
- A Springer book page displayed `Access provided by Southern University of Science and Technology`. This known access banner is also recognized.

## Observed boundaries

### 2026-10-31: v0.8.0 institution-pack installation

In the original authorized Chrome profile, the popup opened the persistent pack manager. Its real file input accepted `sustech.institution.json`, showed the institution and exact login hosts, and installed through the trusted worker. A round trip of the current profile configuration preserved its selected identity, authentication configuration, stored-credential presence and all automatic sign-in preferences. The manager remained open afterward. No credentials were printed or exported; no provider login, reference-library write or article download was attempted in this check. The current campus connection was retained without proxy changes.

The framework's separate fake-account Chromium test exercises drag/drop, rejection of script-bearing packs, review before installation, persistence, selection and removal. Those fixtures do not establish another university's live support.

### 2026-10-31: v0.6.0 backend and article checks

The user-provided off-campus connection was retained; no device proxy settings were changed. The isolated test profile was cleared of publisher and university sessions for clean authentication checks. Exact optional grants for SUSTech's CAS and IdP origins were verified after extension reload; stored credentials and opt-in preferences remained intact.

- The final WOS flow completed automatically through Clarivate, CARSI, a fresh CAS submission and attribute release, returning with the SUSTech banner. The recorded journey used nine bounded actions and visited both discovery and the IdP. A proposed direct legacy Shibboleth entry worked with existing SSO but returned a publisher system error without it, so that shortcut is excluded from the release.
- ACS and Taylor direct entries traversed the university and returned with SUSTech access. RSC's native `/FederatedAccess/FederatedLogin` broker was retained because it establishes OIDC state; its older generic Shibboleth endpoint produced an error. The final native broker flow returned with the historical SUSTech name.
- Scopus initially returned to `/pages/home` in Preview after clean login. Returning through `https://www.scopus.com/` instead completed its authentication bridge; the canonical homepage then displayed `Southern University of Science and Technology, General Access`. The fixed worker route was rechecked after clearing the test profile. The obsolete `/shibboleth` endpoint was rejected and is not used.
- Springer, Nature, IEEE, Wiley, ScienceDirect, CNKI, ACS, RSC and Taylor displayed the expected SUSTech access indicators after their v0.6.0 round trips. Nature explicitly confirmed full article access. Later provider checks could reuse the university SSO session. JSTOR again selected the correct institution and reported no remote-login method.
- On Nature's `nature14539` article, the new native PDF helper completed one browser download, `nature14539.pdf` (2,964,524 bytes). The saved file's `%PDF-` header was checked without reading or exporting its article content. Cross-tab concurrency and the durable 30-second reservation were verified independently with fake-credential Chromium fixtures and worker tests. No unattended multi-article retrieval was attempted.
- Crossref metadata search and single-DOI lookup both returned live bibliographic records through the separate MCP backend. That process has no university credentials or browser-session access.

These checks establish the tested SUSTech paths, not every article entitlement or another institution's support. The release retains native page interactions where clean-session testing did not establish a reliable background shortcut.

Validation: 50 Node tests, 37 Chromium fixture checks, manifest/syntax/boundary validation, MCP stdio and live metadata checks, and ZIP packaging passed. The package excludes institution test sources and documentation.

### 2026-10-31: user-provided off-campus connection

This retest used the connection the user confirmed was off campus. Device proxy settings were left untouched. A new browser profile eliminated retained publisher sessions; the previously authorized credentials file was imported inside the real extension popup. Automatic start, one-time CAS submission, and university attribute-release continuation were enabled. Publisher agreements and verification challenges were not automatically accepted or bypassed. Initial CAS login was exercised during the Taylor flow; subsequent sites could reuse the university session.

The installed v0.5.1 build fixed three failures exposed by this environment: Clarivate's clickable trigger is inside its `mat-select`; WOS renders a legacy auto-POST gateway after CARSI but before the IdP; RSC's header self-link can consume the action before its real button appears. Scopus also needed its canonical `/pages/home` URL recognized as a direct-routing entry.

| Provider | Observed off-campus result |
| --- | --- |
| Web of Science | Automatic federation selection → CARSI → legacy auto-POST gateway → university attribute release → Clarivate China smart search. Journey recorded both discovery and IdP visits; the returned page displayed SUSTech access. No manual selection was needed in the final run. |
| Springer | Direct SP-init round trip returned to the original book with `Access provided by Southern University of Science and Technology`. |
| Nature | Returned to `/articles/nature14539`; the article explicitly stated full access through Southern University of Science and Technology. |
| IEEE Xplore | Direct entry traversed the IdP and returned to Xplore with SUSTech in its institutional banner. |
| Wiley | Direct entry traversed the IdP and returned to the homepage with SUSTech shown. Browser verification cleared normally during this run. |
| ScienceDirect | Direct entry traversed the IdP and returned with SUSTech Institutional Access. |
| Scopus | Canonical-home direct routing traversed the IdP and returned to the application. Its institution panel showed SUSTech, General Access. |
| ACS | Federation and exact entity-ID selection completed the university round trip; the homepage displayed the abbreviated SUSTech institutional name. |
| RSC | Continued through the actual institutional action button, WAYF and the IdP; returned to the RSC homepage with the historical SUSTech name in the access banner. |
| CNKI | Direct SP-init traversed the IdP and returned to CNKI displaying 南方科技大学. |
| Taylor & Francis | Completed a CAS/IdP round trip and returned to its homepage displaying access through South University of Science & Technology. |
| JSTOR | Selected the correct historical SUSTech listing and ended with `remote-unavailable`. JSTOR again reported that it could not provide remote login for this institution. No unrelated result or personal-registration option was selected. |

These observations cover SUSTech on the tested pages, not every subscription item, institution or future publisher UI. The v0.5.1 Chromium fixtures reproduce the delayed Material trigger, gateway/consent handoff, delayed RSC action, and canonical Scopus routing independently of live sites.

### v0.5.0 logout and explicit-entry checks

The user clarified that campus connectivity was present during the broader retest and that an off-campus connection would be unavailable while they were away. Consequently these checks **do not certify fresh off-campus access**. Publisher cookies/site state were cleared in the authorized debugging browser, cached responses were disabled for new test tabs, and explicit institutional entry points were used where campus access obscured login. One Springer check also cleared the university's browser session and exercised a fresh CAS submission. The shipped extension does not clear sessions or log users out.

Direct-link candidates came from the [library's published off-campus access page](https://lib.sustech.edu.cn/xwfw_154/list.htm). Only supported route shapes were added; university-specific identifiers remain in profiles and institution libraries.

| Provider | Evidence and remaining limit |
| --- | --- |
| Springer | Explicit published SP-init → fresh CAS submission → IdP consent → Springer return. The book showed SUSTech access. The new worker route also completed automatically from the homepage. Campus-independent entitlement still requires an off-campus retest. |
| Nature | Published SP-init and the new worker route visited the IdP and returned. The worker preserved `/articles/nature14539`. This verifies routing; no separate institution-name banner or off-campus paywall entitlement was established. |
| IEEE | A cleared publisher session traversed CAS/IdP and returned with SUSTech access. Later homepage visits received campus access immediately, so those zero-action visits are not additional authentication proofs. |
| Wiley | An earlier cleared-site journey visited the IdP and returned with SUSTech access. The latest cleared-session check waits at browser verification, so the new direct route remains fixture-verified rather than newly live-confirmed. |
| ScienceDirect | Explicit remote access traversed the Elsevier broker and IdP, then returned with SUSTech access. Root-page visits can receive campus access without SSO. |
| Scopus | IdP return initially stopped at optional personalization. After the fix, the helper clicked Skip, returned to `/pages/home`, and the institution panel showed `Southern University of Science and Technology, General Access`. A later cleared-site journey repeated the authentication/return. |
| ACS | The current federation list labels SUSTech `SOUTHERN UNIV SCI & TECHLGY CHINA`. Exact entity-ID selection and the actual continuation control completed the IdP round trip and returned to ACS with that institutional banner. |
| RSC | The current site uses `pubs.rsc.org/institutional-login` and `sso.rsc.org/WAYF`. After fixes, a new journey visited the IdP and ended with the SUSTech banner on institutional login after three counted actions. Campus banners alone are not proof; the post-IdP visit was observed. |
| CNKI | The direct route was already verified in v0.4.0 below. No new claim of campus-independent access is made in this pass. |
| Web of Science | The published legacy institutional link returned to the Clarivate China site with campus access, without an observed IdP visit. Full authentication remains inconclusive. |
| JSTOR | Campus access was present. `SUSTech` returned Sudan University of Science and Technology, which was not selected. A broader search found SUSTech as `South University of Science and Technology of China 南方科技大学`. Selecting that exact listing produced JSTOR's message that it could not provide remote login for the institution. The helper now tries the historical name and reports the missing method instead of attempting personal registration. No institutional SSO was completed. |
| Taylor & Francis | Institutional pages/browser verification were reached; the published direct link ultimately returned an internal-server-error page. A fresh SSO round trip was not verified. The helper now stops on recognized server errors. |

The final installed-extension JSTOR retest automatically tried the historical name, selected the correct institution, and ended with `remote-unavailable` after five counted actions, without a credential submission.

Browser fixtures cover direct provider routes, uppercase federation fields, abbreviated entity-ID options, actual continuation priority, optional personalization, historical access labels, explicit finder/header separation, and verification/error boundaries. Live outcomes above remain separate from fixture results. No new publisher agreement was accepted during this pass.

### Direct routing in v0.4.0

The installed extension was synchronized and reloaded to v0.4.0. Opening `https://fsso.cnki.net/` started a new journey automatically. Its background worker generated CNKI's SP-init URL with SUSTech's entity ID, skipping the CNKI menus and university list. The browser reached SUSTech's IdP information-release page and returned to CNKI displaying 南方科技大学. The journey recorded `cnki:sp-init`, a CAS submission authorization, an IdP visit, and two counted actions (direct navigation and consent); native CAS submission is tracked separately. Credentials stayed in extension storage and were not inspected during this test.

Installed-extension fixtures additionally verify a CARSI discovery response that preserves the SP's opaque query state, the direct CNKI route, and compatibility mode using the original CNKI school-list flow. Direct CARSI responses have not yet been verified against a live publisher callback. Other providers retain the earlier results below; no new verification is claimed for them.

### Off-campus retest

The user switched networks to remove automatic campus-IP access. Springer’s initial book page no longer showed institutional access. Its discovery search selected SUSTech; the extension then continued through CAS using credentials imported inside the browser from the user-authorized local SUSTech Survival file. The original file was unchanged. Chrome initially timed out at CAS; refreshing its stale network state resolved the connection. The journey recorded a CAS submission and IdP visit, and the book page returned with SUSTech access.

| Provider | Observed off-campus result |
| --- | --- |
| Springer Nature | Returned to the book with SUSTech access after saved-credential CAS submission. |
| IEEE Xplore | Completed its SAML round trip and displayed SUSTech access. Keyboard events were needed to trigger institution suggestions. |
| Wiley | Federation selection, institution selection, and authentication completed. A first-time Terms of Service / Privacy Policy gate was separately authorized by the user. Returned homepage showed SUSTech. |
| ScienceDirect | Followed remote access to `id.elsevier.com`, selected the institution, continued through authentication, and returned with SUSTech Institutional Access. |
| CNKI | Opened the institution menu, followed the observed off-campus route to FSSO in the same tab, selected SUSTech, and returned to CNKI showing 南方科技大学. |
| RSC | Reached current discovery and remembered-institution controls, but its federated endpoint displayed a server login error. Not verified complete. |
| JSTOR | Reached open-shadow-root institution search; directory matching remained unresolved. Not verified complete. |
| ACS / Taylor & Francis | Institutional entry/search or login routes were reached or inspected; complete SUSTech sign-in was not verified. |

Later providers reused the university session established during the Springer test; they were not independently forced through a fresh password challenge. Web of Science retained earlier identity/session state, so it is not counted as a fresh off-campus test in this retest. Scopus was not separately verified.

Automatic start, login submission, and supported attribute release were enabled for the user’s selected SUSTech profile. They remain opt-in defaults for other users. New first-time publisher agreements and MFA are not silently accepted as part of university attribute-release automation.

### Earlier on-campus observations

The CARSI test started on the discovery service with the Web of Science service-provider context. Starting through the real extension popup selected SUSTech and returned to Web of Science, where the SUSTech banner was present. This verifies that observed discovery path and return; it does not establish that a fresh password or MFA step was exercised.

RSC displayed a browser-verification challenge in this profile. No bypass was attempted. Directly opening Springer's generic discovery homepage without its provider context returned an error, so that address was not added as an automatic fallback.

Other institutions, MFA, and the publishers not marked complete in the off-campus table remain to be verified independently. Regression fixtures cover the failures reproduced here.

`scripts/cdp.cjs` attaches to an already authorized localhost debugging browser. Disconnecting the helper leaves the browser running. The debugging profile is excluded from Git under `.browser-live/`.
