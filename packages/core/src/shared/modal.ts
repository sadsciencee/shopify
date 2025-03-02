export type RouteErrorResponse = {
	success: false;
	message: string;
};

export type RouteSuccessResponse<T> = T & {
	success: true;
};

export type RouteResponse<T> = RouteErrorResponse | RouteSuccessResponse<T>;

export type SharedState<T extends Record<string, unknown> = Record<string, unknown>> = T;

export type TitleBarState =
	| ({ variant: 'max' } & MaxModalTitleBarProps)
	| ({ variant: 'small' | 'base' | 'large' } & BaseTitleBarProps);

declare global {
	interface PayloadRegistry {
		close: { error?: false; message?: string } | { error: true; message: string };
		toast: { error?: boolean; message: string };
		requestState: Record<string, never>;
		sendParentState: {
			sharedState: SharedState;
			titleBarState: TitleBarState;
		};
		messageFromPortal: SharedState;
		messageFromParent: SharedState;
		reloadParent: { closeAfterReload: boolean };
		titleBarAction: { action: 'primary' | 'secondary' };
		titleBarState: TitleBarState;
	}
}

export type PayloadKey = keyof PayloadRegistry;
export type PayloadData<K extends PayloadKey> = PayloadRegistry[K];

export type ModalMessage = {
	[K in keyof PayloadRegistry]: {
		type: K;
		data: PayloadData<K>;
	};
}[keyof PayloadRegistry];

export type SendMessageCallback = (payload: ModalMessage) => void;
/**
 * Type mapping of event keys to callback functions, strongly typed from global `PayloadRegistry`.
 */
export type ReceiveMessageCallback = {
	[K in PayloadKey]: <T extends K>(
		data: PayloadRegistry[T] extends PayloadRegistry[K] ? PayloadRegistry[T] : never,
	) => void;
}[PayloadKey];

export type HandlersMap = {
	[K in PayloadKey]?: (data: PayloadData<K>) => void;
};

export type BaseTitleBarProps = {
	title: string;
	primaryButton?: ModalButton;
	secondaryButton?: ModalButton;
};

export type MaxModalTitleBarProps = {
	title: string;
	primaryButton?: MaxModalButton;
	secondaryButton?: MaxModalButton;
};

export type MaxModalButton = {
	label: string;
	disabled: boolean;
};

type ModalButton = {
	label: string;
	disabled: boolean;
};

export type ModalControls = {
	close: typeof close;
	reply: (data: PayloadRegistry['messageFromParent']) => void;
}

export type ModalMessageHandler<T extends SharedState = SharedState> = (data: T, controls: ModalControls) => void;
