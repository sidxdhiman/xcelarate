export interface Option {
  id?: string;   
  _id?: string;        
  text: string;
}

export interface Question {
  id?: string;
  _id?: string;
  text: string;
  options: Option[];
}

export interface Assessment {
  _id: string;
  title: string;
  roles: string[];
  questions: Question[];
}
