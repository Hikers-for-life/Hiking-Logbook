# Security Audit Report: NPM Supply Chain Attack (@ctrl/tinycolor)

## Summary

This report documents the recent npm supply-chain trojanization campaign that included malicious updates to `@ctrl/tinycolor` and dozens of other packages. The compromised releases installed a `postinstall` script that executed a bundled `bundle.js` which scanned hosts for secrets (TruffleHog), attempted to validate and use found tokens, created GitHub Actions workflows, and exfiltrated findings to a hard-coded webhook. The campaign also contained logic to repack and republish trojanized downstream packages when publishing credentials were accessible.

---

### Key incident facts

* Incident reported by Socket.dev (initial report Sept 15–16, 2025) and other researchers.
* Notable package with wide visibility: `@ctrl/tinycolor` (@4.1.1, @4.1.2) — ~2.2M weekly downloads on npm prior to the event.
* Malicious artifact: `bundle.js` (SHA-256: `46faab8ab153fae6e80e7cca38eab363075bb524edd79e42269217a083628f09`).
* Behavior: postinstall secret scanning (TruffleHog), token validation (npm/GitHub), workflow planting, exfiltration to a webhook, and automated republishing of trojanized packages if publish credentials exist.

---

## 1. What Caused the Supply Chain Attack? (Point of Failure)

**Primary point of failure**

* Execution of maintainer-supplied install-time code (`postinstall` scripts) on developer machines and CI agents combined with accessible publish/CI tokens.

**How it occurred (brief chain)**

1. A package version containing a `postinstall` hook that runs `bundle.js` was published.
2. When installed, the `postinstall` script executed and ran a controller (`bundle.js`) that downloaded/ran TruffleHog to hunt for credentials and tokens.
3. If secrets (e.g., `NPM_TOKEN`, `GITHUB_TOKEN`, cloud keys) were present and valid, the script validated them (for example, via `https://registry.npmjs.org/-/whoami`) and used them to interact with registries and APIs.
4. The controller could repackage packages, inject malicious `bundle.js` and `postinstall` into other packages, and publish those if publishing credentials were available — thus propagating the trojanization.
5. It also planted GitHub Actions workflows in repositories to persist exfiltration from CI environments.

**Contributing operational failures**

* Long-lived or wide-scoped tokens on developer laptops and CI runners.
* Running `npm install` (or installs that execute `postinstall`) on hosts with secrets or publishing rights.
* Lack of strict controls for install-time script execution, SBOM verification, and publish-event monitoring.

---

## 2. List of Compromised Packages and Their Versions

(As reported in the incident — this list may have expanded during the active campaign.)

* angulartics2@14.1.2
* @ctrl/deluge@7.2.2
* @ctrl/golang-template@1.4.3
* @ctrl/magnet-link@4.0.4
* @ctrl/ngx-codemirror@7.0.2
* @ctrl/ngx-csv@6.0.2
* @ctrl/ngx-emoji-mart@9.2.2
* @ctrl/ngx-rightclick@4.0.2
* @ctrl/qbittorrent@9.7.2
* @ctrl/react-adsense@2.0.2
* @ctrl/shared-torrent@6.3.2
* @ctrl/tinycolor@4.1.1, @4.1.2
* @ctrl/torrent-file@4.1.2
* @ctrl/transmission@7.3.1
* @ctrl/ts-base32@4.0.2
* encounter-playground@0.0.5
* json-rules-engine-simplified@0.2.4, 0.2.1
* koa2-swagger-ui@5.11.2, 5.11.1
* @nativescript-community/gesturehandler@2.0.35
* @nativescript-community/sentry@4.6.43
* @nativescript-community/text@1.6.13
* @nativescript-community/ui-collectionview@6.0.6
* @nativescript-community/ui-drawer@0.1.30
* @nativescript-community/ui-image@4.5.6
* @nativescript-community/ui-material-bottomsheet@7.2.72
* @nativescript-community/ui-material-core@7.2.76
* @nativescript-community/ui-material-core-tabs@7.2.76
* ngx-color@10.0.2
* ngx-toastr@19.0.2
* ngx-trend@8.0.1
* react-complaint-image@0.0.35
* react-jsonschema-form-conditionals@0.3.21
* react-jsonschema-form-extras@1.0.4
* rxnt-authentication@0.0.6
* rxnt-healthchecks-nestjs@1.0.5
* rxnt-kue@1.0.7
* swc-plugin-component-annotate@1.9.2
* ts-gaussian@3.0.6

