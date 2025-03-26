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
];
const numbers = [
  { id: 1, number: 1 },
  { id: 2, number: 2 },
];

const StringsType = new GraphQLObjectType({
  name: "Strings",
  description: "Strings GraphQLObjectType",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    string: { type: GraphQLNonNull(GraphQLString) },
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
