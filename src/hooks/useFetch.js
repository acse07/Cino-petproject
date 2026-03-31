import { useEffect, useState } from 'react';

function useFetch(asyncFn, deps = [], { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;

    let isCancelled = false;
    setLoading(true);
    setError(null);

    asyncFn()
      .then(result => {
        if (!isCancelled) {
          setData(result);
        }
      })
      .catch(err => {
        if (!isCancelled) {
          setError(err);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading };
}

export default useFetch;

