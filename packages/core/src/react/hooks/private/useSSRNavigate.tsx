import { useCallback } from "react";
import {useAuthNavigate} from "./useAuthNavigate";
import type { RelativeRoutingType } from "@remix-run/router";
type NavigateOptions = {
	replace?: boolean;
	state?: any;
	preventScrollReset?: boolean;
	relative?: RelativeRoutingType;
	flushSync?: boolean;
	viewTransition?: boolean;
};
export function useSSRNavigate() {
	const navigate = useAuthNavigate();
	const handleNavigation = useCallback(
		(to: string, options?: NavigateOptions) => {
			history.pushState({}, "", to);
			navigate(to, options);
		},
		[navigate],
	);
	return handleNavigation;
}
