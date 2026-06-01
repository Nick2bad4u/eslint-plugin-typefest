import { createConfig } from "remark-config-nick2bad4u";

/**
 * @type {import("remark-config-nick2bad4u").RemarkConfig}
 */
const remarkConfig = createConfig({
    plugins: [
        // [myRemarkPlugin, myOptions], // your plugin override here
    ],
    settings: {
        // Rule: "*", // your settings override here
    },
});

export default remarkConfig;
