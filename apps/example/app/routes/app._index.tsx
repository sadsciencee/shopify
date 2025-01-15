import type { LoaderFunctionArgs } from '@remix-run/node';
import { Page, Layout, Text, Card, Button, BlockStack, Box } from '@shopify/polaris';
import { TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { authenticate } from '../shopify.server';
import { ModalV4, type ModalMessageHandler } from '@sadsciencee/shopify/react';
import { useCallback } from 'react';

export const loader = async ({ request }: LoaderFunctionArgs) => {
	await authenticate.admin(request);

	return null;
};

export default function Index() {
	const shopify = useAppBridge();
  const onMessage = useCallback<ModalMessageHandler<{ customMessage: string }>>(
    (data, controls) => {
      // data is now typed as { customMessage: string }
      // controls has ModalControls type
      console.log(data.customMessage);
      // you can send a reply back to the modal with controls.reply()
      controls.reply({ customMessage: 'Hello from the app' });
      // best to do toasts from the parent as well
      shopify.toast.show(data.customMessage)
    },
    [shopify]
  );

	/*
	 * for non-ts users, just replace `useCallback<ModalMessageHandler<{ customMessage: string }>>`
	 * with `useCallback`
	 */

	return (
		<Page>
			<TitleBar title="Remix app template">
				{/*<button variant="primary" onClick={generateProduct}>
					Generate a product
				</button>*/}
			</TitleBar>
			<BlockStack gap="500">
				<Box></Box>
				<Layout>
					<Layout.Section>
						<Card>
							<BlockStack gap="500">
								<BlockStack gap="200">
									<Text as="h2" variant="headingMd">
										Click the button to open the modal
									</Text>
								</BlockStack>
								<ModalV4
									titleBar={{
										title: 'Products',
										primaryButton: {
											label: 'Generate a product',
											disabled: false,
										},
									}}
									id={'auto'}
									route={'hello'}
									variant="max"
									opener={({ onClick }) => <Button onClick={onClick}>Open Modal</Button>}
									sharedState={{
										howdy: 'partner',
									}}
                  onMessage={onMessage}
								/>
							</BlockStack>
						</Card>
					</Layout.Section>
					<Layout.Section variant="oneThird">
						<BlockStack gap="500">
							<Card>
								<BlockStack gap="200">
									<Text as="h2" variant="headingMd">
										You get it.
									</Text>
								</BlockStack>
							</Card>
						</BlockStack>
					</Layout.Section>
				</Layout>
			</BlockStack>
		</Page>
	);
}
