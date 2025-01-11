import { BlockStack, Box, Button, Card, Layout, Link, List, Page, Text } from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { ModalV4, useModal } from '@sadsciencee/shopify-remix/react';

export default function AdditionalPage() {
  const modal = useModal({
    id: 'something',
    route: 'hello',
  })
  const opener = <Button onClick={modal.open}>Open Modal</Button>
  return (
    <Page>
      <TitleBar title="Additional page" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="p" variant="bodyMd">
                The app template comes with an additional page which
                demonstrates how to create multiple pages within app navigation
                using{" "}
                <Link
                  url="https://shopify.dev/docs/apps/tools/app-bridge"
                  target="_blank"
                  removeUnderline
                >
                  App Bridge
                </Link>
                .
              </Text>
              <Text as="p" variant="bodyMd">
                To create your own page and have it show up in the app
                navigation, add a page inside <Code>app/routes</Code>, and a
                link to it in the <Code>&lt;NavMenu&gt;</Code> component found
                in <Code>app/routes/app.jsx</Code>.
              </Text>
              <Box>
                {opener}
                <ModalV4 id={modal.id} variant='base'>
                  <TitleBar title="Products">
                    <button
                      variant="primary"
                      tone="critical"
                      onClick={() => console.log('Deleting')}
                    >
                      Delete
                    </button>
                    <button onClick={() => console.log('Cancelling')}>Cancel</button>
                  </TitleBar>

                </ModalV4>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                Resources
              </Text>
              <List>
                <List.Item>
                  <Link
                    url="https://shopify.dev/docs/apps/design-guidelines/navigation#app-nav"
                    target="_blank"
                    removeUnderline
                  >
                    App nav best practices
                  </Link>
                </List.Item>
              </List>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <Box
      as="span"
      padding="025"
      paddingInlineStart="100"
      paddingInlineEnd="100"
      background="bg-surface-active"
      borderWidth="025"
      borderColor="border"
      borderRadius="100"
    >
      <code>{children}</code>
    </Box>
  );
}
