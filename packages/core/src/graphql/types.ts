import type * as AdminTypes from '../admin.types';

// generated types for resource picker queries

export type GetMultipleCollectionsQueryVariables = AdminTypes.Exact<{
	ids: Array<AdminTypes.Scalars['ID']['input']> | AdminTypes.Scalars['ID']['input'];
}>;

export type GetMultipleCollectionsQuery = {
	nodes: Array<
		AdminTypes.Maybe<
			Pick<
				AdminTypes.Collection,
				| 'description'
				| 'descriptionHtml'
				| 'handle'
				| 'id'
				| 'sortOrder'
				| 'title'
				| 'updatedAt'
				| 'templateSuffix'
			> & {
				availablePublicationsCount?: AdminTypes.Maybe<Pick<AdminTypes.Count, 'count'>>;
				productsCount?: AdminTypes.Maybe<Pick<AdminTypes.Count, 'count'>>;
				resourcePublicationsCount?: AdminTypes.Maybe<Pick<AdminTypes.Count, 'count'>>;
				seo: Pick<AdminTypes.Seo, 'description' | 'title'>;
				image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'altText' | 'url'>>;
				ruleSet?: AdminTypes.Maybe<
					Pick<AdminTypes.CollectionRuleSet, 'appliedDisjunctively'> & {
						rules: Array<Pick<AdminTypes.CollectionRule, 'column' | 'condition' | 'relation'>>;
					}
				>;
			}
		>
	>;
};

export type GetMultipleProductsQueryVariables = AdminTypes.Exact<{
	ids: Array<AdminTypes.Scalars['ID']['input']> | AdminTypes.Scalars['ID']['input'];
}>;

export type GetMultipleProductsQuery = {
	nodes: Array<
		AdminTypes.Maybe<
			Pick<
				AdminTypes.Product,
				| 'createdAt'
				| 'descriptionHtml'
				| 'handle'
				| 'hasOnlyDefaultVariant'
				| 'id'
				| 'productType'
				| 'status'
				| 'tags'
				| 'title'
				| 'totalInventory'
				| 'tracksInventory'
				| 'updatedAt'
				| 'vendor'
				| 'publishedAt'
				| 'templateSuffix'
			> & {
				availablePublicationsCount?: AdminTypes.Maybe<Pick<AdminTypes.Count, 'count'>>;
				media: {
					edges: Array<{
						node:
							| ({ __typename: 'ExternalVideo' } & Pick<
									AdminTypes.ExternalVideo,
									'id' | 'host' | 'originUrl' | 'alt' | 'mediaContentType' | 'status'
							  > & {
										preview?: AdminTypes.Maybe<{
											image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'altText' | 'url'>>;
										}>;
									})
							| ({ __typename: 'MediaImage' } & Pick<
									AdminTypes.MediaImage,
									'id' | 'alt' | 'mediaContentType' | 'status'
							  > & {
										image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'altText' | 'url'>>;
										preview?: AdminTypes.Maybe<{
											image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'altText' | 'url'>>;
										}>;
									})
							| ({ __typename: 'Model3d' } & Pick<
									AdminTypes.Model3d,
									'alt' | 'mediaContentType' | 'status'
							  > & {
										sources: Array<Pick<AdminTypes.Model3dSource, 'format' | 'mimeType' | 'url'>>;
										originalSource?: AdminTypes.Maybe<
											Pick<AdminTypes.Model3dSource, 'format' | 'mimeType' | 'url'>
										>;
										preview?: AdminTypes.Maybe<{
											image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'altText' | 'url'>>;
										}>;
									})
							| ({ __typename: 'Video' } & Pick<
									AdminTypes.Video,
									'id' | 'alt' | 'mediaContentType' | 'status'
							  > & {
										sources: Array<
											Pick<
												AdminTypes.VideoSource,
												'format' | 'height' | 'mimeType' | 'url' | 'width'
											>
										>;
										originalSource?: AdminTypes.Maybe<
											Pick<
												AdminTypes.VideoSource,
												'format' | 'height' | 'mimeType' | 'url' | 'width'
											>
										>;
										preview?: AdminTypes.Maybe<{
											image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'altText' | 'url'>>;
										}>;
									});
					}>;
				};
				options: Array<Pick<AdminTypes.ProductOption, 'id' | 'name' | 'position' | 'values'>>;
				variantsCount?: AdminTypes.Maybe<Pick<AdminTypes.Count, 'count'>>;
			}
		>
	>;
};

