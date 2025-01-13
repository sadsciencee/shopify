import { useEffect, useRef, useCallback, useState, useMemo, type ComponentType } from 'react';
import type {
	PayloadKey,
	PayloadData,
	ModalMessage,
	BaseTitleBarProps,
	MaxModalTitleBarProps, MessageCallback
} from '../../../shared/modal';
import { useModalId } from '../private/useModalId';
import { useAppBridge } from '@shopify/app-bridge-react';
import { useNavigate } from '@remix-run/react';

/**
 * Type mapping of event keys to callback functions, strongly typed from your `PayloadRegistry`.
 */
export type HandlersMap = {
	[K in PayloadKey]?: (data: PayloadData<K>) => void;
};

export type UseModalPortalArgs = BaseModalProps & (StandardModalProps | MaxModalProps);
export type ModalV4Props = UseModalPortalArgs & {
	opener: ComponentType<{ onClick: (e?: React.MouseEvent) => void }>
}

type BaseModalProps = {
	/**
	 * A unique ID segment used to build `modalId`, for instance 'product-123'.
	 */
	id: string;
	/**
	 * A route segment used to build `modalId`, for instance 'products'.
	 */
	route: string;
	/**
	 * Map of event handlers keyed by event type. For typescript support, add your
	 * custom event types to the global `PayloadRegistry` interface.
	 */
	handlers?: HandlersMap;
	/**
	 * Called when the modal is loaded, after communication is established with the modal
	 */
	onShow?(): void;
	/**
	 * Called when the modal is closed, after all built-in callbacks
	 */
	onHide?(): void;
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
export function useModalPortal(args: UseModalPortalArgs) {
	const { id, route, handlers, variant, onShow, onHide, titleBar } = args;
	const [titleBarState, setTitleBarState] = useState(titleBar);
	const modalId = useModalId({ id, route });
	const shopify = useAppBridge();
	const navigate = useNavigate();
	const open = useCallback(() => {
		void shopify.modal.show(modalId);
		// eslint-disable-next-line
	}, [modalId]);
	const close = useCallback(() => {
		void shopify.modal.hide(modalId);
		// eslint-disable-next-line
	}, [modalId]);

	const handleNavigation = React.useCallback(
		(to: string) => {
			history.pushState({}, '', to);
			navigate(to);
		},
		[navigate],
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
		}),
		[close, variant, setTitleBarState],
	);

	const allHandlers = useMemo(
		() => ({ ...defaultHandlers, ...handlers }),
		[defaultHandlers, handlers],
	);

	/**
	 * Recreate the channel on each mount; if the parent unmounts/remounts,
	 * a new channel is established.
	 */
	const channelRef = useRef<MessageChannel | null>(null);
	useEffect(() => {
		channelRef.current = new MessageChannel();

		const { port1, port2 } = channelRef.current;

		function handlePortMessage(event: MessageEvent<ModalMessage>) {
			const msg = event.data
			if (msg.modalId !== modalId) return;
			allHandlers?.[msg.type]?.(msg.data);
		}

		port1.onmessage = handlePortMessage;

		return () => {
			port1.onmessage = null;
			port1.close();
			port2.close();
			channelRef.current = null;
		};
	}, [modalId, handlers]);

	/**
	 * Sends a typed message from parent to child.
	 */
	const sendMessage: MessageCallback = useCallback(
		(type, data) => {
			const channel = channelRef.current;
			if (!channel) return;
			const message = { type, modalId, data };
			channel.port1.postMessage(message);
		},
		[modalId],
	);

	/**
	 * Transfers `port2` to the child.
	 */
	const attachPortToModal = useCallback(() => {
		const iframe = document.getElementById(modalId) as HTMLIFrameElement | null;
		if (!iframe || !channelRef.current) return;
		iframe.contentWindow?.postMessage(
			{ type: '__MODAL_CHANNEL_INIT__', modalId },
			window.location.origin,
			[channelRef.current.port2],
		);
	}, [modalId]);

	const onShowCB = useCallback(() => {
		attachPortToModal();
		if (onShow) {
			onShow();
		}
	}, [attachPortToModal, onShow]);

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
	};
}
