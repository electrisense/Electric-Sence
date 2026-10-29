export type NavigationTab = 
  | 'chat'
  | 'subjects'
  | 'tools'
  | 'study-materials'
  | 'projects'
  | 'settings';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messages: ChatMessage[];
}

export interface ElectricalSubject {
  id: string;
  code: string;
  title: string;
  description: string;
  topics: string[];
  coreConcepts: string[];
  recommendedFormulas: string[];
}

export interface EngineeringTool {
  id: string;
  title: string;
  description: string;
  category: 'DC Circuits' | 'AC Circuits' | 'Machines' | 'Electronics';
}

export interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  type: 'Formula Sheet' | 'Lecture Notes' | 'Exam Guide' | 'Lab Manual';
  topicsCovered: string[];
  downloadsCount: number;
}

export interface EEEProject {
  id: string;
  title: string;
  level: 'Undergraduate' | 'Intermediate' | 'Advanced Capstone';
  domain: 'Power Electronics' | 'Renewable Energy' | 'Embedded Systems / IoT' | 'Electric Vehicles';
  description: string;
  keyComponents: string[];
  simulationTools: string[];
}
