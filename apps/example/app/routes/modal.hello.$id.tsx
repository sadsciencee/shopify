import {
	BlockStack,
	Box,
	Button,
	Card,
	InlineStack,
	Layout,
	Link,
	List,
	Page,
	Text,
} from '@shopify/polaris';
import { useParent } from '@sadsciencee/shopify/react';
import { useCallback, useEffect } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { authenticate } from '../shopify.server';

export const action = async ({ request }: ActionFunctionArgs) => {
	const { admin } = await authenticate.admin(request);
	const color = ['Red', 'Orange', 'Yellow', 'Green'][Math.floor(Math.random() * 4)];
	const response = await admin.graphql(
		`#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
		{
			variables: {
				product: {
					title: `${color} Snowboard`,
				},
			},
		},
	);
	const responseJson = await response.json();

	const product = responseJson.data!.productCreate!.product!;
	const variantId = product.variants.edges[0]!.node!.id!;

	const variantResponse = await admin.graphql(
		`#graphql
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
		{
			variables: {
				productId: product.id,
				variants: [{ id: variantId, price: '100.00' }],
			},
		},
	);

	const variantResponseJson = await variantResponse.json();

	return {
		product: responseJson!.data!.productCreate!.product,
		variant: variantResponseJson!.data!.productVariantsBulkUpdate!.productVariants,
	};
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const id = params.id ?? 'auto';
	return { id };
};

