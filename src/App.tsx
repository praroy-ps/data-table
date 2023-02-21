import { useEffect, useMemo, useState } from "react";
import Loader from "./components/Loader";
import Table from "./components/Table";
import { processList } from "./longProcesses/enums";
import { GetDataType, ProfileListType } from "./types/appData";

type LengthCountType = {
  loading: boolean;
  value: number;
};

const App = () => {
  const counterWorker: Worker = useMemo(
    () =>
      new Worker(new URL("./longProcesses/count.ts", import.meta.url), {
        type: "module",
      }),
    []
  );

  const getDataWorker: Worker = useMemo(
    () =>
      new Worker(new URL("./longProcesses/getData.ts", import.meta.url), {
        type: "module",
      }),
    []
  );

  const [lengthCount, setLengthCount] = useState<LengthCountType>({
    loading: true,
    value: 0,
  });

  const [profileList, setProfileList] = useState<ProfileListType>({
    loading: true,
    list: [],
    page: 1,
  });

  useEffect(() => {
    if (window.Worker) {
      counterWorker.postMessage(processList.count);
    }
  }, [counterWorker]);

  useEffect(() => {
    if (window.Worker) {
      counterWorker.onmessage = (e: MessageEvent<string>) => {
        setLengthCount((prev) => ({
          ...prev,
          loading: false,
          value: Number(e.data) && Number(e.data),
        }));
      };
    }
  }, [counterWorker]);

  useEffect(() => {
    if (window.Worker) {
      const request = {
        action: processList.getData,
        period: "initial",
        thePageNumber: profileList.page,
      } as GetDataType;

      getDataWorker.postMessage(JSON.stringify(request));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (window.Worker) {
      getDataWorker.onmessage = (e: MessageEvent<string>) => {
        const response = JSON.parse(e.data) as unknown as ProfileListType;

        setProfileList((prev) => ({
          ...prev,
          loading: response.loading,
          list: response.list,
          page: response.page,
        }));
      };
    }
  }, [getDataWorker]);

  return (
    <main className="main-container">
      <section className="count">
        Total count of Profiles is{" "}
        <b>{lengthCount.loading ? <Loader size={14} /> : lengthCount.value}</b>
      </section>
      <section className="table-container">
        {profileList.loading ? (
          <Loader size={40} display="block" />
        ) : (
          <Table list={profileList.list} />
        )}
      </section>
    </main>
  );
};

export default App;
