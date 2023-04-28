import tw from "tailwind-styled-components";

interface TextProps {
  $large: boolean;
}

export const StyledText = tw.p<TextProps>`
${(p) => (p.$large ? "text-lg" : "text-base")}
text-indigo-500
`;
