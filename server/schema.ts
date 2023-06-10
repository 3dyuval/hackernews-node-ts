import { makeExecutableSchema } from "@graphql-tools/schema";
import { Link, Prisma, Comment } from "@prisma/client";
import { GraphQLError } from "graphql";
import type { GraphQLContext } from "./context";
import { nextBatch } from "next-batch";
import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLResolveInfo } from "graphql";

export const typeDefinitions = /* GraphQL */ `
  interface Node {
    id: ID!
  }

  interface Actor {
    id: ID!
    name: String
    profilePicture: Image
    joined: String
  }

  type User implements Node & Actor {
    id: ID!
    name: String
    email: String
    profilePicture: Image
    joined: String
  }

  type Image {
    url(height: Int, width: Int): String!
    altText: String
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
    topic: String
    description: String!
    url: String!
    comments: CommentConnection
    totalComments: Int!
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
    id: ID!
    body: String!
    link: Link
  }

  type Topic {
    id: String!
    name: String!
  }

  type Query {
    viewer: Viewer
    node(id: ID!): Node 
    info: String!
    feed(cursor: String): LinkConnection!
    comment(id: ID!): Comment
    link(id: ID!): Link
    topic(id: String!): Topic
  }

  type Viewer {
    actor: Actor
  }

  type Mutation {
    postLink(url: String!, description: String!): Link!
    postCommentOnLink(linkId: ID!, body: String!): Comment!
    createTopic(id: String!, name: String!): Topic!
  }
`;

function encodeCursor<Cursor>(prismaCursor: Cursor) {
  return Buffer.from(JSON.stringify(prismaCursor)).toString("base64");
}

function decodeCursor(cursor: string) {
  return JSON.parse(Buffer.from(cursor, "base64").toString("ascii"));
}


const resolvers = {
  Query: {
    info: () => "Hackernews Clone",
    node: async (
      parent: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const [key, id] = Object.entries(decodeCursor(args.id))[0]
      const result =  await context.prisma[key].findUnique({ where: { id }})
      result.id = args.id

      return {...result, __typename: key}
    },
    viewer: async (

    ) => {
      return {name: 'yo', joined: 'yo'}
    },
    feed: async (
      parent: unknown,
      args: { cursor?: string },
      context: GraphQLContext
    ) => {
      const include = { _count: { select: { linkComment: true } } };
      const result =  await findManyCursorConnection(
        (query) => context.prisma.link.findMany({...query, include}),
        () => context.prisma.link.count(),
        { first: 30, after: args.cursor },
        {
          encodeCursor,
          decodeCursor,
          recordToEdge: (record) => ({
            node: { ...record, totalComments: record._count.linkComment },
          }),
        }
      );

	  return result
    },
    comment: async (
      parent: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      return await context.prisma.comment.findUnique({
        where: { id: parseInt(args.id) },
      });
    },
    link: async (
      parent: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {

      const cursor = decodeCursor(args.id);
      // if (isNaN(id)) {
      //   return Promise.reject(
      //     new GraphQLError(`Not valid link Id: '${args.id}'`)
      //   );
      // }
      
      const [key, id] = Object.entries(decodeCursor(args.id))[0]
      
      const where = { id } as {id: number};
      const include = { _count: { select: { linkComment: true } } };

      const result = await context.prisma.link.findUnique({ where, include });
      const { linkComment: totalComments } = result._count;
      return { ...result, totalComments };

    },
    topic: async (
      parent: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {  
      return context.prisma.topic.findUnique({
        where: { id: args.id },
      });
    },
  },
  Viewer: {
    async actor() {
      return {name: 'Yo', joined: 'asdasdasd', __typename: 'User'}
    }
  },
  Mutation: {
    async postLink(
      parent: unknown,
      args: { description: string; url: string },
      context: GraphQLContext
    ) {
      return await context.prisma.link.create({
        data: {
          description: args.description,
          url: args.url,
        },
      });
    },
    async postCommentOnLink(
      parent: unknown,
      args: { linkId: string; body: string },
      context: GraphQLContext
    ) {
      const comment = await context.prisma.comment
        .create({
          data: {
            body: args.body,
            linkId: parseInt(args.linkId),
          },
        })
        .catch((e: Prisma.PrismaClientUnknownRequestError) => {
          if (
            e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === "P2003"
          ) {
            return Promise.reject(
              new GraphQLError(
                `Cannot post comment on non-existing link with id '${args.linkId}'.`
              )
            );
          }
          return Promise.reject(e);
        });
      return comment;
    },
    createTopic: async (
      parent: unknown,
      args: { id: string; name: string },
      context: GraphQLContext
    ) => {
      const topic = await context.prisma.topic
        .create({
          data: {
            id: args.id,
            name: args.name,
          },
        })
        .catch((e: any) => {
          if (
            e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === "P2002"
          ) {
            return Promise.reject(
              new GraphQLError(
                `Cannot create topic with existing topic id '${args.id}'.`
              )
            );
          }
        });
      return topic;
    },
  },
  Link: {
    async comments(parent: Link, args: {}, context: GraphQLContext) {

    const where = { linkId: parent.id}

     const result =  await findManyCursorConnection(
      () => context.prisma.comment.findMany({where}),
      () => context.prisma.comment.count({where}),
      {},
      {
        encodeCursor,
        decodeCursor,
      }
     )
     return result
    }
  },
  Comment: {
    async link(parent: Comment, args: {}, context: GraphQLContext) {

    const where = { id: parent.linkId}

    return await context.prisma.link.findUnique({where})
    }
  }
};

export const schema = makeExecutableSchema({
  resolvers: [resolvers],
  typeDefs: [typeDefinitions],
});
