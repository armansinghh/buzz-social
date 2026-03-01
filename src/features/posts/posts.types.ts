export interface Post {
  id: string;
  authorId: string;      // relational
  caption: string;       // renamed from content
  mediaUrl?: string;     // optional media
  likes: string[];       // array of userIds
  createdAt: string;
}


//authorId allows profile filtering later
//caption ig terminology
//mediaUrl optional image/video
//likes: string[] supports like toggling per user
//createdAt enables sorting & timestamps