> **IOC**: `bundle.js` SHA-256 `46faab8ab153fae6e80e7cca38eab363075bb524edd79e42269217a083628f09` and exfil endpoint `hxxps://webhook[.]site/bb8ca5f6-4175-45d2-b042-fc9ebb8170b7`.

---

## 3. Report of Our Packages (Frontend & Backend) — Compromise Check

> **Note:** The checks below should be run in your environment. This report states recommended checks and the automated tooling previously provided.

**Automated checks you should run now**

* Run the provided `check_compromised_packages.py` script (or equivalent) against each repo root using an up-to-date `compromised_list.txt` containing the package@version entries above.
* Search `node_modules` and packed tarballs for `postinstall` entries referencing `bundle.js` and for the `bundle.js` SHA-256.
* Scan developer/CI hosts for the IOCs, unexpected `npm publish` commands, and `.github/workflows` additions.

**Recommended immediate posture**

* If any of the compromised versions are present, treat the host as potentially impacted: rotate tokens (npm, GitHub, cloud), audit for unauthorized publishes, and scan for exfiltrated artifacts.

---

## 4. Report of Our Packages' Packages (Sub-dependencies)

**What to check**

* Use `npm ls <pkg>` to find which top-level dependency brings in any of the compromised packages.
* Inspect `package-lock.json` or `npm ci` lock state for exact versions that match the compromised list.

**Suggested commands**

```bash
# list where package is pulled from
npm ls @ctrl/tinycolor || true
# search lockfile for exact matches
grep -n "@ctrl/tinycolor@" package-lock.json || true
```

**Recommended outcome interpretation**

* If versions found are older or different from the compromised versions (e.g., 4.1.0 or 4.0.x), they are likely safe, BUT still verify contents of any packages installed on hosts.

---

## 5. Measures to Avoid Being Infected by Upstream Packages (Protecting Against Supply Chain Attacks)

**Immediate actions**

* Pin dependencies and commit `package-lock.json` to source control; use `npm ci` in CI.
* In sensitive build environments, consider `npm ci --ignore-scripts` or otherwise block install-time scripts.
* Run package-content scanning (SCA) tools during CI to detect suspicious `postinstall` scripts or unexpected bundled binaries.

**Policy & operational controls**

* Remove long-lived publish credentials from developer machines; use short-lived tokens and scoped credentials.
* Use private registry mirrors (Verdaccio, Artifactory) that only accept vetted packages for production builds.
* Produce SBOMs for builds and verify installed artifacts against SBOM.

**Technology & detection**

* Integrate secret scanning (truffleHog/detect-secrets) across repos and hosts.
* Monitor package publish events and set alerts for new versions of critical dependencies.
* Use artifact signing (sigstore/cosign) where possible for internal packages.

---

## 6. Measures to Avoid Your Product Being Infected (Protecting Your Own Project)

**Developer & CI hygiene**

* Ensure CI runners run in ephemeral containers without secrets and with least-privilege policies.
* Protect branches and require code review (esp. for changes to `.github/workflows`).
* Revoke and rotate tokens if compromise is suspected; disable suspicious workflows and lock down repository settings.

**Runtime & pipeline detection**

* Monitor for unexpected network egress patterns from build agents or developer machines.
* Add pipeline checks to detect newly added workflows or files that exfiltrate data.

**Recovery steps**

* If an unauthorized publish is detected for packages you control, take the package offline, rotate credentials, and re-publish known-good versions from a secure build environment.

---

## 7. Automated Tools & Suggested Scripts

* `check_compromised_packages.py` — recursive lockfile and `node_modules` inspector (included in sprint materials).
* Secret-scanners: TruffleHog, detect-secrets, git-secrets.
* Dependency scanning: npm audit, Snyk, GitHub Dependabot.
* SBOM tools: Syft; artifact signing: sigstore / cosign.

---

## 8. Conclusion

This incident demonstrates how install-time scripts combined with available credentials can enable rapid, automated trojanization of packages and persistence in repositories via CI workflows. The prioritized defenses are: remove credentials from risky hosts, pin and vet dependencies, block or audit install-time scripts for sensitive builds, and add layered detection (secret scanning, publish monitoring, SBOM verification). Run the provided automated checks now and attach the outputs to your sprint submission.

---
