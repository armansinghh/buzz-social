export interface Reaction {
  emoji: string;
  users: string[];
}

export interface Comment {
  id: string;

  authorId: string;

  authorUsername?: string;  // legacy only, never written to new comments
  
  authorAvatar?: string;    // legacy only, never written to new comments
  
  text: string;

  reactions: Reaction[];

  createdAt: string;
}

export interface Post {
  id: string;

  authorId: string;

  authorUsername: string;
  authorAvatar?: string;

  caption: string;

  media?: {
    url: string;
    type: "image" | "video";
  };

  likes: string[];

  comments: Comment[];

  createdAt: string;
}