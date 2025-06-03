export interface PodcastPayload {
  title: string;
  description: string;          // new, since Prisma’s Podcast.description is non‐null with default ""
  hosts: string[];              // e.g. ["Alice", "Bob"]
  style: string;                // e.g. "conversational"
  length_minutes: number;
  user_id: string;              // should match Clerk userId
}
export interface Script {
  fullText: string;             // the entire generated transcript
  segments: {
    hostName: string;           // e.g. "Alice" or "Bob"
    text: string;               // only that host’s spoken text
    segmentIndex: number;
  }[];
}