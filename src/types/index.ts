export interface PodcastPayload {
  title: string;
  hosts: string[];
  style: string;
  length_minutes: number;
  user_id: string;
}

export interface Script {
  id: string;
  user_id: string;
  title: string;
  status: 'DRAFT_PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  script_draft: string;
  created_at: Date;
}