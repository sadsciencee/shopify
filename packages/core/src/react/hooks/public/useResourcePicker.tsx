import { useCallback, useEffect, useState } from "react";
import { directAccess } from "./useDirectAccess";
import { getMultipleCollectionsQuery } from "../../../graphql/GetMultipleCollections";
import { getMultipleProductsQuery } from "../../../graphql/GetMultipleProducts";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getMultipleVariantsQuery } from "../../../graphql/GetMultipleVariants";
import {
  type GetMultipleProductsQuery,
  type GetMultipleCollectionsQuery,
  type GetMultipleVariantsQuery,
} from "../../../graphql/types";
import { type ResultAsync } from "../../../shared/result";
import { filterMap } from '../../../shared/util';

enum ProductVariantInventoryManagement {
  Shopify = "SHOPIFY",
  NotManaged = "NOT_MANAGED",
  FulfillmentService = "FULFILLMENT_SERVICE",
}

enum ProductVariantInventoryPolicy {
  Deny = "DENY",
  Continue = "CONTINUE",
}

enum FulfillmentServiceType {
  GiftCard = "GIFT_CARD",
  Manual = "MANUAL",
  ThirdParty = "THIRD_PARTY",
}

enum WeightUnit {
  Kilograms = "KILOGRAMS",
  Grams = "GRAMS",
  Pounds = "POUNDS",
  Ounces = "OUNCES",
}

export type UseResourcePickerArgs<TResourceType extends PickerResourceType> = {
  /**
   * The type of resource you want to pick.
   */
  type: TResourceType;

  /** Callback when resources are selected */
  onSelect(resources: ResourceTypes[TResourceType][]): void;
  /**
   * Whether to allow selecting multiple items of a specific type or not. If a number is provided, then limit the selections
   * to a maximum of that number of items. When type is Product, the user may still select multiple variants of a single
   * product, even if multiple is false.
   * @default false
   */
  multiple?: boolean | number;
  /**
   * The action verb appears in the title and as the primary action of the Resource Picker.
   * @default 'add'
   */
  action?: "add" | "select";
  // Resources that should be preselected when the picker is opened.
  initialSelectionIds?: BaseResource[];
  /**
   * Filters for what resource to show.
   */
  filter?: {
    /**
     * Whether to show {@link https://help.shopify.com/en/manual/products/details?shpxid=f04b3485-33B6-4E3F-9A2E-7008B2AEE3A0#product-availability archived products}.
     * Setting this to undefined will show a badge on draft products.
     * @default true
     */
    archived?: boolean;

    /**
     * Whether to show {@link https://help.shopify.com/en/manual/products/details?shpxid=f04b3485-33B6-4E3F-9A2E-7008B2AEE3A0#product-availability draft products}. Only applies to the Product resource type picker.
     * Setting this to undefined will show a badge on draft products.
     * @default true
     */
    draft?: boolean;

    /**
     * Whether to show hidden resources, referring to products that are not published on any sales channels.
     * @default true
     */
    hidden?: boolean;

    /**
     * GraphQL initial search query for filtering resources available in the picker.
     * See {@link https://shopify.dev/docs/api/usage/search-syntax search syntax} for more information. This is not displayed in the search bar when the picker is opened.
     * @default ''
     */
    query?: string;

    /**
     * Whether to show product variants. Only applies to the Product resource type picker.
     * @default true
     */
    variants?: boolean;
  };
};

