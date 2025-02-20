export const getMultipleVariantsQuery = `#graphql
query GetMultipleVariants($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on ProductVariant {
      id
      availableForSale
      barcode
      compareAtPrice
      createdAt
      displayName
      media(first: 1) {
        edges {
          node {
            ...fieldsForMediaTypesVariants
          }
        }
      }
      inventoryQuantity
      position
      price
      product {
        id
      }
      inventoryPolicy
      selectedOptions {
        value
      }
      sku
      taxable
      title
      updatedAt
      inventoryItem {
        id
        requiresShipping
        measurement {
          weight {
            unit
            value
          }
        }
        inventoryLevels(first:1) {
          edges {
            node {
              location {
                fulfillmentService {
                  id
                  inventoryManagement
                  serviceName
                  type
                }
              }
            }
          }
        }
      }
    }
  }
}

fragment fieldsForMediaTypesVariants on Media {
  __typename
  alt
  mediaContentType
  preview {
    image {
      id
      altText
      url
    }
  }
  status
  ... on Video {
    id
    sources {
      format
      height
      mimeType
      url
      width
    }
    originalSource {
      format
      height
      mimeType
      url
      width
    }
  }
  ... on ExternalVideo {
    id
    host
    originUrl
  }
  ... on Model3d {
    sources {
      format
      mimeType
      url
    }
    originalSource {
      format
      mimeType
      url
    }
  }
  ... on MediaImage {
    id
    image {
      altText
      url
    }
  }
}`;
