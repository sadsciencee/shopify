export const getMultipleCollectionsQuery = `#graphql
query GetMultipleCollections($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on Collection {
      availablePublicationsCount {
        count
      }
      description
      descriptionHtml
      handle
      id
      productsCount {
        count
      }
      resourcePublicationsCount {
        count
      }
      seo {
        description
        title
      }
      sortOrder
      title
      updatedAt
      image {
        id
        altText
        url
      }
      ruleSet {
        appliedDisjunctively
        rules {
          column
          condition
          relation
        }
      }
      templateSuffix
    }
  }
}`;
