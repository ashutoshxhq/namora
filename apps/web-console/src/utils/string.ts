import { Buffer } from "buffer";

export function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

export const encodeBase64 = (data: any) => {
  return Buffer.from(data).toString("base64");
};
