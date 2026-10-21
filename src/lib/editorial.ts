import data from "../../content/editorial.json";
export const EDITORIAL = data;
export const SOLUTIONS = data.solutions;
export const PUBLISHED_POSTS = data.posts.filter((post) => post.status === "published");
