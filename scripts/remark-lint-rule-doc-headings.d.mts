type RuleDocHeadingTransformer = (
    tree: import("unist").Node,
    file: import("vfile").VFile
) => void;

declare const remarkLintRuleDocHeadings: (
    ...args: readonly unknown[]
) => RuleDocHeadingTransformer;

export default remarkLintRuleDocHeadings;
