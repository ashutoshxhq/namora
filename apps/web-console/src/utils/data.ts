export function getFullName(obj: any): string {
  const userName =
    obj?.firstname || obj?.lastname
      ? `${obj?.firstname ?? ""} ${obj?.lastname ?? ""}`
      : "";
  return userName;
}
