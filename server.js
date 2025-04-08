import express from "express";
import { graphqlHTTP } from "express-graphql";
import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import { PubSub } from "graphql-subscriptions";
import { useServer } from "graphql-ws/use/ws";
import { WebSocketServer } from "ws";

const pubsub = new PubSub();
const STRING_ADDED = "STRING_ADDED";

const strings = [
  { id: 1, string: "one" },
  { id: 2, string: "two" },
  { id: 3, string: "three" },
  { id: 4, string: "four" },
  { id: 5, string: "five" },
];
const numbers = [
  { id: 1, number: 1 },
  { id: 2, number: 2 },
  { id: 3, number: 3 },
  { id: 4, number: 4 },
  { id: 5, number: 5 },
];

const StringsType = new GraphQLObjectType({
  name: "Strings",
  description: "Strings GraphQLObjectType",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    string: { type: GraphQLNonNull(GraphQLString) },
    number: {
      type: NumbersType,
      resolve: (string) => numbers.find((number) => number.id === string.id),
    },
  }),
});
const NumbersType = new GraphQLObjectType({
  name: "Numbers",
  description: "Numbers GraphQLObjectType",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    number: { type: GraphQLNonNull(GraphQLInt) },
    string: {
      type: StringsType,
      resolve: (number) => strings.find((string) => string.id === number.id),
    },
  }),
});
const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Query GraphQLObjectType",
  fields: () => ({
    strings: {
      type: new GraphQLList(StringsType),
      description: "list of Strings",
      resolve: () => strings,
    },
    numbers: {
      type: new GraphQLList(NumbersType),
      description: "list of Numbers",
      resolve: () => numbers,
    },
    getNumber: {
      type: NumbersType,
      description: "One of Numbers",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        numbers.find((number) => number.id === args.id),
    },
    getString: {
      type: StringsType,
      description: "One of Strings",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        strings.find((string) => string.id === args.id),
    },
  }),
});
const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root mutation",
  fields: () => ({
    addString: {
      type: StringsType,
      description: "Add string",
      args: {
        string: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const string = { id: strings.length + 1, string: args.string };
        strings.push(string);
        pubsub.publish(STRING_ADDED, { stringAdded: string }); 
        return string;
      },
    },
  }),
});
const RootSubscriptionType = new GraphQLObjectType({
  name: "Subscription",
  fields: {
    stringAdded: {
      type: StringsType,
      subscribe: () => pubsub.asyncIterableIterator(STRING_ADDED),
    },
  },
});
const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
  subscription: RootSubscriptionType,
});
const app = express();
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: {
      subscriptionEndpoint: "ws://localhost:3001/graphql",
    },
  })
);
const server = app.listen(3001, () => {
  console.log("GraphQL server started on http://localhost:3001/graphql");
});
const wsServer = new WebSocketServer({
  server,
  path: "/graphql",
});
useServer({ schema }, wsServer);