export default function AdditionalPage() {
	/**
	 * `useFetcher` and `useLoaderData` are remix apis. if you are using something like react-query (sorry...tanstack-query)
	 * you would replace these with the relevant useQuery and useMutation
	 */
	const fetcher = useFetcher<typeof action>();
	const loaderData = useLoaderData<typeof loader>();
	const generateProduct = useCallback(() => fetcher.submit({}, { method: 'POST' }), []);
	/**
	 * Pass in callbacks `onPrimaryAction` and `onSecondaryAction` so you can respond to
	 * clicks from the buttons in the modal wrapper.
	 */
	const onPrimaryAction = useCallback(() => {
		generateProduct();
	}, [generateProduct]);
	const onSecondaryAction = useCallback(() => {
		console.log('Secondary Button Clicked');
	}, []);
	/**
	 * `useParent` will return the following object which you can use to interact with the parent
	 */
	const {
		/**
		 * Send a message to the parent frame.
		 * @example sendMessage({ userEmail: 'david@ucoastweb.com' });
		 */
		sendMessage,
		/**
		 * The initial state of the parent frame, at the time the modal was loaded.
		 */
		parentState,
		/**
		 * The initial state of the title bar in the parent frame, at the time the modal was loaded.
		 */
		titleBarState,
		/**
		 * Modify the title bar in the parent frame.
		 * @example updateTitleBar({
		 *    title: 'Create Product',
		 * 		primaryButton: { label: 'Save', disabled: false },
		 * 		secondaryButton: { label: 'Reset', disabled: false }
		 * 	});
		 *
		 * You only have to pass the values you want to change. To disable the primary button, pass `disabled: true`.
		 * @example updateTitleBar({ primaryButton: { disabled: true } });
		 *
		 * To hide an existing button, pass `null`.
		 * @example updateTitleBar({ primaryButton: null });
		 */
		updateTitleBar,
		loaded,
	} = useParent({
		id: loaderData.id,
		route: 'hello',
		onPrimaryAction,
		onSecondaryAction,
	});

	// This part is remix-specific

	const isLoading =
		['loading', 'submitting'].includes(fetcher.state) && fetcher.formMethod === 'POST';
	const productId = fetcher.data?.product?.id.replace('gid://shopify/Product/', '');

	/**
	 * Example: Disabling Navbar Buttons During Loading
	 *
	 * This demonstrates temporarily disabling a navbar button during a form submission.
	 *
	 */

	useEffect(() => {
		if (isLoading) {
			updateTitleBar({
				title: 'Creating Product...',
				primaryButton: { label: 'Creating...', disabled: true },
			});
			return;
		}
		if (productId) {
      console.log('got product id', productId);
			updateTitleBar({
				title: 'Products',
				primaryButton: { label: 'Generate a product', disabled: false },
			});
			return;
		}
	}, [isLoading, productId]);

	/**
	 * Example: Using shared state from the parent
	 *
	 * once the modal is initialized, you will receive any
	 * shared state passed from the parent
	 *
	 * For Typescript support, pass the expected parentState
	 * type in to useParent as the first type argument
	 *
	 * @example: useParent<{ howdy: "partner" }>({ id: 'auto', route: 'hello' })
	 *
	 */

	const parentStateComponent =
		parentState && loaded ? (
			<Card>
				<Text as={'h3'} variant={'headingMd'}>
					Woah There
				</Text>
				<Text as={'p'} variant={'bodyMd'}>
					{parentState.howdy}
				</Text>
			</Card>
		) : undefined;

	/**
	 * Example: send custom messages back to the parent
	 *
	 * This lib has some built in messages to make things easier but
	 * at the end of the day, sometimes you gotta pass state around
	 *
	 */

	const sendCustomMessage = useCallback(() => {
		sendMessage({ customMessage: 'hey there' });
	}, [sendMessage]);


  useEffect(() => {
    console.log('on initial mount only')
  }, []);

	return (
		<Page>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    The most beautiful modal in the world 🎉
                  </Text>
                </BlockStack>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    Click the button to generate a product
                  </Text>
                </BlockStack>
                <InlineStack gap="300">
                  <Button loading={isLoading} onClick={generateProduct}>
                    Generate a product
                  </Button>
                  {fetcher.data?.product && (
                    <Button
                      url={`shopify:admin/products/${productId}`}
                      target="_blank"
                      variant="plain"
                    >
                      View product
                    </Button>
                  )}
                </InlineStack>
                {fetcher.data?.product && (
                  <>
                    <Text as="h3" variant="headingMd">
                      {' '}
                      productCreate mutation
                    </Text>
                    <Box
                      padding="400"
                      background="bg-surface-active"
                      borderWidth="025"
                      borderRadius="200"
                      borderColor="border"
                      overflowX="scroll"
                    >
													<pre style={{ margin: 0 }}>
														<code>{JSON.stringify(fetcher.data.product, null, 2)}</code>
													</pre>
                    </Box>
                    <Text as="h3" variant="headingMd">
                      {' '}
                      productVariantsBulkUpdate mutation
                    </Text>
                    <Box
                      padding="400"
                      background="bg-surface-active"
                      borderWidth="025"
                      borderRadius="200"
                      borderColor="border"
                      overflowX="scroll"
                    >
													<pre style={{ margin: 0 }}>
														<code>{JSON.stringify(fetcher.data.variant, null, 2)}</code>
													</pre>
                    </Box>
                  </>
                )}
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Custom Messages
                  </Text>
                </BlockStack>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    You can send custom messages to the parent to pass form values
                    and other things
                  </Text>
                </BlockStack>
                <InlineStack gap="300">
                  <Button onClick={sendCustomMessage}>
                    Send a message
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
            {parentStateComponent}
          </BlockStack>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  App template specs
                </Text>
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      Framework
                    </Text>
                    <Link url="https://remix.run" target="_blank" removeUnderline>
                      Remix
                    </Link>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      Database
                    </Text>
                    <Link url="https://www.prisma.io/" target="_blank" removeUnderline>
                      Prisma
                    </Link>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      Interface
                    </Text>
                    <span>
													<Link url="https://polaris.shopify.com" target="_blank" removeUnderline>
														Polaris
													</Link>
                      {', '}
                      <Link
                        url="https://shopify.dev/docs/apps/tools/app-bridge"
                        target="_blank"
                        removeUnderline
                      >
														App Bridge
													</Link>
												</span>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      API
                    </Text>
                    <Link
                      url="https://shopify.dev/docs/api/admin-graphql"
                      target="_blank"
                      removeUnderline
                    >
                      GraphQL API
                    </Link>
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Next steps
                </Text>
                <List>
                  <List.Item>
                    Build an{' '}
                    <Link
                      url="https://shopify.dev/docs/apps/getting-started/build-app-example"
                      target="_blank"
                      removeUnderline
                    >
                      {' '}
                      example app
                    </Link>{' '}
                    to get started
                  </List.Item>
                  <List.Item>
                    Explore Shopify’s API with{' '}
                    <Link
                      url="https://shopify.dev/docs/apps/tools/graphiql-admin-api"
                      target="_blank"
                      removeUnderline
                    >
                      GraphiQL
                    </Link>
                  </List.Item>
                </List>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
		</Page>
	);
}
