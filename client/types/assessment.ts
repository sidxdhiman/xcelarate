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
  _id?: string;
  title: string;
  roles: string[];
  questions: {
    _id?: string;
    text: string;
    options: {
      _id?: string;
      text: string;
    }[];
  }[];
  user?: {
    name: string;
    email: string;
    phone: string;
    designation: string;
    department: string;
  };
  location?: {
    lat: number;
    lon: number;
  };
  startedAt?: number;
}


