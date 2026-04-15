export interface Reaction {
  emoji: string;
  users: string[];
}

export interface Comment {
  id: string;

  authorId: string;

  authorUsername: string;

  authorAvatar?: string;

  text: string;

  reactions: Reaction[];

  createdAt: string;
}

export interface Post {
  id: string;

  authorId: string;

  authorUsername: string;
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