import { useId, useMemo } from 'react';
import { type UseModalParentArgs } from '../public/useModalParent';
import { type UseModalArgs } from '../public/useModal';

const AUTO_MODAL_ARG = 'auto';
type ModalId = `modal.${string}.${string}`;

export function useModalId(args: UseModalParentArgs | UseModalArgs): ModalId {
	const reactId = useId();
	const modalId = useMemo(() => {
		const id = args.id.toLowerCase() === AUTO_MODAL_ARG ? reactId: args.id;
		return `modal.${args.route}.${id}` satisfies ModalId;
	}, [args.id, args.route]);
	return modalId;
}
