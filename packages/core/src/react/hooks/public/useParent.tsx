import { useEffect, useRef, useCallback, useState } from 'react';
import {
	type MaxModalButton,
	type ModalMessage,
	type SharedState,
	type TitleBarState,
} from '../../../shared/modal';
import { useModalId } from '../private/useModalId';

/**
 * Configuration for setting up a message channel with the host
 */
export interface UseParentArgs {
	/**
	 * A unique ID segment used to build `modalId`. If the route
	 * is modal.products.$id, this would be passed from the $id param.
	 */
	id: string;
	/**
	 * A route segment used to build `modalId`. If the route is
	 * modal.products.$id, this would be 'products'.
	 */
	route: string;
	/**
	 * Callback that fires when the primary action is triggered
	 * by the title bar.
	 */
	onPrimaryAction?: () => void;
	/**
	 * Callback that fires when the secondary action is triggered
	 * by the title bar.
	 */
	onSecondaryAction?: () => void;
	/**
	 * Callback that fires when the parent replies to a message from the modal.
	 */
	onReply?: <T extends SharedState>(data: T) => void;
}

/**
 * Used this hook inside your modal route to handle messaging between host and modal components
 */
export function useParent<T extends SharedState = SharedState>(args: UseParentArgs) {
	const [sharedState, setSharedState] = useState<T | null>(null);
	const [titleBarState, setTitleBarState] = useState<TitleBarState | null>(null);
	const [loaded, setLoaded] = useState(false);
	const { id, route, onPrimaryAction, onSecondaryAction } = args;
	const modalId = useModalId({ id, route });

	const messageHandler = useCallback((evt: MessageEvent<ModalMessage>) => {
		const msg = evt.data;
		switch (msg.type) {
			case 'sendParentState':
				setSharedState(msg.data.sharedState as T);
				setTitleBarState(msg.data.titleBarState);
				setLoaded(true);
				return;
			case 'titleBarAction':
				switch (msg.data.action) {
					case 'secondary':
						onSecondaryAction?.();
						return;
					case 'primary':
						onPrimaryAction?.();
						return;
				}
				return;
			case 'messageFromParent':
				if (args.onReply) {
					args.onReply(msg.data);
				}
				return;
			default:
				return;
		}
	}, [])

	/**
	 * Initialize `MessageChannel` with parent frame on modal mount.
	 */
	const channelRef = useRef<MessageChannel | null>(null);
	const port1Ref = useRef<MessagePort | null>(null);
	useEffect(() => {
		if (channelRef.current) {
			// Channel exists, don't reinitialize
			return;
		}
		channelRef.current = new MessageChannel();

		const { port1, port2 } = channelRef.current;
		port1Ref.current = port1;



		/**
		 * listen to messages on `port1`
		 */
		port1.onmessage = messageHandler;

		/**
		 * transfer `port2` to the parent.
		 */
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
		window?.opener?.postMessage({ type: '__MODAL_CHANNEL_INIT__', modalId }, location.origin, [
			port2,
		]);

		return () => {
			if (port1Ref.current) {
				port1Ref.current.onmessage = null;
				port1Ref.current.close();
			}
			if (channelRef.current?.port2) {
				channelRef.current.port2.close();
			}
			channelRef.current = null;
			port1Ref.current = null;
		};
	}, []);

	const sendMessage = useCallback(<TMessagePayload extends SharedState>(data: TMessagePayload) => {
		const port = port1Ref.current;
		if (!port) {
			console.warn('Attempted to send message without active port');
			return;
		}
		const message: ModalMessage = { type: 'messageFromPortal', data };
		port.postMessage(message);
	}, []);

	const updateParentTitleBarState = useCallback(
		(data: TitleBarState) => {
			const port = port1Ref.current;
			if (!port) {
				console.warn('Attempted to send message to modal without an active channel.');
				return;
			}
			const variant = titleBarState?.variant ? titleBarState.variant : 'base';
			const message: ModalMessage = { type: 'titleBarState', data: { ...data, variant } };
			setTitleBarState({ ...data, variant });
			port.postMessage(message);
		},
		[titleBarState?.variant],
	);

	type UpdateTitleBarArgs = {
		title?: string;
		primaryButton?: Partial<TitleBarState['primaryButton']> | null;
		secondaryButton?: Partial<TitleBarState['secondaryButton']> | null;
	};

	const updateTitleBar = useCallback(
		({ primaryButton, secondaryButton, title }: UpdateTitleBarArgs) => {
			if (!titleBarState) {
				console.error('Title bar state is not yet available');
				return;
			}

			const updateButton = (
				newButton: Partial<MaxModalButton> | null | undefined,
				existingButton: typeof titleBarState.primaryButton,
			): MaxModalButton | undefined => {
				if (newButton === null) return undefined;
				if (!newButton) return existingButton;

				let result = {
					...existingButton,
					...(newButton.disabled !== undefined && { disabled: newButton.disabled }),
					...(newButton.label !== undefined && { label: newButton.label }),
				} as MaxModalButton | undefined;
				if (result?.disabled === undefined) {
					console.error(
						'Button did not previously exist, you need to pass in a disabled state here',
					);
					result = undefined;
				}
				if (result?.label === undefined) {
					console.error('Button did not previously exist, you need to pass in a label here');
					result = undefined;
				}
				return result;
			};

			updateParentTitleBarState({
				variant: titleBarState.variant,
				title: title ?? titleBarState.title,
				primaryButton: updateButton(primaryButton, titleBarState.primaryButton),
				secondaryButton: updateButton(secondaryButton, titleBarState.secondaryButton),
			});
		},
		[updateParentTitleBarState, titleBarState],
	);

	return {
		/**
		 * Send a message to the parent frame.
		 * @example sendMessage({ userEmail: 'david@ucoastweb.com' });
		 */
		sendMessage,
		/**
		 * The initial state of the parent frame, at the time the modal was loaded.
		 */
		parentState: sharedState,
		/**
		 * The initial state of the title bar in the parent frame, at the time the modal was loaded.
		 */
		titleBarState,
		/**
		 * Modify the title bar in the parent frame.
		 * @example updateTitleBar({
		 *    title: 'Create Product',
		 * 		primaryButton: { label: 'Save', disabled: false },
		 * 		secondaryButton: { label: 'Reset', disabled: false }
		 * 	});
		 *
		 * You only have to pass the values you want to change. To disable the primary button, pass `disabled: true`.
		 * @example updateTitleBar({ primaryButton: { disabled: true } });
		 *
		 * To hide an existing button, pass `null`.
		 * @example updateTitleBar({ primaryButton: null });
		 */
		updateTitleBar,
		/**
		 * Whether the parent frame has finished loading the initial state. You may or may not
		 * care about this.
		 */
		loaded,
	};
}
