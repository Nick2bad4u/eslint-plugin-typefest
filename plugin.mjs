/* eslint-disable no-barrel-files/no-barrel-files, canonical/no-re-export -- Package root entrypoint intentionally forwards to built plugin output. */
export { default } from "./dist/plugin.js";
/* eslint-enable no-barrel-files/no-barrel-files, canonical/no-re-export -- Keep suppressions scoped to the single intentional barrel export above. */
