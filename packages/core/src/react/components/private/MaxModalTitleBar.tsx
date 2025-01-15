import { type MaxModalTitleBarProps, type SendMessageCallback } from '../../../shared/modal';
import { useCallback } from 'react';

export const MaxModalTitleBar = ({
	primaryButton,
	secondaryButton,
	sendMessage,
}: MaxModalTitleBarProps & { sendMessage: SendMessageCallback }) => {
	return (
		<>
			<Button button={secondaryButton} variant={'secondary'} sendMessage={sendMessage} />
			<Button button={primaryButton} variant={'primary'} sendMessage={sendMessage} />
		</>
	);
};

const Button = ({
	button,
	sendMessage,
	variant,
}: {
	button?: MaxModalTitleBarProps['primaryButton'];
	sendMessage: SendMessageCallback;
	variant: 'primary' | 'secondary';
}) => {
	const onClickCB = useCallback(() => {
		console.log('im so clicked')
		sendMessage({
			type: 'titleBarAction',
			data: { action: variant },
		});
	}, [sendMessage, variant]);
	if (!button) return <></>;
	return (
		// eslint-disable-next-line react/no-unknown-property
		<button type={'button'} disabled={button.disabled} onClick={onClickCB} variant="primary">
			{button.label}
		</button>
	);
};
