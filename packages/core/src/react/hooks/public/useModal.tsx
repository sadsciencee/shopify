import { useEffect, useRef, useCallback } from 'react';
import { type ModalMessage } from '../../../shared/modal';
import { useModalId } from '../private/useModalId';

/**
 * Configuration for setting up a message channel with the host
 */
export interface UseModalArgs {
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
}

/**
 * Used this hook inside your modal route to handle messaging between host and modal components
 */
export function useModal(args: UseModalArgs) {
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
			// if (msg.modalId !== modalId) return;
			if (msg.type !== 'titleBarAction') return;
			switch (msg.data.action) {
				case 'secondary':
					onSecondaryAction?.();
					break;
				case 'primary':
					onPrimaryAction?.();
					break;
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
		(payload: ModalMessage) => {
			const channel = channelRef.current;
			if (!channel) {
				console.warn('Attempted to send message to modal without an active channel.');
				return;
			}
			const message: ModalMessage & { modalId: string } = { modalId, ...payload };
			channel.port1.postMessage(message);
		},
		[modalId],
	);

	return { modalId, sendMessage };
}
