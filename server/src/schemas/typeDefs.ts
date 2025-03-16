const typeDefs = `
  type Book {
    _id: ID!
    bookId: String!
    title: String!
    authors: [String]
    description: String
    image: String
    link: String
  }

  type User {
    _id: ID!
    username: String!
    email: String!
    password: String!
    savedBooks: [Book]
    bookCount: Int
  }

  type Query {
    book: [Book]
    users(_id: String): [User]
  }

  type Mutation {
    createUser(username: String!, email: String!): User
  }
`;

export default typeDefs;
