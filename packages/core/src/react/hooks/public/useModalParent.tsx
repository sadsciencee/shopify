import { useCallback } from 'react';
import { type PayloadData, type PayloadKey, type Message } from '../../../shared/modal';
import { useModalId } from '../private/useModalId';
import { useMessageHandler } from '../private/useMessageHandler';

export type UseModalParentArgs = {
	id: string;
	route: string;
	handlers?: {
		[K in PayloadKey]?: (data: PayloadData<K>) => void;
	};
}

export function useModalParent(args: UseModalParentArgs) {
	const modalId = useModalId(args);
	useMessageHandler(modalId, args.handlers);


	const sendMessage = useCallback(<K extends PayloadKey>(
		type: K,
		data: PayloadData<K>
	): void => {
		const iframe = document.getElementById(modalId);
		if (iframe instanceof HTMLIFrameElement) {
			const message: Message<K> = {
				type,
				modalId,
				data
			};
			iframe.contentWindow?.postMessage(message, location.origin);
		}
	}, [modalId]);

	return {
		id: modalId,
		sendMessage,
	};
}
