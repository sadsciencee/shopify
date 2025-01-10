import { Card, Text, Layout } from "@shopify/polaris";

export function FilePickerComponent() {

    return (
        <Layout>
            <Layout.Section>
                <Card>
                    <Text as="h2" variant="headingMd">
                        File Picker Test
                    </Text>
                    <Text as="p">
                        Query:
                    </Text>
                    <Text as="p">
                        Timestamp:
                    </Text>
                </Card>
            </Layout.Section>
        </Layout>
    );
}
