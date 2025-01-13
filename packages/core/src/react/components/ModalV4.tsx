import { forwardRef } from 'react';
import { Modal as ShopifyModal } from '@shopify/app-bridge-react';
import { type ModalV4Props, useModalPortal } from '../hooks/public/useModalPortal';
import { MaxModalTitleBar } from './MaxModalTitleBar';

/**
 * A managed implementation of the Shopify App Bridge `ui-modal` element, with
 * support for passing messages between the parent page and the modal.
 */
export const ModalV4 = forwardRef<UIModalElement, ModalV4Props>(
	({ opener: Opener, ...hookArgs }, ref) => {
		const { id, sendMessage, onShow, openModal, variant, titleBar, onHide } =
			useModalPortal(hookArgs);
		return (
			<>
				<Opener
					onClick={(e) => {
						// prevent accidental form submission bc react bois dont know about type="button"
						if (e?.preventDefault?.()) {
							e.preventDefault();
						}
						openModal();
					}}
				/>
				<ShopifyModal ref={ref} id={id} variant={variant} onShow={onShow} onHide={onHide}>
					<MaxModalTitleBar {...titleBar} sendMessage={sendMessage} />
				</ShopifyModal>
			</>
		);
	},
);
ModalV4.displayName = 'ModalV4';
