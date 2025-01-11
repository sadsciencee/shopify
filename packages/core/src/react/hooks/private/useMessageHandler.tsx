import type { PayloadData, PayloadKey, Message } from '../../../shared/modal';
import { useEffect } from 'react';

export function useMessageHandler(modalId: string, handlers?: {
	[K in PayloadKey]?: (data: PayloadData<K>) => void;
}) {
	useEffect(() => {
		function handleMessage<K extends PayloadKey>(event: MessageEvent<Message<K>>) {
			const { data } = event;
			if (data.modalId !== modalId) return;
			handlers?.[data.type]?.(data.data);
		}

		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	}, [modalId, handlers]);
}
