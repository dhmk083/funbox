import { Outlet } from "react-router-dom";
import Searchbox from "components/Searchbox";
import PointsList from "components/PointsList";
import { SearchByName } from "types";
import styles from "./styles.module.css";

type Props = {
  searchProvider: SearchByName;
};

export default function MapPage({ searchProvider }: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <Searchbox searchProvider={searchProvider} />
        <PointsList />
      </div>
      <div className={styles.map}>
        <Outlet />
      </div>
    </div>
  );
}
