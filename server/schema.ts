import { makeExecutableSchema } from '@graphql-tools/schema';
import { Prisma } from '@prisma/client';
import { GraphQLError } from 'graphql';
import type { GraphQLContext } from './context';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { link, comment, db } from '../db/drizzle';
import { eq, sql } from 'drizzle-orm';
import type { Link, Comment } from '../db/drizzle';

const atob = (a) => Buffer.from(a, 'base64').toString('binary');

const btoa = (b) => Buffer.from(b).toString('base64');

function decodeId(id: string): number {
  const parsedObj = JSON.parse(atob(id));
  const [entity, decodedNumber] = Object.entries(parsedObj).at(0);

  if (typeof decodedNumber === 'string') {
    const parsedId = Number.parseInt(decodedNumber);
    if (!isNaN(parsedId)) {
      return parsedId;
    }
  }
  throw new TypeError('Id must be number');
}

export const typeDefinitions = /* GraphQL */ `
  interface Node {
    id: ID!
  }

  type LinkConnection {
    edges: [LinkEdge]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type LinkEdge {
    cursor: String!
    node: Link
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type Link implements Node {
    id: ID!
    linkId: String!
    topic: String
    description: String!
    url: String!
    comments: [Comment]
    createdAt: String!
    totalComments: Int!
    userId: String
  }

  type CommentConnection {
    edges: [CommentEdge]
    pageInfo: PageInfo
  }

  type CommentEdge {
    cursor: String!
    node: Comment
  }

  type Comment implements Node {
    # link: Link!
    id: ID!
    body: String!
    createdAt: String
    parentId: String
  }

  type Topic {
    id: String!
    name: String!
  }

  type Query {
    viewer: Viewer
    node(id: ID!): Node
    info: String!
    feed(first: Int, after: String, date: String, orderBy: String): LinkConnection!
    comment(id: ID!): Comment
    newComments: CommentConnection
    link(id: ID!): Link
    topic(id: String!): Topic
  }

  type Viewer {
    score: Int
    name: String
  }

  type Mutation {
    postLink(url: String!, description: String!): Link!
    postCommentOnLink(linkId: ID!, body: String!, parentId: String): Comment!
    createTopic(id: String!, name: String!): Topic!
  }
`;

function encodeCursor<Cursor>(prismaCursor: Cursor) {
  return Buffer.from(JSON.stringify(prismaCursor)).toString('base64');
}

function decodeCursor(cursor: string) {
  return JSON.parse(Buffer.from(cursor, 'base64').toString('ascii'));
}

