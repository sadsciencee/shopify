import { useEffect, useMemo, useRef } from 'react';
import { Modal, type TitleBar } from "@shopify/app-bridge-react";


type ModalV4Props = {
	id: string
	variant: 'small' | 'base' | 'large' | 'max';
	children?: JSX.Element & {
		type: typeof TitleBar;
	};
}
export const ModalV4 = (
	{id, variant, children}: ModalV4Props
) => {
	const src = useMemo(() => {
			return id.replaceAll('.','/')
	}, [id]);
	const modalRef = useRef<UIModalElement>(null);
	useEffect(() => {
		if (modalRef) {
			console.log('modal element is', modalRef);
		}
	}, [modalRef]);
	return <Modal ref={modalRef} src={src} id={id} variant={variant}>
		{children}
	</Modal>
}
