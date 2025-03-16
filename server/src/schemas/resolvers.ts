import Book, { BookDocument } from '../models/Book.js';
import User, { UserDocument } from '../models/User.js';

const resolvers = {
  Query: {
    book: async (): Promise<BookDocument[] | null> => {
      return Book.find({});
    },
    users: async (_parent: any, { _id }: { _id: string }): Promise<UserDocument[] | null> => {
      const params = _id ? { _id } : {};
      return User.find(params);
    },
  },
  Mutation: {
    createUser: async (_parent: any, args: any): Promise<UserDocument | null> => {
      const user = await User.create(args);
      return user;
    },
  },
};

export default resolvers;