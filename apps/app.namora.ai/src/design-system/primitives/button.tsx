// import tw, { styled, css, theme } from "twin.macro";

// const Button = styled.button(
//   ({
//     isPrimary,
//     isSecondary,
//     isSmall,
//   }: {
//     isPrimary: boolean;
//     isSecondary: boolean;
//     isSmall: boolean;
//   }) => [
//     // The common button styles added with the tw import
//     tw`px-8 py-2 text-lg rounded focus:outline-none`,
//     tw`transition-transform duration-75 transform`,

//     // Use the variant grouping feature to add variants to multiple classes
//     tw`hocus:(scale-105 text-yellow-400)`,

//     // Use props to conditionally style your components
//     isPrimary && tw`text-white bg-black border-black`,

//     // Combine regular css with tailwind classes within backticks
//     isSecondary && [
//       css`
//         box-shadow: 0 0.1em 0 0 rgba(0, 0, 0, 0.25);
//       `,
//       tw`border-2 border-yellow-600`,
//     ],

//     // Conditional props can be added
//     isSmall ? tw`text-sm` : tw`text-lg`,

//     // The theme import can supply values from your tailwind.config.js
//     css`
//       color: ${theme`colors.white`};
//     `,
//   ]
// );

// export default Button;

import tw from "tailwind-styled-components";

interface ButtonProps {
  $primary: boolean;
}

export const StyledButton = tw.button<ButtonProps>`
flex
${(p) => (p.$primary ? "bg-indigo-600" : "bg-indigo-300")}
`;
