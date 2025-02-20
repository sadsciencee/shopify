import { useCallback } from "react";
import {useLocation, useNavigate} from "@remix-run/react";
import type {RelativeRoutingType} from "@remix-run/router";
type NavigateOptions = {
  replace?: boolean;
  state?: any;
  preventScrollReset?: boolean;
  relative?: RelativeRoutingType;
  flushSync?: boolean;
  viewTransition?: boolean;
};

export function useAuthNavigate() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleNavigation = useCallback(
    (to: string,  options?: NavigateOptions) => {
      navigate(`${to}`, options ?? {
        relative: 'route'
      })
    },
    [navigate],
  );
  return handleNavigation;
}
