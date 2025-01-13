import { useEffect, useRef, useCallback } from 'react';
import { type PayloadKey, type PayloadData, type ModalMessage, MessageCallback } from '../../../shared/modal';
import { useModalId } from '../private/useModalId';

type HandlersMap = {
	[K in PayloadKey]?: (data: PayloadData<K>) => void;
};

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
	const portRef = useRef<MessagePort | null>(null);

	useEffect(() => {
		function handlePortInit(
			event: MessageEvent<
				{ type: '__MODAL_CHANNEL_INIT__'; modalId: string } | Record<string, never>
			>,
		) {
			const { data, ports } = event;
			if (!data || data.type !== '__MODAL_CHANNEL_INIT__') return;
			if (data.modalId !== modalId) return;
			const [port] = ports;
			if (!port) return;

			// handles re-init case
			if (portRef.current) {
				portRef.current.onmessage = null;
				portRef.current.close();
			}

			portRef.current = port;
			port.start();

			port.onmessage = (evt: MessageEvent<ModalMessage>) => {
				const msg = evt.data;
				if (msg.modalId !== modalId) return;
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
		}

		// Listen for the parent's __MODAL_CHANNEL_INIT__ event.
		// If the parent remounts, we'll get a new event & new port.
		window.addEventListener('message', handlePortInit);

		return () => {
			window.removeEventListener('message', handlePortInit);
			if (portRef.current) {
				portRef.current.onmessage = null;
				portRef.current.close();
				portRef.current = null;
			}
		};
	}, [modalId, onPrimaryAction, onSecondaryAction]);

	/**
	 * Sends a typed message from child to parent.
	 */
	const sendMessage: MessageCallback = useCallback(
		(type, data) => {
			const port = portRef.current;
			if (!port) return;
			const message: ModalMessage = { modalId, type, data };
			port.postMessage(message);
		},
		[modalId],
	);

	return { modalId, sendMessage };
}
