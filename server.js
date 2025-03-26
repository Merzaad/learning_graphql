import express from "express";
import { graphqlHTTP } from "express-graphql";
import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "learn_graphql",
    fields: () => ({
      learn: { type: GraphQLString, resolve: () => "resolve learn_graphql" },
    }),
  }),
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
