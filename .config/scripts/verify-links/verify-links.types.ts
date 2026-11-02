export type LinkFailure = {
  url: string;
  status: {
    code: number;
  };
};

export type VerifiedLink = {
  url: string;
  status: number;
  method: string;
};

export type LinkRequester = (
  url: string,
  options: RequestInit,
) => Promise<Response>;