export function useResourcePicker<TResourceType extends PickerResourceType>({
  initialSelectionIds,
  type,
  onSelect,
  multiple,
  filter,
  action,
}: UseResourcePickerArgs<TResourceType>): {
  open: () => void;
  remove: (idsToRemove: BaseResource[]) => void;
  selectedIds: BaseResource[];
  loading: boolean;
  selected: ResourceTypes[TResourceType][];
} {
  const shopify = useAppBridge();
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ResourceTypes[TResourceType][]>([]);
  const [selectedIds, setSelectedIds] = useState<BaseResource[]>(
    initialSelectionIds ?? [],
  );
  useEffect(() => {
    if (!initialSelectionIds || !initialSelectionIds.length) return;
    if (!loading) return;
    fetchResources(type, initialSelectionIds)
      .then((result) => {
        if (!result.success) {
          console.error(result.error);
          setLoading(false);
          return;
        }
        const newSelectedIds = result.value.map((resource) => ({
          id: resource.id,
        }));
        setSelectedIds(newSelectedIds);
        setSelected(result.value);
        //console.log("selected", result.value);
        if (onSelect !== undefined) {
          onSelect(result.value);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [initialSelectionIds, type, loading]);

  const open = useCallback(() => {
    shopify
      .resourcePicker({
        type,
        filter,
        multiple,
        action,
        selectionIds: selectedIds,
      })
      .then((result) => {
        if (!result) {
          return;
        }
        // @ts-ignore
        setSelected(result);
        if (onSelect !== undefined) {
          // @ts-ignore
          onSelect(result);
        }
        // @ts-ignore
        const selectedIds = result.map(resourceToBaseResource);
        setSelectedIds(selectedIds);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [
    filter?.archived,
    filter?.draft,
    filter?.hidden,
    filter?.variants,
    filter?.query,
    multiple,
    action,
    type,
    selectedIds,
    onSelect,
  ]);

  const remove = useCallback(
    (idsToRemove: BaseResource[]) => {
      const topLevelIds = idsToRemove.map(({ id }) => id);
      const newSelected = filterMap(selected, (resource) => {
        if (!topLevelIds.includes(resource.id)) return resource;
        if (type !== "product" || !("variants" in resource)) return null;
        if (!resource?.variants.length) return null;
        const variants = idsToRemove.find(
          ({ id }) => id === resource.id,
        )?.variants;
        if (!variants) return null;
        const removeVariantIds = variants.map(({ id }) => id);
        const currentVariants = resource.variants.filter(
          ({ id }) => id && !removeVariantIds.includes(id),
        );
        if (!currentVariants.length) return null;
        return { ...resource, variants: currentVariants };
      });
      const newSelectedIds = filterMap(newSelected, (resource) => {
        if (type !== "product") return { id: resource.id };
        if (!("variants" in resource)) return { id: resource.id };
        return {
          id: resource.id,
          variants: filterMap(resource.variants, ({ id }) => {
            if (!id) return null;
            return { id };
          }),
        };
      });
      setSelected(newSelected);
      setSelectedIds(newSelectedIds);
      if (onSelect !== undefined) {
        onSelect(newSelected);
      }
    },
    [selected, type],
  );

  return {
    open,
    remove,
    selectedIds,
    loading,
    selected,
  };
}

async function fetchResources<TResourceType extends PickerResourceType>(
  type: TResourceType,
  resources: BaseResource[],
): ResultAsync<ResourceTypes[TResourceType][]> {
  switch (type) {
    case "product":
      // @ts-ignore
      return await fetchProducts(resources);
    case "collection":
      // @ts-ignore
      return await fetchCollections(resources);
    case "variant":
      // @ts-ignore
      return await fetchVariants(resources);
    default:
      return {
        success: false,
        error: new Error(`Invalid resource type: ${type}`),
        input: resources,
      };
  }
}

// fetchProducts
async function fetchProducts(
  ids: BaseResource[],
): ResultAsync<ResourceTypes["product"][]> {
  if (ids.length === 0) {
    return { success: true, value: [] };
  }
  const [productsRes, variantsRes] = await Promise.all([
    directAccess<GetMultipleProductsQuery>({
      query: getMultipleProductsQuery,
      variables: { ids: ids.map(({ id }) => id) },
    }),
    fetchVariants(
      filterMap(ids, (resource) => {
        if (!resource?.variants || !resource.variants.length) return null;
        return resource.variants;
      }).flat(),
    ),
  ]);
  if (!productsRes.success) {
    return productsRes;
  }
  if (!variantsRes.success) {
    return variantsRes;
  }
  const products = filterMap(productsRes.value.nodes, (node) => node);
  const variants = variantsRes.value;
  const productsWithVariants = products.map((product) => {
    const productVariants = variants.filter(
      (variant) => variant.product.id === product.id,
    );
    return { ...product, variants: productVariants };
  });
  return {
    success: true,
    value: productsWithVariants.map((product) => ({
      availablePublicationCount: product.availablePublicationsCount?.count ?? 0,
      createdAt: product.createdAt ?? "",
      descriptionHtml: product.descriptionHtml ?? "",
      handle: product.handle ?? "",
      hasOnlyDefaultVariant: product?.hasOnlyDefaultVariant ?? false,
      id: product.id ?? "",
      images: filterMap(product.media?.edges, ({ node }) => {
        switch (node.__typename) {
          case "MediaImage":
            return {
              id: node.id ?? "",
              altText: node.alt ?? "",
              originalSrc: node.image?.url ?? "",
            };
          case "Video":
            return {
              id: node.id ?? "",
              altText: node.alt ?? "",
              originalSrc: node.preview?.image?.url ?? "",
            };
          default:
            return null;
        }
      }),
      options: product.options.map((option) => ({
        id: option?.id ?? "",
        name: option?.name ?? "",
        position: option?.position ?? 0,
        values: option?.values ?? [],
      })),
      productType: product.productType ?? "",
      status: product.status ?? "DRAFT",
      tags: product.tags ?? [],
      title: product.title ?? "",
      totalInventory: product.totalInventory ?? 0,
      totalVariants: product.variantsCount?.count ?? 0,
      tracksInventory: product.tracksInventory ?? false,
      updatedAt: product.updatedAt ?? "",
      variants,
      vendor: product.vendor ?? "",
      publishedAt: product.publishedAt ?? null,
      templateSuffix: product.templateSuffix ?? null,
    })),
  };
}

// fetchVariants
async function fetchVariants(
  ids: BaseResource[],
): ResultAsync<ProductVariant[]> {
  if (ids.length === 0) {
    return { success: true, value: [] };
  }
  const res = await directAccess<GetMultipleVariantsQuery>({
    query: getMultipleVariantsQuery,
    variables: { ids: ids.map(({ id }) => id) },
  });
  if (!res.success) return res;
  const variants = filterMap(res.value.nodes, (node) => node);
  return {
    success: true,
    value: variants.map(mapApiVariantToResourcePickerVariant),
  };
}

function mapApiVariantToResourcePickerVariant(
  variant: NonNullable<GetMultipleVariantsQuery["nodes"][0]>,
): ProductVariant {
  const fulfillmentService =
    variant.inventoryItem.inventoryLevels.edges[0].node?.location
      ?.fulfillmentService;
  return {
    availableForSale: variant.availableForSale,
    createdAt: variant.createdAt,
    displayName: variant.displayName,
    id: variant.id,
    inventoryItem: { id: variant.inventoryItem.id },
    inventoryManagement: extractInventoryManagementValue(
      fulfillmentService?.inventoryManagement,
    ),
    inventoryPolicy: variant.inventoryPolicy,
    inventoryQuantity: variant.inventoryQuantity ?? 0,
    position: variant.position,
    price: variant.price,
    product: { id: variant.product.id },
    requiresShipping: variant.inventoryItem.requiresShipping,
    selectedOptions: variant.selectedOptions,
    taxable: variant.taxable,
    title: variant.title,
    updatedAt: variant.updatedAt,
    weightUnit:
      variant.inventoryItem.measurement?.weight?.unit ?? WeightUnit.Pounds,
    barcode: variant.barcode ?? null,
    compareAtPrice: variant.compareAtPrice ?? null,
    fulfillmentService: fulfillmentService
      ? {
          id: fulfillmentService.id,
          inventoryManagement: fulfillmentService.inventoryManagement,
          productBased:
            fulfillmentService.type === FulfillmentServiceType.Manual,
          serviceName: fulfillmentService.serviceName,
          type: fulfillmentService.type,
        }
      : undefined,
  };
}

function extractInventoryManagementValue(
  value: boolean | undefined,
): ProductVariantInventoryManagement {
  if (value === undefined) return ProductVariantInventoryManagement.NotManaged;
  return value
    ? ProductVariantInventoryManagement.FulfillmentService
    : ProductVariantInventoryManagement.Shopify;
}

// fetchCollections
async function fetchCollections(
  ids: BaseResource[],
): ResultAsync<Collection[]> {
  if (ids.length === 0) {
    return { success: true, value: [] };
  }
  const res = await directAccess<GetMultipleCollectionsQuery>({
    query: getMultipleCollectionsQuery,
    variables: { ids: ids.map(({ id }) => id) },
  });
  if (!res.success) return res;
  const collections = filterMap(res.value.nodes, (node) => node);
  return {
    success: true,
    value: collections.map(mapApiCollectionToResourcePickerCollection),
  };
}

function mapApiCollectionToResourcePickerCollection(
  collection: NonNullable<GetMultipleCollectionsQuery["nodes"][0]>,
): ResourceTypes["collection"] {
  return {
    availablePublicationCount:
      collection?.availablePublicationsCount?.count ?? 0,
    description: collection.description,
    descriptionHtml: collection.descriptionHtml,
    handle: collection.handle,
    id: collection.id,
    productsAutomaticallySortedCount: collection.productsCount?.count ?? 0,
    productsCount: collection.productsCount?.count ?? 0,
    productsManuallySortedCount: collection.productsCount?.count ?? 0,
    publicationCount: collection.resourcePublicationsCount?.count ?? 0,
    seo: collection.seo,
    sortOrder: collection.sortOrder,
    storefrontId: collection.id,
    title: collection.title,
    updatedAt: collection.updatedAt,
    image: extractCollectionImage(collection.image),
    ruleSet: collection.ruleSet,
    templateSuffix: collection.templateSuffix,
  };
}

function extractCollectionImage(
  value:
    | NonNullable<NonNullable<GetMultipleCollectionsQuery["nodes"][0]>["image"]>
    | null
    | undefined,
): Image_2 | null {
  if (!value) return null;
  return {
    altText: value.altText ?? "",
    id: value.id ?? "",
    originalSrc: value.url,
  };
}

// type defs



export type PickerResourceType = "product" | "variant" | "collection";

// below are copy pasted type defs from shopify because no one on the app bridge team at any point was like "hey may we should export the payload type so people can use this to make their own hooks. after all we aren't providing any react tooling for this. so the least we could do is export literally one type."

type ResourceSelection<Type extends keyof ResourceTypes> = ResourceTypes[Type];

export type ResourceTypes = {
  product: Product;
  variant: ProductVariant;
  collection: Collection;
};

interface RuleSet {
  appliedDisjunctively: boolean;
  rules: CollectionRule[];
}

export interface BaseResource extends Resource {
  variants?: Resource[];
}

interface Resource {
  /** in GraphQL id format, ie 'gid://shopify/Product/1' */
  id: string;
}

export type SelectPayload<Type extends keyof ResourceTypes> = WithSelection<
  ResourceSelection<Type>[]
>;

type WithSelection<T> = T & {
  /**
   * @private
   * @deprecated
   */
  selection: T;
};

interface CollectionRule {
  column: string;
  condition: string;
  relation: string;
}

enum CollectionSortOrder {
  Manual = "MANUAL",
  BestSelling = "BEST_SELLING",
  AlphaAsc = "ALPHA_ASC",
  AlphaDesc = "ALPHA_DESC",
  PriceDesc = "PRICE_DESC",
  PriceAsc = "PRICE_ASC",
  CreatedDesc = "CREATED_DESC",
  Created = "CREATED",
  MostRelevant = "MOST_RELEVANT",
}

interface Product extends Resource {
  availablePublicationCount: number;
  createdAt: string;
  descriptionHtml: string;
  handle: string;
  hasOnlyDefaultVariant: boolean;
  images: Image_2[];
  options: {
    id: string;
    name: string;
    position: number;
    values: string[];
  }[];
  productType: string;
  publishedAt?: string | null;
  tags: string[];
  templateSuffix?: string | null;
  title: string;
  totalInventory: number;
  totalVariants: number;
  tracksInventory: boolean;
  variants: ProductVariant[];
  vendor: string;
  updatedAt: string;
  status: ProductStatus;
}

enum ProductStatus {
  Active = "ACTIVE",
  Archived = "ARCHIVED",
  Draft = "DRAFT",
}

interface ProductVariant extends Resource {
  availableForSale: boolean;
  barcode?: string | null;
  compareAtPrice?: Money | null;
  createdAt: string;
  displayName: string;
  fulfillmentService?: {
    id: string;
    inventoryManagement: boolean;
    productBased: boolean;
    serviceName: string;
    type: FulfillmentServiceType;
  };
  image?: Image_2 | null;
  inventoryItem: {
    id: string;
  };
  inventoryManagement: ProductVariantInventoryManagement;
  inventoryPolicy: ProductVariantInventoryPolicy;
  inventoryQuantity?: number | null;
  position: number;
  price: Money;
  product: {
    id: string;
  };
  requiresShipping: boolean;
  selectedOptions: {
    value?: string | null;
  }[];
  sku?: string | null;
  taxable: boolean;
  title: string;
  weight?: number | null;
  weightUnit: WeightUnit;
  updatedAt: string;
}

type Money = string;

interface Image_2 {
  id: string;
  altText?: string;
  originalSrc: string;
}

interface Collection extends Resource {
  availablePublicationCount: number;
  description: string;
  descriptionHtml: string;
  handle: string;
  id: string;
  image?: Image_2 | null;
  productsAutomaticallySortedCount: number;
  productsCount: number;
  productsManuallySortedCount: number;
  publicationCount: number;
  ruleSet?: RuleSet | null;
  seo: {
    description?: string | null;
    title?: string | null;
  };
  sortOrder: CollectionSortOrder;
  storefrontId: string;
  templateSuffix?: string | null;
  title: string;
  updatedAt: string;
}

export function resourceToBaseResource(
  resource: ResourceTypes[PickerResourceType],
): BaseResource {
  if ("variants" in resource) {
    return {
      id: resource.id,
      variants: resource.variants.map((variant) => ({ id: variant.id })),
    };
  }
  return { id: resource.id };
}
