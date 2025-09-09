export const UPSERT_CUSTOMER_MUTATION = `
      mutation upsertCustomer($input: UpsertCustomerInput!) {
        upsertCustomer(input: $input) {
          result
          customer {
            id
            externalId
            shortName
            fullName
            email {
              email
              isVerified
            }
            status
          }
          error {
            message
            type
            code
            fields {
              field
              message
              type
            }
          }
        }
      }
    `;

export const CREATE_THREAD_MUTATION = `
      mutation createThread($input: CreateThreadInput!) {
        createThread(input: $input) {
          thread {
            id
            externalId
            customer {
              id
            }
            status
            statusChangedAt {
              iso8601
              unixTimestamp
            }
            title
            previewText
            priority
          }
          error {
            message
            type
            code
            fields {
              field
              message
              type
            }
          }
        }
      }
    `;
