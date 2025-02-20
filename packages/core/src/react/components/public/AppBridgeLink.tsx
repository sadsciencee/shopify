import {useSSRNavigate} from "../../hooks/private/useSSRNavigate";
import {Link as RemixLink, type RemixLinkProps} from "@remix-run/react/dist/components";
type LinkProps = Omit<RemixLinkProps, "onClick" | "to"> & {
	to: string;
};

export function AppBridgeLink({ children, to, ...rest }: LinkProps) {
	const navigate = useSSRNavigate();
	return (
		<RemixLink
			to={to}
			{...rest}
			onClick={(e) => {
				e.preventDefault();
				navigate(to);
			}}
		>
			{children}
		</RemixLink>
	);
}
