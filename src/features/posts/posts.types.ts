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
  caption: string;
  media?: {
    url: string;
    type: "image" | "video";
  };
  likes: string[];
  comments: Comment[];
  createdAt: string;
}
//authorId allows profile filtering later
//caption ig terminology
//mediaUrl optional image/video
//likes: string[] supports like toggling per user
//createdAt enables sorting & timestamps