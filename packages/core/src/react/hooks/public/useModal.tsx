import React, { useCallback } from 'react';
import type { Message, PayloadData, PayloadKey } from '../../../shared/modal';
import { useMessageHandler } from '../private/useMessageHandler';
import { useModalId } from '../private/useModalId';
import { useAppBridge } from '@shopify/app-bridge-react';
import { useNavigate } from '@remix-run/react';


export type UseModalArgs = {
	/** Modal identifier
	 * @default 'Auto' for new/unrelated resources
	 */
	id: string;
	/** Route segment
	 * @example 'products' for modal.products.$id
	 */
	route: string;
	/** Callbacks
	 * @example { close: () => void }
	 */
	handlers?: {
		[K in PayloadKey]?: (data: PayloadData<K>) => void;
	};
}


export function useModal(args: UseModalArgs) {
	const shopify = useAppBridge();
	const navigate = useNavigate();
	const modalId = useModalId(args);
	useMessageHandler(modalId, args.handlers);
	const open = useCallback(() => {
		void shopify.modal.show(modalId);
	}, [modalId]);

	const handleNavigation = React.useCallback(
		(to: string) => {
			history.pushState({}, '', to);
			navigate(to);
		},
		[navigate]
	);

	const sendMessage = useCallback(<K extends PayloadKey>(
		type: K,
		data: PayloadData<K>
	): void => {
		const message: Message<K> = {
			type,
			modalId,
			data
		};
		window.opener?.postMessage(message, location.origin);
	}, [modalId]);

	return {
		id: modalId,
		sendMessage,
		open,
	};
}
