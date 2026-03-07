export type CreateTypedRuleSelectorAwarePassThrough = (
    definition: unknown
) => unknown;

declare global {
    const createTypedRuleSelectorAwarePassThrough: CreateTypedRuleSelectorAwarePassThrough;
}
