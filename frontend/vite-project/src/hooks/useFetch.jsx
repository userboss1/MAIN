import React,{useState} from "react";

const useFetch = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ error: 'An unknown network error occurred.' }));
                throw new Error(errorBody.error || `HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                setData(result);
            } else {
                throw new Error(result.error || 'The API returned an error.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, retry: fetchData };
};
export default useFetch;