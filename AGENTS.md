# Working on Open Multiple URLs Tab

- This is an independent Chrome/Chromium fork. Preserve the GPL license and upstream attribution.
- Use Node 24 (`nvm use`) and npm. Keep the lockfile current.
- Keep processing local and permissions minimal. Do not add analytics or remote code.
- Run `npm run check:all` before committing behavior changes. Chromium tests use fresh temporary profiles; install the browser with `npx playwright install chromium`.
- Add focused tests for behavior changes, especially paste selection, persistent tabs, and URL opening.
- Commit logical chunks automatically. Do not push unless asked. Never commit credentials or browser profiles.
- Keep README, changelog, and release instructions aligned with the shipped behavior.
