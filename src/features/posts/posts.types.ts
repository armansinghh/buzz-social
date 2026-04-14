export interface Reaction {
  emoji: string;
  users: string[];
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  reactions: Reaction[];
  createdAt: string;
}

export interface Post {
  id: string;

  authorId: string;

  authorName: string;
  authorPhoto?: string;

  caption: string;

  media?: {
    url: string;
    type: "image" | "video";
  };

  likes: string[];

  comments: Comment[];

  createdAt: string;
}