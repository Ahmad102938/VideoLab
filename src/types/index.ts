export interface PodcastPayload {
  title: string;
  description: string;         
  hosts: string[];           
  style: string;                
  length_minutes: number;
  user_id: string;         
}
export interface Script {
  fullText: string;           
  segments: {
    hostName: string;         
    text: string;               
    segmentIndex: number;
  }[];
}