import { createConfig } from "remark-config-nick2bad4u";

/**
 * @type {import("remark-config-nick2bad4u").RemarkConfig}
 */
const remarkConfig = createConfig({
    settings: {
        // rule: "*", // your settings override here
    },
    plugins: [
        // [myRemarkPlugin, myOptions], // your plugin override here
    ],
});

export default remarkConfig;
