import { useToast } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import qs, { type UrlObject } from "query-string";
import { useCallback } from "react";
import { credentialAtom } from "../atoms";

// const baseUrl = "http://localhost:4444/api/admin";
const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const useFetch = () => {
  const authorization = useAtomValue(credentialAtom);
  const toast = useToast();

  const mutation = useCallback(
    async (method: "put" | "post", url: string, body: any) => {
      const res = await window.fetch(baseUrl + url, {
        method,
        headers: { authorization, "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if ("msg" in json && typeof json.msg === "string") {
        toast({ title: json.msg, status: "success", isClosable: true });
      }

      return json;
    },
    [authorization, toast]
  );

  const query = useCallback(
    async <T>(urlOrObject: string | UrlObject): Promise<T> => {
      const res = await window.fetch(
        typeof urlOrObject === "string"
          ? baseUrl + urlOrObject
          : qs.stringifyUrl({
              url: baseUrl + urlOrObject.url,
              query: urlOrObject.query,
            }),
        {
          headers: { authorization },
        }
      );

      return res.json();
    },
    [authorization, toast]
  );

  return {
    get: query,
    put: (url: string, body: any) => mutation("put", url, body),
    post: (url: string, body: any) => mutation("post", url, body),
  };
};
