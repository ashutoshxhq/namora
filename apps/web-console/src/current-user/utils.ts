import { currentUserEntityKey } from "./constants";

export function getUserDataInGroupByType(data: { [key: string]: any }[]) {
  const groupedDataByType = data?.map((obj: any) => {
    return {
      id: obj.id,
      name: `${obj.firstname ?? ""} ${obj.lastname ?? ""}`,
      type: currentUserEntityKey,
    };
  });
  // .reduce(
  //   (
  //     mapperObj: { [key: string]: any },
  //     targetObj: { [key: string]: any; type: string }
  //   ) => {
  //     const { type } = targetObj;
  //     mapperObj[type] = [...(mapperObj[type] || []), { ...targetObj }];
  //     return mapperObj;
  //   },
  //   {}
  // );

  return groupedDataByType;
}
