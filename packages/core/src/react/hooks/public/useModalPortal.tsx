import { useEffect, useRef, useCallback, useState, useMemo, type ComponentType } from 'react';
import {
	type ModalMessage,
	type BaseTitleBarProps,
	type MaxModalTitleBarProps,
	type ReceiveMessageCallback,
	type HandlersMap,
	type SharedState,
} from '../../../shared/modal';
import { useModalId } from '../private/useModalId';
import { useAppBridge } from '@shopify/app-bridge-react';
// import { useNavigate } from '@remix-run/react';

export type UseModalPortalArgs<T extends SharedState = SharedState> = BaseModalProps<T> &
	(StandardModalProps | MaxModalProps);
export type ModalV4Props<T extends SharedState = SharedState> = UseModalPortalArgs<T> & {
	opener: ComponentType<{ onClick: (e?: React.MouseEvent) => void }>;
};

type BaseModalProps<T extends SharedState = SharedState> = {
	/**
	 * Map of event handlers keyed by event type. For typescript support, add your
	 * custom event types to the global `PayloadRegistry` interface.
	 */
	handlers?: ReceiveMessageCallback;
	/**
	 * A unique ID segment used to build `modalId`, for instance 'product-123'.
	 */
	id: string;
	/**
	 * Called when the modal is closed, after all built-in callbacks
	 */
	onHide?(): void;
	/**
	 * Called when the modal is loaded, after communication is established with the modal
	 */
	onShow?(): void;
	/**
	 * A route segment used to build `modalId`, for instance 'products'.
	 */
	route: string;
	/**
	 * Optionally pass state to share with the modal. Due to how Shopify App Bridge
	 * handles modals, this state will be requested asynchronously by the modal
	 * once it has loaded and returned as `parentState` from `useModal`.
	 *
	 * * The `loaded` state returned from `useModal` will be `false` until the modal
	 *  receives the shared state from the parent.
	 */
	sharedState?: T;
};

type StandardModalProps = {
	/**
	 * The size variant of the modal: 'small', 'base', or 'large'
	 * Due to undocumented App Bridge magic, this cannot be
	 * changed after the page has loaded, even if the modal has not
	 * been opened yet.
	 */
	variant: 'small' | 'base' | 'large';
	/**
	 * Standard title bar configuration for non-max modals
	 */
	titleBar: BaseTitleBarProps;
};

type MaxModalProps = {
	/**
	 * The size variant of the modal: 'max'. Due to undocumented
	 * App Bridge magic, this cannot be changed after the page
	 * has loaded, even if the modal has not been opened yet.
	 */
	variant: 'max';
	/**
	 * Special title bar props for max modals.
	 */
	titleBar: MaxModalTitleBarProps;
};

/**
 * Parent-side hook to manage a Shopify iframe modal with MessageChannel.
 * Re-initializes on mount, so the child can re-handshake after route re-renders.
 */
export function useModalPortal<T extends SharedState = SharedState>(args: UseModalPortalArgs<T>) {
	const { id, route, handlers, variant, onShow, onHide, titleBar, sharedState } = args;
	const [titleBarState, setTitleBarState] = useState({ ...titleBar, variant });
	const modalId = useModalId({ id, route });
	const modalRoute = useMemo(() => modalId.replaceAll('.', '/'), [id, route]);
	const shopify = useAppBridge();
	// const navigate = useNavigate();
	const open = useCallback(() => {
		void shopify.modal.show(modalId);
		// eslint-disable-next-line
	}, [modalId]);
	const close = useCallback(() => {
		void shopify.modal.hide(modalId);
		// eslint-disable-next-line
	}, [modalId]);

	const portRef = useRef<MessagePort | null>(null);
	/*const handleNavigation = React.useCallback(
		(to: string) => {
			history.pushState({}, '', to);
			navigate(to);
		},
		[navigate],
	);*/

	/**
	 * Sends a typed message from parent to child.
	 */
	const sendMessage = useCallback(
		(payload: ModalMessage) => {
			const port = portRef.current;
			if (!port) return;
			const message: ModalMessage & { modalId: string } = { modalId, ...payload };
			port.postMessage(message);
		},
		[modalId],
	);

	const defaultHandlers = useMemo<HandlersMap>(
		() => ({
			close: ({ error, message }) => {
				close();
				if (message) {
					console.log({ error: `${error}`, message });
				}
			},
			titleBarState: (payload) => {
				if (payload.variant !== 'max' && variant === 'max') {
					console.warn(`Received incorrect payload for max modal title bar. Shopify limits customization in max modal, 
      so your state updates may not be reflected. If you see this warning, check your implementation of useModal 
      and make sure you are setting the correct 'variant' value in the props.`);
				}
				setTitleBarState(payload);
			},
			requestState: () => {
				sendMessage({
					type: 'sendParentState',
					data: {
						sharedState: sharedState !== undefined ? sharedState : {},
						titleBarState: titleBarState,
					},
				});
			},
		}),
		[close, variant, setTitleBarState, titleBarState, sharedState, sendMessage],
	);

	const allHandlers = useMemo(
		() => ({ ...defaultHandlers, ...handlers }),
		[defaultHandlers, handlers],
	);

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
				const cb = allHandlers[msg.type];
				if (!cb) {
					console.warn('Unhandled message type:', msg.type, ' in modal:', modalId);
					console.log(
						'if you see this warning it means you are passing a message from your ' +
							"modal but you don't have a handler for it in your parent component",
					);
					return;
				}
				// @ts-expect-error come back to this, its fine but would prefer nicer type inference todo
				cb(msg.data);
			};

			// send initial state to port 1 (child)
			sendMessage({
				type: 'sendParentState',
				data: {
					sharedState: sharedState !== undefined ? sharedState : {},
					titleBarState: titleBarState,
				},
			});
		}

		// Listen for the child's __MODAL_CHANNEL_INIT__ event.
		window.addEventListener('message', handlePortInit);

		// teardown
		return () => {
			window.removeEventListener('message', handlePortInit);
			if (portRef.current) {
				portRef.current.onmessage = null;
				portRef.current.close();
				portRef.current = null;
			}
		};
	}, [modalId, allHandlers]);

	const onShowCB = useCallback(() => {
		if (onShow) {
			onShow();
		}
	}, [onShow]);

	const onHideCB = useCallback(() => {
		if (onHide) {
			onHide();
		}
	}, [onHide]);

	return {
		id: modalId,
		sendMessage,
		onShow: onShowCB,
		onHide: onHideCB,
		openModal: open,
		titleBar: titleBarState,
		variant,
		modalRoute,
	};
}
