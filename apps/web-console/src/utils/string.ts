import { Buffer } from "buffer";

export function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

export const encodeBase64 = (data: any) => {
  return Buffer.from(data).toString("base64");
};

export const getAllFirstChars = (str: string) => {
  const name = str;
  const data = name?.split(" ");
  let output = "";

  for (let i = 0; i < data?.length; i++) {
    output += data[i].substring(0, 1);
  }

  return output;
};
