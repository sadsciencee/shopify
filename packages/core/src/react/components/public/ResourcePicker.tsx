import {
  type PickerResourceType,
  type ResourceTypes,
  useResourcePicker,
  type UseResourcePickerArgs,
} from "../../hooks/public/useResourcePicker";
import { type ComponentProps, Fragment } from "react";
import {
  BlockStack,
  Box,
  Button,
  Text,
  Thumbnail,
  InlineStack,
  Divider,
} from "@shopify/polaris";
import { AppBridgeLink } from "./AppBridgeLink";
import { parseGid } from "@shopify/admin-graphql-api-utilities";
import { XCircleIcon } from "@shopify/polaris-icons";

type ResourcePickerProps<TResourceType extends PickerResourceType> = {
  button?: Omit<ComponentProps<typeof Button>, "onClick">;
  label: string;
  emptyLabel?: string;
} & UseResourcePickerArgs<TResourceType>;

type RemoveResourceCallback<T extends PickerResourceType> = ReturnType<
  typeof useResourcePicker<T>
>["remove"];

export const ResourcePicker = <TResourceType extends PickerResourceType>({
  button,
  label,
  emptyLabel,
  ...resourcePickerArgs
}: ResourcePickerProps<TResourceType>) => {
  const resourcePicker = useResourcePicker(resourcePickerArgs);
  return (
    <BlockStack gap={"200"}>
      <Button fullWidth={true} {...button} onClick={resourcePicker.open}>
        {emptyLabel && resourcePicker.selected.length === 0
          ? emptyLabel
          : label}
      </Button>
      <ResourceList
        type={resourcePickerArgs.type}
        resources={resourcePicker.selected}
        remove={resourcePicker.remove}
        variants={resourcePickerArgs?.filter?.variants ?? true}
      />
    </BlockStack>
  );
};

type ResourceListProps<T extends PickerResourceType> = {
  type: T;
  resources: ResourceTypes[T][];
  remove: RemoveResourceCallback<T>;
  variants: boolean;
};
const ResourceList = <T extends PickerResourceType>({
  resources,
  type,
  remove,
  variants,
}: ResourceListProps<T>) => {
  switch (type) {
    case "product":
      return (
        <ProductResources
          remove={remove}
          resources={resources as ResourceTypes["product"][]}
          variants={variants}
        />
      );
    case "collection":
      return (
        <CollectionResources
          remove={remove}
          resources={resources as ResourceTypes["collection"][]}
        />
      );
    case "variant":
      return (
        <VariantResources
          remove={remove}
          resources={resources as ResourceTypes["variant"][]}
        />
      );
    default:
      return null;
  }
};

type ResourceListInnerProps<T extends PickerResourceType> = {
  resources: ResourceTypes[T][];
  remove: RemoveResourceCallback<PickerResourceType>;
};

const ProductResources = ({
  resources,
  remove,
  variants,
}: ResourceListInnerProps<"product"> & { variants: boolean }) => {
  return (
    <BlockStack gap={"200"}>
      {resources.map((product) => {
        const featuredImage = product?.images[0] ?? {
          altText: "",
          id: "",
          originalSrc: "",
        };
        return (
          <Fragment key={product.id}>
            <Divider />
            <InlineStack align={"space-between"}>
              <AppBridgeLink
                style={{ color: "unset", textDecoration: "unset" }}
                to={`shopify://admin/products/${parseGid(product.id)}`}
              >
                <InlineStack key={product.id} blockAlign={"center"} gap={"200"}>
                  <Thumbnail
                    size={"small"}
                    alt={featuredImage.altText ?? ""}
                    key={featuredImage.id}
                    source={featuredImage.originalSrc}
                  />
                  <Text as={"h2"} variant={"bodyMd"} truncate={true}>
                    {product.title}
                  </Text>
                </InlineStack>
              </AppBridgeLink>
              <Button
                variant={"tertiary"}
                tone={"critical"}
                icon={XCircleIcon}
                onClick={() => {
                  remove([{ id: product.id }]);
                }}
              />
            </InlineStack>
            {product.variants.length > 0 && variants ? (
              <InlineStack>
                <Box width={"3rem"} />
                <Box width={"calc(100% - 3rem)"}>
                  <VariantResources
                    resources={product.variants}
                    remove={remove}
                    nested={true}
                  />
                </Box>
              </InlineStack>
            ) : undefined}
          </Fragment>
        );
      })}
    </BlockStack>
  );
};

const CollectionResources = ({
  resources,
  remove,
}: ResourceListInnerProps<"collection">) => {
  return (
    <BlockStack gap={"200"}>
      {resources.map((collection) => {
        const featuredImage = collection?.image ?? {
          altText: "",
          id: "",
          originalSrc: "",
        };
        return (
          <Fragment key={collection.id}>
            <Divider />
            <InlineStack align={"space-between"}>
              <AppBridgeLink
                style={{ color: "unset", textDecoration: "unset" }}
                to={`shopify://admin/collections/${parseGid(collection.id)}`}
              >
                <InlineStack
                  key={collection.id}
                  blockAlign={"center"}
                  gap={"200"}
                >
                  <Thumbnail
                    size={"small"}
                    alt={featuredImage.altText ?? ""}
                    key={featuredImage.id}
                    source={featuredImage.originalSrc}
                  />
                  <Text as={"h2"} variant={"bodyMd"} truncate={true}>
                    {collection.title}
                  </Text>
                </InlineStack>
              </AppBridgeLink>
              <Button
                variant={"tertiary"}
                tone={"critical"}
                icon={XCircleIcon}
                onClick={() => {
                  remove([{ id: collection.id }]);
                }}
              />
            </InlineStack>
          </Fragment>
        );
      })}
    </BlockStack>
  );
};

const VariantResources = ({
  resources,
  remove,
  nested,
}: ResourceListInnerProps<"variant"> & { nested?: boolean }) => {
  return (
    <BlockStack gap={"200"}>
      {resources.map((variant) => {
        const productId = variant?.product?.id ?? "";
        const featuredImage = variant?.image ?? {
          altText: "",
          id: "",
          originalSrc: "",
        };
        return (
          <Fragment key={variant.id}>
            <Divider />
            <InlineStack align={"space-between"}>
              <AppBridgeLink
                style={{ color: "unset", textDecoration: "unset" }}
                to={`shopify://admin/products/${parseGid(productId)}/variants/${parseGid(variant.id)}`}
              >
                <InlineStack blockAlign={"center"} gap={"200"}>
                  <Thumbnail
                    size={"small"}
                    alt={featuredImage.altText ?? ""}
                    key={featuredImage.id}
                    source={featuredImage.originalSrc}
                  />
                  <Text as={"h2"} variant={"bodyMd"} truncate={true}>
                    {variant.title}
                  </Text>
                </InlineStack>
              </AppBridgeLink>
              <Button
                variant={"tertiary"}
                tone={"critical"}
                icon={XCircleIcon}
                onClick={() => {
                  if (nested) {
                    remove([{ id: productId, variants: [{ id: variant.id }] }]);
                  } else {
                    remove([{ id: variant.id }]);
                  }
                }}
              />
            </InlineStack>
          </Fragment>
        );
      })}
    </BlockStack>
  );
};
