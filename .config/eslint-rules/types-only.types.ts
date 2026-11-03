export type TypeSyntaxNode = {
  body?: TypeSyntaxNode[];
  declaration?: TypeSyntaxNode | null;
  exportKind?: string;
  importKind?: string;
  loc: {
    end: {
      column: number;
      line: number;
    };
    start: {
      column: number;
      line: number;
    };
  };
  specifiers?: TypeSyntaxNode[];
  type?: string;
};
