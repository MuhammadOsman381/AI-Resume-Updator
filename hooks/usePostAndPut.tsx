import { useState } from "react";
import toast from 'react-hot-toast';
import Helpers from "../config/Helpers";

type ApiMethod = (url: string, data: any, config: { headers: any }) => Promise<any>;

const usePostAndPut = (method: ApiMethod) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [response, setResponse] = useState<any>(null);
    const [error, setError] = useState<any>(null);

    const callApi = async (
        path: string,
        data: any,
        auth: boolean,
        fileHeaders: boolean,
        showMessage: boolean
    ) => {
        setLoading(true);
        setError(null);
        const url = `${Helpers.apiUrl}${path}`;
        let headers;

        if (auth) {
                 headers = fileHeaders
                ? {
                    "Content-Type": "multipart/form-data",
                    authorization: `${localStorage.getItem("authorization")}`,
                }
                : {
                    "Content-Type": "application/json",
                    authorization: `${localStorage.getItem("authorization")}`,
                };
        } else {
            headers = fileHeaders
                ? { "Content-Type": "multipart/form-data" }
                : { "Content-Type": "application/json" };
        }

        try {
            const res = await method(url, data, { headers });
            setResponse(res);
            setError(null)
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            showMessage && toast.success(res.data.message)
            return res
        } catch (err: any) {
            setResponse(null);
            setError(err);
            toast.error(err.response.data.message)
            return err
        } finally {
            setLoading(false);
        }
    };

    return { callApi, loading, response, error };
};

export default usePostAndPut;