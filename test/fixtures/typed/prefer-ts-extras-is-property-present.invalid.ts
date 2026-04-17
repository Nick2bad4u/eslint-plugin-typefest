interface Post {
    readonly id: number;
    readonly title: string | null | undefined;
    readonly body: string | null | undefined;
}

declare const posts: readonly Post[];

const titledPosts = posts.filter((post) => post.title != null);
const postsWithBody = posts.filter((post) => post.body != null);

String(titledPosts.length + postsWithBody.length);

export const __typedFixtureModule = "typed-fixture-module";
