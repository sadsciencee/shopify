import { type Fetcher, type Navigation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

export type ToastResponse = Record<string, unknown> & {
  toast?: {
    message: string;
    ok: boolean;
  };
};

export function useToast(fetcher: Fetcher<ToastResponse> | {data: ToastResponse, state: Navigation['state']}) {
  const shopify = useAppBridge();
  const [allowToastOnIdle, setAllowToastOnIdle] = useState<boolean>(
    fetcher.data?.toast !== undefined,
  );
  useEffect(() => {
    if (fetcher.state !== "idle") {
      if (!allowToastOnIdle) {
        setAllowToastOnIdle(true);
      }
      return;
    }
    if (
      fetcher.data?.toast?.message &&
      typeof fetcher.data?.toast?.ok === "boolean"
    ) {
      shopify.toast.show(fetcher.data.toast.message, {
        isError: !fetcher.data.toast.ok,
      });
      setAllowToastOnIdle(false);
    }
  }, [
    fetcher.state,
    fetcher.data?.toast?.message,
    fetcher.data?.toast?.ok,
    shopify,
  ]);
}
