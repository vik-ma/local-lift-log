type ExtractTextFromInsideBracketsReturnType = {
  isValid: boolean;
  text: string;
};

export const ExtractTextFromInsideBrackets = (
  str: string
): ExtractTextFromInsideBracketsReturnType => {
  const regex = /^\[(.*)\]$/;

  const match = str.match(regex);

  const isValid = match !== null;
  const text = match ? match[1] : "";

  return { isValid, text };
};
