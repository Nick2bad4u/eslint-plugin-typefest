export interface ReadmeRuleModule {
    readonly meta?:
        | {
              readonly docs?:
                  | {
                        readonly typefestConfigs?:
                            | readonly string[]
                            | string
                            | undefined;
                        readonly url?: string | undefined;
                    }
                  | undefined;
              readonly fixable?: string | undefined;
              readonly hasSuggestions?: boolean | undefined;
          }
        | undefined;
}

export function generateReadmeRulesSectionFromRules(
    rules: Readonly<Record<string, ReadmeRuleModule>>
): string;
