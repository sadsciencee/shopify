import { TitleBar } from '@shopify/app-bridge-react';
import { type MaxModalTitleBarProps, type MessageCallback } from '../../shared/modal';
import { useCallback } from 'react';

export const MaxModalTitleBar = ({
	title,
	primaryButton,
	secondaryButton,
	sendMessage,
}: MaxModalTitleBarProps & { sendMessage: MessageCallback }) => {
	return (
		<TitleBar title={title}>
			<Button button={secondaryButton} variant={'secondary'} sendMessage={sendMessage} />
			<Button button={primaryButton} variant={'primary'} sendMessage={sendMessage} />
		</TitleBar>
	);
};

const Button = ({
	button,
	sendMessage,
	variant,
}: {
	button?: MaxModalTitleBarProps['primaryButton'];
	sendMessage: MessageCallback;
	variant: 'primary' | 'secondary';
}) => {
	const onClickCB = useCallback(() => {
		sendMessage('titleBarAction', { action: variant });
	}, [sendMessage, variant]);
	if (!button) return <></>;
	return (
		// eslint-disable-next-line react/no-unknown-property
		<button type={'button'} disabled={button.disabled} onClick={onClickCB} variant="primary">
			{button.label}
		</button>
	);
};
