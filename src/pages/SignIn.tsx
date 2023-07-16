import { useSetAtom } from "jotai";
import React, { useEffect } from "react";

import { credentialAtom } from "../atoms";

type Props = {};

const SignIn: React.FC<Props> = ({}) => {
  const setCredential = useSetAtom(credentialAtom);

  useEffect(() => {
    (window as any).handleCredentialResponse = (res: any) => {
      setCredential(res.credential);
    };

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      delete (window as any).handleCredentialResponse;
    };
  }, []);

  return (
    <div>
      <div
        id="g_id_onload"
        data-client_id={import.meta.env.VITE_GOOGLE_CLIENT_ID}
        data-context="signin"
        data-ux_mode="popup"
        data-callback="handleCredentialResponse"
        data-auto_select="true"
        data-close_on_tap_outside="false"
        data-itp_support="false"
      />

      <div
        className="g_id_signin"
        data-type="standard"
        data-shape="rectangular"
        data-theme="outline"
        data-text="signin_with"
        data-size="large"
        data-logo_alignment="left"
      />
    </div>
  );
};

export default SignIn;
