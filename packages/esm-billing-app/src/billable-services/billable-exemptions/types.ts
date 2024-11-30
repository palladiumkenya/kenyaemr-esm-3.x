export interface Schema {
  services: {
    all: Service[];
    'program:HIV'?: Service[];
    'program:TB'?: Service[];
    'age<5'?: Service[];
    'visitAttribute:prisoner'?: Service[];
  };
  commodities: Record<string, unknown>;
}

export interface Service {
  concept: string;
  description: string;
}