type FieldsForMedia_ExternalVideo_Fragment = { __typename: 'ExternalVideo' } & Pick<
	AdminTypes.ExternalVideo,
	'id' | 'host' | 'originUrl' | 'alt' | 'mediaContentType' | 'status'
> & {
		preview?: AdminTypes.Maybe<{
			image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'altText' | 'url'>>;
		}>;
	};

type FieldsForMedia_MediaImage_Fragment = { __typename: 'MediaImage' } & Pick<
	AdminTypes.MediaImage,
	'id' | 'alt' | 'mediaContentType' | 'status'
> & {
		image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'altText' | 'url'>>;
		preview?: AdminTypes.Maybe<{
			image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'altText' | 'url'>>;
		}>;
	};

type FieldsForMedia_Model3d_Fragment = { __typename: 'Model3d' } & Pick<
	AdminTypes.Model3d,
	'alt' | 'mediaContentType' | 'status'
> & {
		sources: Array<Pick<AdminTypes.Model3dSource, 'format' | 'mimeType' | 'url'>>;
		originalSource?: AdminTypes.Maybe<
			Pick<AdminTypes.Model3dSource, 'format' | 'mimeType' | 'url'>
		>;
		preview?: AdminTypes.Maybe<{
			image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'altText' | 'url'>>;
		}>;
	};

type FieldsForMedia_Video_Fragment = { __typename: 'Video' } & Pick<
	AdminTypes.Video,
	'id' | 'alt' | 'mediaContentType' | 'status'
> & {
		sources: Array<
			Pick<AdminTypes.VideoSource, 'format' | 'height' | 'mimeType' | 'url' | 'width'>
		>;
		originalSource?: AdminTypes.Maybe<
			Pick<AdminTypes.VideoSource, 'format' | 'height' | 'mimeType' | 'url' | 'width'>
		>;
		preview?: AdminTypes.Maybe<{
			image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'altText' | 'url'>>;
		}>;
	};

export type FieldsForMediaFragment =
	| FieldsForMedia_ExternalVideo_Fragment
	| FieldsForMedia_MediaImage_Fragment
	| FieldsForMedia_Model3d_Fragment
	| FieldsForMedia_Video_Fragment;

export type GetMultipleVariantsQueryVariables = AdminTypes.Exact<{
	ids: Array<AdminTypes.Scalars['ID']['input']> | AdminTypes.Scalars['ID']['input'];
}>;

