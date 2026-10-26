# Changelog

## 2.1.0 — October 25, 2026

Submitted for Chrome Web Store review, replacing the pending 2.0.0 submission.

- Enable Ignore duplicate URLs and Preserve input by default on new installs. All settings and input remain local to each browser profile.
- Add a Clear button that empties the input and its saved copy, then returns focus to the editor.
- Replace the random and reverse checkboxes with a single Order dropdown: Original, Reverse, or Random.
- Simplify the options pane, removing section headings and the lazy-loading info icon. Move tab-group selection and manual URL extraction there; disable extraction when it has no useful result.
- Check Chrome’s selected-tab state before loading a deferred page, ignoring spurious background focus events.
- Remove the option to treat non-URLs as search queries and drop the `search` permission.
- Refresh the store screenshots, listing copy, and privacy policy for the simplified interface and reduced permissions.

## 2.0.0 — Open Multiple URLs Tab

First independent Chrome/Chromium release of this fork, based on upstream 1.7.5.

- Rename the extension and point its homepage to this fork.
- Open and reuse a persistent interface tab per browser window instead of a popup.
- Automatically extract URLs from full-field paste, leaving partial edits and pastes without matches intact.
- Remember input locally by default, with an opt-out.
- Add a responsive light/dark layout, loading status, and tab-group refresh on return.
- Keep opened tabs in the originating window and report individual opening failures.
- Prevent active-content URL schemes from being executed by lazy-loading placeholders.
- Upgrade dependencies and tooling; add fresh-profile Chromium tests and simplify CI.
- Remove Firefox build entrypoints and the obsolete tooltip dependency.
- Add release packaging, store screenshots, publishing instructions, and a privacy policy.

## Upstream history

## 1.7.5

- Changed
  - Keyboard shortcut defaults for compatibility
  - Refactored load process to run in background script for reliability

- Fixed
  - Error handling on tab creation

## 1.7.4

- Added
  - Keyboard shortcut for Firefox

- Fixed
  - Revert back to http prefixing for compatibility

## 1.7.3

- Added
  - Container support for Firefox

## 1.7.2

- Fixed
  - Issue with search queries not loading

## 1.7.1

- Added
  - Option to handle Non-URLs as search queries

## 1.7.0

- Added
  - Tab group support for Chrome
  - Dark mode
- Changed
  - Display format of tab count and tab count warning for clarity
  - Improved schema detection
  - Added schemas to no-lazy-load rule

## 1.6.0

- Added
  - Option to ignore duplicate URLs on open
- Changed
  - Complete rewrite in Vue.js

## 1.5.6

- Fixed
  - Fix regression in Chrome: No shortcut for popup activation, caused by migration to manifest v3

## 1.5.5

- Added
  - Option to open tabs in reverse order
- Changed
  - Chrome: Update manifest version

## 1.5.4

- Changed
  - Remove unsafe assignment of innerHTML

## 1.5.3

- Added
  - Indicator for amount of tabs to be opened
- Changed
  - Refreshed design with improved element sizes, margins and paddings
  - Lazy loading: Use replace instead of assign for URL navigation, in order to avoid unnecessary history entries

## 1.5.2

- Changed
  - Remove unnecessary "tabs" permission

## v1.5.1

- Changed
  - Enable split mode for Chrome, in order to fully support incognito mode
  - Upgrade some dependencies
- Fixed
  - Fix issues with unsaved changes on extract

## v1.5

- Changed
  - Migrate to TypeScript
  - Make "preserve input" feature an option
  - Improve spacing of UI elements

## 1.4.3

- Added
  - Add abstraction of browser API object to make extension work with both Chromium and Firefox API
- Changed
  - Migrate to new storage API
- Fixed
  - Fix save of selected lazy loading and random option

## 1.4.2

- Changed
  - Migrate to ECMAScript 6
  - Replace deprecated property 'selected' of 'tabs.create' API with 'active'
- Fixed
  - Fix line wrap in Firefox

## v1.4.1

- Fixed
  - Fixed problem where text was not stored after use of the URL extraction feature

## v1.4

- Added
  - Text and selected options are stored
  - Option to open tabs in random order
- Changed
  - Select text in form field instead of focus on field

## v1.3.2

- Added
  - Support for additional URL schemes

## v1.3.1

- Changed:
  - Display URL in title of lazy-loading tabs

## v1.3

- Added:
  - Option to extract URLs from text

## v1.2.1

- Added:
  - Auto-focus on form field

## v1.2

- Added
  - Option to lazy-load tabs

## v1.1.1

- Fixed:
  - Handling of URLs beginning with 'https://'

## v1.1

- Added:
  - Ignore blank lines in URL list
  - Add 'http://' to URLs if not present

## v1.0

- Initial release
