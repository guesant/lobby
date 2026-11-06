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