export type GetMultipleVariantsQuery = {
	nodes: Array<
		AdminTypes.Maybe<
			Pick<
				AdminTypes.ProductVariant,
				| 'id'
				| 'availableForSale'
				| 'barcode'
				| 'compareAtPrice'
				| 'createdAt'
				| 'displayName'
				| 'inventoryQuantity'
				| 'position'
				| 'price'
				| 'inventoryPolicy'
				| 'sku'
				| 'taxable'
				| 'title'
				| 'updatedAt'
			> & {
				media: {
					edges: Array<{
						node:
							| ({ __typename: 'ExternalVideo' } & Pick<
									AdminTypes.ExternalVideo,
									'id' | 'host' | 'originUrl' | 'alt' | 'mediaContentType' | 'status'
							  > & {
										preview?: AdminTypes.Maybe<{
											image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'altText' | 'url'>>;
										}>;
									})
							| ({ __typename: 'MediaImage' } & Pick<
									AdminTypes.MediaImage,
									'id' | 'alt' | 'mediaContentType' | 'status'
							  > & {
										image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'altText' | 'url'>>;
										preview?: AdminTypes.Maybe<{
											image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'altText' | 'url'>>;
										}>;
									})
							| ({ __typename: 'Model3d' } & Pick<
									AdminTypes.Model3d,
									'alt' | 'mediaContentType' | 'status'
							  > & {
										sources: Array<Pick<AdminTypes.Model3dSource, 'format' | 'mimeType' | 'url'>>;
										originalSource?: AdminTypes.Maybe<
											Pick<AdminTypes.Model3dSource, 'format' | 'mimeType' | 'url'>
										>;
										preview?: AdminTypes.Maybe<{
											image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'altText' | 'url'>>;
										}>;
									})
							| ({ __typename: 'Video' } & Pick<
									AdminTypes.Video,
									'id' | 'alt' | 'mediaContentType' | 'status'
							  > & {
										sources: Array<
											Pick<
												AdminTypes.VideoSource,
												'format' | 'height' | 'mimeType' | 'url' | 'width'
											>
										>;
										originalSource?: AdminTypes.Maybe<
											Pick<
												AdminTypes.VideoSource,
												'format' | 'height' | 'mimeType' | 'url' | 'width'
											>
										>;
										preview?: AdminTypes.Maybe<{
											image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'altText' | 'url'>>;
										}>;
									});
					}>;
				};
				product: Pick<AdminTypes.Product, 'id'>;
				selectedOptions: Array<Pick<AdminTypes.SelectedOption, 'value'>>;
				inventoryItem: Pick<AdminTypes.InventoryItem, 'id' | 'requiresShipping'> & {
					measurement: { weight?: AdminTypes.Maybe<Pick<AdminTypes.Weight, 'unit' | 'value'>> };
					inventoryLevels: {
						edges: Array<{
							node: {
								location: {
									fulfillmentService?: AdminTypes.Maybe<
										Pick<
											AdminTypes.FulfillmentService,
											'id' | 'inventoryManagement' | 'serviceName' | 'type'
										>
									>;
								};
							};
						}>;
					};
				};
			}
		>
	>;
};

type FieldsForMediaTypesVariants_ExternalVideo_Fragment = { __typename: 'ExternalVideo' } & Pick<
	AdminTypes.ExternalVideo,
	'id' | 'host' | 'originUrl' | 'alt' | 'mediaContentType' | 'status'
> & {
		preview?: AdminTypes.Maybe<{
			image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'altText' | 'url'>>;
		}>;
	};

type FieldsForMediaTypesVariants_MediaImage_Fragment = { __typename: 'MediaImage' } & Pick<
	AdminTypes.MediaImage,
	'id' | 'alt' | 'mediaContentType' | 'status'
> & {
		image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'altText' | 'url'>>;
		preview?: AdminTypes.Maybe<{
			image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'altText' | 'url'>>;
		}>;
	};

type FieldsForMediaTypesVariants_Model3d_Fragment = { __typename: 'Model3d' } & Pick<
	AdminTypes.Model3d,
	'alt' | 'mediaContentType' | 'status'
> & {
		sources: Array<Pick<AdminTypes.Model3dSource, 'format' | 'mimeType' | 'url'>>;
		originalSource?: AdminTypes.Maybe<
			Pick<AdminTypes.Model3dSource, 'format' | 'mimeType' | 'url'>
		>;
		preview?: AdminTypes.Maybe<{
			image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'altText' | 'url'>>;
		}>;
	};

type FieldsForMediaTypesVariants_Video_Fragment = { __typename: 'Video' } & Pick<
	AdminTypes.Video,
	'id' | 'alt' | 'mediaContentType' | 'status'
> & {
		sources: Array<
			Pick<AdminTypes.VideoSource, 'format' | 'height' | 'mimeType' | 'url' | 'width'>
		>;
		originalSource?: AdminTypes.Maybe<
			Pick<AdminTypes.VideoSource, 'format' | 'height' | 'mimeType' | 'url' | 'width'>
		>;
		preview?: AdminTypes.Maybe<{
			image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'altText' | 'url'>>;
		}>;
	};

export type FieldsForMediaTypesVariantsFragment =
	| FieldsForMediaTypesVariants_ExternalVideo_Fragment
	| FieldsForMediaTypesVariants_MediaImage_Fragment
	| FieldsForMediaTypesVariants_Model3d_Fragment
	| FieldsForMediaTypesVariants_Video_Fragment;
