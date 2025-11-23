
export enum View {
  GEO_GUESSER = 'GEO_GUESSER'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
        reviewSnippets?: {
            content: string;
        }[]
    }[]
  };
}

export interface GeoAnalysisResult {
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  confidence: number;
  analysis_log: string[];
  social_context: string;
  biometric_analysis: string;
}

export interface FeedbackSubmission {
  guessedLocation: string;
  isCorrect: boolean;
  actualLocation?: string;
  timestamp: number;
}
