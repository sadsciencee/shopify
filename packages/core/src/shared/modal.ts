export type RouteErrorResponse = {
	success: false;
	message: string;
};

export type RouteSuccessResponse<T> = T & {
	success: true;
};

export type RouteResponse<T> = RouteErrorResponse | RouteSuccessResponse<T>;

/*
export interface PayloadRegistry {
}
*/

declare global {
	interface PayloadRegistry {
		close: { error?: false; message?: string } | { error: true; message: string };
		toast: { error?: boolean; message: string };
		reloadParent: { closeAfterReload: boolean };
		titleBarAction: { action: 'primary' | 'secondary' };
		titleBarState:
			| ({ variant: 'max' } & MaxModalTitleBarProps)
			| ({ variant: 'small' | 'base' | 'large' } & BaseTitleBarProps);
	}
}

export type PayloadKey = keyof PayloadRegistry;
export type PayloadData<K extends PayloadKey> = PayloadRegistry[K];



export type ModalMessage = {
	[K in keyof PayloadRegistry]: {
		type: K;
		modalId: string;
		data: PayloadData<K>;
	};
}[keyof PayloadRegistry];

export type MessageCallback = <K extends PayloadKey>(type: K, data: PayloadData<K>) => void;

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

type MaxModalButton = {
	label: string;
	disabled: boolean;
};

type ModalButton = {
	label: string;
	disabled: boolean;
};
