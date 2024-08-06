import { UserInterface } from "./UserInterface";

export interface PostsInterface {
  post: PostInterface;
}

export interface PostInterface {
  _id: string | undefined;
  user: UserInterface;
  text?: string;
  img?: string;
  likes?: string[] | undefined;
  comments?: PostInterface[] | undefined;
  createdAt?: any;
}
