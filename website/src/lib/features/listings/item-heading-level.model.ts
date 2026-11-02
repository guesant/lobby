export function itemHeadingLevel(level: 2 | 3 | 4): 3 | 4 | 5 {
  if (level === 2) {
    return 3;
  }

  if (level === 3) {
    return 4;
  }

  return 5;
}