const resolvers = {
  Query: {
    info: () => 'Hackernews Clone',
    node: async (parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const [key, id] = Object.entries(decodeCursor(args.id))[0];
      const result = await context.prisma[key]
        .findUnique({ where: { id } })
        .catch((e: Prisma.PrismaClientUnknownRequestError) => {
          if (e instanceof Prisma.PrismaClientKnownRequestError) {
            return Promise.reject(new GraphQLError(`Did not found record with id '${id}' on '${key}'.`));
          }
        });

      return { ...result, id: args.id, __typename: key };
    },
    viewer: async (parent: unknown, args: {}, context: GraphQLContext) => {
      if (context.userId === null) {
        return Promise.reject(new GraphQLError(`User id could not be verified`));
      }
      const score = await context.prisma.link.count({ where: { userId: context.userId } });
      return { score, name: 'user-dev' };
    },
    feed: async (
      parent: unknown,
      args: { first?: string; after?: string; date?: string; orderBy: 'rank' | 'comments' | 'new' },
      context: GraphQLContext
    ) => {
      const include = { _count: { select: { linkComment: true } } };
      const where: any = { createdAt: { lte: undefined } };
      const orderBy: any[] = [];

      if (args.orderBy === 'new' || !args.orderBy) {
        orderBy.push({ createdAt: 'desc' });
      }

      if (args.orderBy === 'comments') {
        orderBy.push({ linkComment: { _count: 'desc' } });
      }

      if (args.orderBy === 'rank') {
        orderBy.push({ linkComment: { _count: 'desc' } });
      }

      if (typeof args.date === 'string' && args.date.includes('-')) {
        const parts = args.date.split('-');

        if (parts.length !== 3) {
          return Promise.reject(
            new GraphQLError(`Date argument '${args.date.slice(0, 10)}' does not match YYYY-MM-DD.'`)
          );
        }

        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Months are zero-based in JavaScript (0-11)
        const day = parseInt(parts[2], 10);
        const date = new Date(year, month, day);

        if (date.toDateString() === 'Invalid Date') {
          return Promise.reject(new GraphQLError(`Date error: '${args.date}' did not resolve to a valid date.'`));
        }
        where.createdAt.lte = date.toISOString();
      }

      return await findManyCursorConnection(
        (query) =>
          context.prisma.link.findMany({
            ...query,
            where,
            include,
            orderBy,
          }),
        () => context.prisma.link.count(),
        { first: 30, after: args.after },
        {
          encodeCursor: (cursor) => encodeCursor({ link: cursor }),
          decodeCursor,
          recordToEdge: (record) => ({
            node: {
              ...record,
              totalComments: record._count.linkComment,
              linkId: encodeCursor({ link: record.id }),
            },
          }),
        }
      );
    },
    comment: async (parent: unknown, args: { id: string }, context: GraphQLContext) => {
      return await context.prisma.comment.findUnique({
        where: { id: args.id },
      });
    },
    link: async (parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const id = decodeId(args.id);

      const row = await db
        .select({
          link,
          totalComments: sql<number>`count(comments)`,
        })
        .from(link)
        .where(eq(link.id, id))
        .leftJoin(comment, eq(link.id, comment.parentId))
        .groupBy(comment.parentId);

      console.log(row);
      return { ...row, linkId: args.id };

      // const result = rows.reduce<Record<number, Link & { comments: Comment[]; linkId: string; totalComments: number }>>(
      //   (acc, row) => {
      //     const link = row.link;
      //     const comment = row.comment;

      //     acc[link.id] ||= { ...link, linkId: args.id, comments: [], totalComments: 0 };

      //     if (comment) {
      //       acc[link.id].comments.push(comment);
      //       acc[link.id].totalComments = acc[link.id].comments.length;
      //     }

      //     return acc;
      //   },
      //   {}
      // );

      // return result[id];
    },
    topic: async (parent: unknown, args: { id: string }, context: GraphQLContext) => {
      return context.prisma.topic.findUnique({
        where: { id: args.id },
      });
    },
    newComments: async (parent: unknown, args: {}, context: GraphQLContext) => {
      return findManyCursorConnection(
        () =>
          context.prisma.comment.findMany({
            orderBy: { createdAt: 'desc' },
            include: { Link: true },
          }),
        () => context.prisma.comment.count(),
        { first: 30 },
        {
          recordToEdge: (record) => {
            return {
              node: {
                ...record,
                link: {
                  ...record.Link,
                  linkId: encodeCursor(JSON.stringify({ link: record.Link.id })),
                },
              },
            };
          },
        }
      );
    },
  },
  Mutation: {
    async postLink(parent: unknown, args: { description: string; url: string }, context: GraphQLContext) {
      if (context.userId === null) {
        return Promise.reject(new GraphQLError(`User id could not be verified`));
      }
      const result = await context.prisma.link.create({
        data: {
          description: args.description,
          url: args.url,
          userId: context.userId,
        },
      });
      return { ...result, id: encodeCursor({ link: result.id }) };
    },
    async postCommentOnLink(
      parent: unknown,
      args: { linkId: string; body: string; parentId?: string },
      context: GraphQLContext
    ) {
      if (context.userId === null) {
        return Promise.reject(new GraphQLError(`User id could not be verified`));
      }

      const [key, id] = Object.entries(decodeCursor(args.linkId))[0] as string[];

      const comment = await context.prisma.comment
        .create({
          data: {
            body: args.body,
            linkId: parseInt(id),
            parentId: args.parentId,
          },
        })
        .catch((e: Prisma.PrismaClientUnknownRequestError) => {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
            return Promise.reject(
              new GraphQLError(`Cannot post comment on non-existing link with id '${args.linkId}'`)
            );
          }
          return Promise.reject(e);
        });
      return comment;
    },
    createTopic: async (parent: unknown, args: { id: string; name: string }, context: GraphQLContext) => {
      const topic = await context.prisma.topic
        .create({
          data: {
            id: args.id,
            name: args.name,
          },
        })
        .catch((e: any) => {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            return Promise.reject(new GraphQLError(`Cannot create topic with existing topic id '${args.id}'`));
          }
        });
      return topic;
    },
  },
  Link: {
    async comments(parent: Link, args: {}, context: GraphQLContext) {
      // const r = await findManyCursorConnection(
      //   Querying like this instead of comment.findMany will auto batch all linkComment into one request
      //   () => context.prisma.link.findUnique({ where: { id: parent.id } }).linkComment(),
      //   () => context.prisma.comment.count({ where: { linkId: parent.id } }),
      //   { first: 10 },
      //   {
      //     recordToEdge: (record) => ({
      //       node: { ...record, parentId: record.parentId ? record.parentId : encodeCursor({ link: record.linkId }) },
      //     }),
      //   }
      // );
      debugger;
      return;
    },
  },
};

export const schema = makeExecutableSchema({
  resolvers: [resolvers],
  typeDefs: [typeDefinitions],
});
