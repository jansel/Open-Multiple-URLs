# Publishing Open Multiple URLs Tab

This fork has its own Chrome Web Store item under Jason Ansel’s developer account, with **Unlisted** visibility. Update the item recorded below; do not use the upstream extension or its ID.

## Build a release

1. Update `package.json` with a new Chrome-compatible version and add its changes to `CHANGELOG.md`. Version 2.1.0 is prepared to replace the pending 2.0.0 submission.
2. Run `npm ci`, `npx playwright install chromium`, and `npm run check:all`.
3. Run `npm run package:chrome`. For 2.1.0, the output is `dist-package/open-multiple-urls-tab-2.1.0-chrome.zip`. The manifest is at the ZIP root, and the GPL license is included.
4. Run `npm run screenshots` if the interface changed. Review the PNGs in `docs/store`.
5. Commit and push the corresponding source and documentation to your GitHub fork. The local agent commits logical chunks and pushes when requested.

The package script uses the npm-provided ZIP library, so it does not require a system `zip` command. It rebuilds before packaging and verifies the version and tab-based manifest. Built output and test profiles are not committed.

## First store submission

1. Open the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) and sign in to the account that should own the extension. Complete developer registration, account verification, and any registration payment yourself if required.
2. Create a new item and upload the release ZIP.
3. Complete the Store listing fields using the copy below. Use `src/icons/icon128.png` for the icon and the 1280 × 800 PNGs in `docs/store` for screenshots.
4. Complete Privacy practices with the purpose, permissions, and local-data behavior below. The privacy policy URL is `https://github.com/jansel/Open-Multiple-URLs/blob/develop/PRIVACY.md`; push the file and confirm it is publicly accessible first.
5. In Distribution, explicitly choose **Unlisted**, and select the regions where you want it available. Unlisted means anyone with the link can install it; it is not an access restriction.
6. Review the completed listing and submit it for review. Choose automatic publication after approval if offered and desired. Unlisted submissions still require Google's review.
7. Copy the new item's actual store URL into the README. Record the item ID below for future uploads. Do not invent a link or reuse the upstream ID.

Current listing ID: `legkeidpegglajidbdpiddmallhmfokj`.

Current store URL: https://chromewebstore.google.com/detail/legkeidpegglajidbdpiddmallhmfokj

Version 2.0.0 was submitted on **October 25, 2026** and is **pending review**. It will publish automatically after approval with **Unlisted** visibility, free of charge, in all regions. The listing, icon, light/dark screenshots, privacy disclosures, and reviewer instructions are saved. The privacy policy is publicly reachable and the publisher's contact email is verified. The store link will become installable after approval.

## Replacing the submission with 2.1.0

The 2.1.0 package, refreshed light/dark screenshots, listing copy below, and active [privacy policy](../PRIVACY.md) are ready. Replacement of the pending 2.0.0 submission was requested on October 25, 2026.

Cancel the pending review, upload the 2.1.0 ZIP, replace both screenshots, and update the listing and privacy disclosures before resubmitting. Remove the search justification and search feature from the listing. Verify the package requests only `storage` and `tabGroups`, and keep **Unlisted** visibility with automatic publication after approval. Cancelling and resubmitting starts a new review.

## Listing copy for 2.1.0

**Name:** Open Multiple URLs Tab

**Summary:** Open lists of URLs from a persistent browser tab. Automatically extract links when pasting a whole new list.

**Category:** Productivity → Tools.

**Language:** English.

**Description:**

Open a list of links without losing your workspace. Open Multiple URLs Tab puts its interface in a full browser tab that stays open while you browse. Click its toolbar icon again to return to your workspace in the same window.

Paste into an empty field, or select all and paste, to automatically extract links from text. Pasting into part of an existing list leaves your edits unchanged. The Opening options pane also offers manual extraction when it would change the input.

Features:

- Open one URL per line in background tabs.
- Keep your workspace and remember input locally between visits.
- Extract links automatically on full-field paste.
- Ignore duplicate URLs by default; choose Original, Reverse, or Random from the Order dropdown.
- Defer supported pages until their tabs are selected.
- Open links in a new or existing Chrome tab group.
- Clear the input and its saved copy with one click.
- Keep all settings, URL lists, and tab-group choices local to the browser profile.
- Use a roomy interface with light and dark themes.

No analytics, advertising, extension account, or remote code. Text extraction happens on your device. Opening a URL uses your browser normally.

An independent GPL-licensed fork of Open Multiple URLs by htrinter and contributors, focused on a persistent tab interface for Chrome and Chromium browsers.

**Homepage:** https://github.com/jansel/Open-Multiple-URLs

**Support:** https://github.com/jansel/Open-Multiple-URLs/issues

## Privacy practices copy

**Single purpose:** Open user-provided lists of URLs in browser tabs from a persistent workspace, including extracting URLs from pasted text and choosing how those tabs open.

**storage:** Saves settings and tab-group selection locally. Preserve input is enabled by default and saves the URL list locally between visits. Turning it off or clicking Clear erases the saved text. No data is sent to the developer.

**tabGroups:** Lists tab groups in the current window so the user can choose one, and places newly opened tabs into that group or a new group.

**Remote code:** No. All executable code is included in the extension package.

**Data collection:** The developer collects no user data. Settings and input stay local to the browser profile; requested navigation uses the browser's ordinary destination websites. Review the dashboard's certifications against the updated privacy policy before submitting.

## Updating an existing listing

Keep the same store item and upload a ZIP with a strictly higher version. Recheck **Unlisted** visibility on each release, update screenshots or listing copy when behavior changes, and submit the update for review. Installing from the store allows approved updates to reach your other browser profiles through Chrome's normal extension update mechanism.

Official guidance: [publishing](https://developer.chrome.com/docs/webstore/publish), [visibility and distribution](https://developer.chrome.com/docs/webstore/cws-dashboard-distribution), [privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy), and [images](https://developer.chrome.com/docs/webstore/images).
