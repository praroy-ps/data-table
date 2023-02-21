import { profiles } from "../data";
import { GetDataType, ProfileListType } from "../types/appData";
import { listPageSize } from "../utils/constants/app";
import { processList } from "./enums";

self.onmessage = (e: MessageEvent<string>) => {
  const data = JSON.parse(e.data) as GetDataType;

  if (data.action !== processList.getData) {
    return;
  }
  if (data.period === "initial") {
    const items = profiles.filter((_, index: number) => index < listPageSize);

    const response = JSON.stringify({
      loading: false,
      list: items,
      page: data.thePageNumber,
    } as ProfileListType);

    self.postMessage(response);
  }
};

export {};
