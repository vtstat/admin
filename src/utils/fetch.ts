import { getDefaultStore } from "jotai";
import qs, { type UrlObject } from "query-string";
import { credentialAtom } from "../atoms";

const st = getDefaultStore();

// const baseUrl = "http://localhost:4444/api/admin";
const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const fetch = async <T>(urlOrObject: string | UrlObject): Promise<T> => {
  const res = await window.fetch(
    typeof urlOrObject === "string"
      ? baseUrl + urlOrObject
      : qs.stringifyUrl({
          ...urlOrObject,
          url: baseUrl + urlOrObject.url,
        }),
    {
      headers: { authorization: st.get(credentialAtom) },
    }
  );

  return res.json();
};

export const put = async (url: string, body: any): Promise<void> => {
  const res = await window.fetch(baseUrl + url, {
    method: "put",
    headers: {
      authorization: st.get(credentialAtom),
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return res.json();
};

export const post = async (url: string, body: any): Promise<void> => {
  const res = await window.fetch(baseUrl + url, {
    method: "post",
    headers: {
      authorization: st.get(credentialAtom),
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return res.json();
};
