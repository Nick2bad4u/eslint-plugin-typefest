import builtPlugin from "./dist/plugin.js";

/**
 * @type {{
 *     meta?: Record<string, unknown>;
 *     configs?: Record<string, unknown>;
 *     rules?: Record<string, unknown>;
 *     processors?: Record<string, unknown>;
 * }}
 */
const normalizedBuiltPlugin =
    typeof builtPlugin === "object" && builtPlugin !== null ? builtPlugin : {};

const {
    configs = {},
    meta = {},
    processors = {},
    rules = {},
} = normalizedBuiltPlugin;

const plugin = {
    configs,
    meta,
    processors,
    rules,
};

export default plugin;
