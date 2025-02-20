export const getMultipleProductsQuery = `#graphql
query GetMultipleProducts($ids: [ID!]!) {
  nodes(
    ids: $ids
  ) {
    ... on Product {
      availablePublicationsCount {
        count
      }
      createdAt
      descriptionHtml
      handle
      hasOnlyDefaultVariant
      id
      media(first: 1) {
        edges {
          node {
            ...fieldsForMedia
          }
        }
      }
      options {
        id
        name
        position
        values
      }
      productType
      status
      tags
      title
      totalInventory
      variantsCount {
        count
      }
      tracksInventory
      updatedAt
      vendor
      publishedAt
      templateSuffix
    }
  }
}

fragment fieldsForMedia on Media {
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
