import builtPlugin from "./dist/plugin.js";

/** @type {{
 *     meta?: Record<string, unknown>;
 *     configs?: Record<string, unknown>;
 *     rules?: Record<string, unknown>;
 *     processors?: Record<string, unknown>;
 * }} */
const normalizedBuiltPlugin = builtPlugin;

const plugin = {
    configs: normalizedBuiltPlugin.configs ?? {},
    meta: normalizedBuiltPlugin.meta ?? {},
    processors: normalizedBuiltPlugin.processors ?? {},
    rules: normalizedBuiltPlugin.rules ?? {},
};

export default plugin;
