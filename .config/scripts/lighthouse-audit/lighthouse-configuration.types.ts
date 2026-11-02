export type LighthouseConfiguration = {
  ci: {
    assert: {
      assertions: Record<string, unknown>;
    };
    collect: {
      settings: {
        chromeFlags: string;
      };
    };
  };
};
