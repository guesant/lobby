export type Technology = {
  id: string;
  name: string;
  url: string;
};

export type TechnologyGroup = {
  id: string;
  labels: Record<string, string>;
  items: Technology[];
};

export type PersonalProfile = {
  version: 1;
  full_name: string;
  spoken_languages: {
    id: string;
    labels: Record<string, string>;
  }[];
  birth_place: Record<string, string>;
  residence: Record<string, string>;
  birth_country: {
    labels: Record<string, string>;
    url: string;
  };
  labels: {
    born: Record<string, string>;
    lives: Record<string, string>;
    languages: Record<string, string>;
  };
  contact_links: string[];
};

export type PublicProfile = {
  version: 1;
  source: {
    url: string;
    revision: string;
  };
  language: 'en';
  name: string;
  username: string;
  spoken_languages: string[];
  birth_place: string;
  residence: string;
  birth_country: {
    name: string;
    url: string;
  };
  interests: {
    id: string;
    title: string;
    description: string;
  }[];
  contacts: {
    id: string;
    title: string;
    url: string;
  }[];
  technologies: TechnologyGroup[];
};
