import { useCallback, useEffect, useMemo, useState } from "react";
import Loader from "./components/Loader";
import Pagination from "./components/Pagination";
import Table from "./components/Table";
import { processList } from "./longProcesses/enums";
import { GetDataType, ProfileListType } from "./types/appData";
import { listPageSize } from "./utils/constants/app";
import styles from "./App.module.scss";

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

  const handlePageNumber = useCallback((userSelectedPage: number) => {
    if (window.Worker) {
      const request = {
        action: processList.getData,
        period: "pageNumber",
        thePageNumber: userSelectedPage,
      } as GetDataType;

      getDataWorker.postMessage(JSON.stringify(request));
    }
  }, []);

  const prevHandler = useCallback((userSelectedPage: number) => {
    if (profileList.page === 1) {
      return;
    }

    if (window.Worker) {
      const request = {
        action: processList.getData,
        period: "prev",
        thePageNumber: userSelectedPage - 1,
      } as GetDataType;

      getDataWorker.postMessage(JSON.stringify(request));
    }
  }, []);

  const nextHandler = (userSelectedPage: number, thePageLength: number) => {
    if (userSelectedPage < thePageLength) {
      if (window.Worker) {
        const request = {
          action: processList.getData,
          period: "next",
          thePageNumber: userSelectedPage + 1,
        } as GetDataType;

        getDataWorker.postMessage(JSON.stringify(request));
      }
    }
  };

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
    <main className={styles.mainContainer}>
      <section className={styles.count}>
        Total count of Profiles is{" "}
        <b>{lengthCount.loading ? <Loader size={14} /> : lengthCount.value}</b>
      </section>
      <section className={styles.tableContainer}>
        {profileList.loading ? (
          <Loader size={40} display="block" />
        ) : (
          <>
            <Table list={profileList.list} />
            <Pagination
              page={profileList.page}
              pages={lengthCount.value / listPageSize}
              pageClick={(pageNumber) => {
                handlePageNumber(pageNumber);
              }}
              prevHandler={() => prevHandler(profileList.page)}
              nextHandler={() =>
                nextHandler(profileList.page, lengthCount.value / listPageSize)
              }
            />
          </>
        )}
      </section>
    </main>
  );
};

export default App;
