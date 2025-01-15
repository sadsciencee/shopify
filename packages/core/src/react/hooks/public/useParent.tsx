import { useEffect, useRef, useCallback, useState } from 'react';
import { type ModalMessage, type SharedState, type TitleBarState } from '../../../shared/modal';
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
	onReply?: <T extends Record<string, never>>(data: T) => void;
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

	/**
	 * Initialize `MessageChannel` with parent frame on modal mount.
	 */
	const channelRef = useRef<MessageChannel | null>(null);
	useEffect(() => {
		channelRef.current = new MessageChannel();

		const { port1, port2 } = channelRef.current;

		/**
		 * listen to messages on `port1`
		 */
		port1.onmessage = (evt: MessageEvent<ModalMessage>) => {
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
		};

		/**
		 * transfer `port2` to the parent.
		 */
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
		window?.opener?.postMessage({ type: '__MODAL_CHANNEL_INIT__', modalId }, location.origin, [
			channelRef.current.port2,
		]);

		return () => {
			port1.onmessage = null;
			port1.close();
			port2.close();
			channelRef.current = null;
		};
	}, [modalId, onSecondaryAction, onPrimaryAction]);

	const sendMessage = useCallback(
		<TMessagePayload extends Record<string, never>>(data: SharedState<TMessagePayload>) => {
			const channel = channelRef.current;
			if (!channel) {
				console.warn('Attempted to send message to modal without an active channel.');
				return;
			}
			const message: ModalMessage = { type: 'messageFromPortal', data };
			channel.port1.postMessage(message);
		},
		[modalId],
	);

	const updateParentTitleBarState = useCallback(
		(data: PayloadRegistry['titleBarState']) => {
			const channel = channelRef.current;
			if (!channel) {
				console.warn('Attempted to send message to modal without an active channel.');
				return;
			}
			const variant = titleBarState?.variant ? titleBarState.variant : 'base'
			const message: ModalMessage = { type: 'titleBarState', data: { ...data, variant } };
			setTitleBarState({ ...data, variant });
			channel.port1.postMessage(message);
		},
		[titleBarState?.variant],
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
		 * Modify the title bar state - use this to change 'disabled' status or hide/remove buttons
		 * This will completely override the title bar state, so make sure to pass in the existing state along with your changes.
		 * @example setTitleBarState({ ...titleBarState, primaryButton: { disabled: false, label: titleBarState.primaryButton.label } });
		 */
		setTitleBarState: updateParentTitleBarState,
		/**
		 * Whether the parent frame has finished loading the initial state. You may or may not
		 * care about this.
		 */
		loaded,
	};
}
