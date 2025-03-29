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
    number: {
      type: NumbersType,
      description: "One of Numbers",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        numbers.find((number) => number.id === args.id),
    },
    string: {
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
const schema = new GraphQLSchema({
  query: RootQueryType,
});
const app = express();
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);
app.listen(3001, () => console.log("server started on 3001"));
