export interface Post {
  id: string;
  authorId: string;
  caption: string;
  media?: {
    url: string;
    type: "image" | "video";
  };
  likes: string[];
  createdAt: string;
}


//authorId allows profile filtering later
//caption ig terminology
//mediaUrl optional image/video
//likes: string[] supports like toggling per user
//createdAt enables sorting & timestamps