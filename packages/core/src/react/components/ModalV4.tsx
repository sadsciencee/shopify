import { forwardRef } from 'react';
import { Modal as ShopifyModal, TitleBar } from '@shopify/app-bridge-react';
import { type ModalV4Props, useModal } from '../hooks/public/useModal';
import { MaxModalTitleBar } from './MaxModalTitleBar';

/**
 * A managed implementation of the Shopify App Bridge `ui-modal` element, with
 * support for passing messages between the parent page and the modal.
 */
export const ModalV4 = forwardRef<UIModalElement, ModalV4Props>(
	({ opener: Opener, ...hookArgs }, ref) => {
		const { id, sendMessage, onShow, openModal, variant, titleBar, onHide, modalRoute } =
			useModal(hookArgs);
		return (
			<>
				{Opener({
					onClick: (e) => {
						// prevent accidental form submission
						if (e?.preventDefault?.()) {
							e.preventDefault();
						}
						openModal();
					},
				})}
				<ShopifyModal
					src={modalRoute}
					ref={ref}
					id={id}
					variant={variant}
					onShow={onShow}
					onHide={onHide}
				>
					<TitleBar title={titleBar.title}>
						<MaxModalTitleBar {...titleBar} sendMessage={sendMessage} />
					</TitleBar>
				</ShopifyModal>
			</>
		);
	},
);
ModalV4.displayName = 'ModalV4';
