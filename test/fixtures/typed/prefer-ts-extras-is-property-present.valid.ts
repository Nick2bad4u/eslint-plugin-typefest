import { isPropertyPresent } from "ts-extras";

interface Post {
    readonly id: number;
    readonly title: string | null | undefined;
    readonly body: string | null | undefined;
}

declare const posts: readonly Post[];

const titledPosts = posts.filter(isPropertyPresent("title"));
const postsWithBody = posts.filter(isPropertyPresent("body"));

String(titledPosts.length + postsWithBody.length);

export const __typedFixtureModule = "typed-fixture-module";
