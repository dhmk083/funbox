import React from "react";
import styles from "./styles.module.css";

const Spinner = () => (
  <div className={styles.spinner}>
    <h2>Загрузка...</h2>
  </div>
);

const lazyLoad = (load) =>
  React.lazy(() => {
    const Comp = ({ onLoad, children }) => {
      React.useEffect(() => {
        onLoad();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      return children;
    };

    return load().then(() => ({ default: Comp }));
  });

const Loader = ({ load, onLoad, children }) => {
  const Comp = React.useMemo(() => lazyLoad(load), [load]);

  return (
    <React.Suspense fallback={<Spinner />}>
      <Comp onLoad={onLoad}>{children}</Comp>
    </React.Suspense>
  );
};

export default Loader;
