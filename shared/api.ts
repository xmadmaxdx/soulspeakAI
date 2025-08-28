export interface JournalEntryRequest {
  content: string;
  mood?: number;
  email: string;
  userName?: string;
  tags?: string[];
}

export interface JournalEntryResponse {
  id: string;
  content: string;
  aiResponse: string;
  mood?: number;
  createdAt: string;
  success: boolean;
}

export interface MoodEntryRequest {
  moodLevel: number;
  notes?: string;
  email: string;
  userName?: string;
}

export interface MoodEntryResponse {
  id: string;
  moodLevel: number;
  notes?: string;
  createdAt: string;
  success: boolean;
}

export interface MoodDataResponse {
  entries: Array<{
    id: string;
    moodLevel: number;
    notes?: string;
    createdAt: string;
  }>;
  success: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  history?: Array<{ role: string; content: string }>;
}

export interface ChatResponse {
  message: string;
  conversationId: string;
  success: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  email: string;
  username?: string;
  bio?: string;
}

export interface UserProfileResponse {
  success: boolean;
  user: UserProfile;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode?: number;
}
