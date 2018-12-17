import React, { Component } from "react";
import { Mutation } from "react-apollo";

import Error from "./ErrorMessage";
import { ADD_TO_CART_MUTATION, CURRENT_USER_QUERY } from "../GraphQL";

export default class AddToCart extends Component {
  render() {
    const { id } = this.props;
    return (
      <Mutation
        mutation={ADD_TO_CART_MUTATION}
        variables={{ id }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(addToCart, { loading, error }) => {
          return (
            <>
              <Error error={error} />
              <button disabled={loading} onClick={addToCart}>
                Add{loading && "ing"} To Cart 🛒
              </button>
            </>
          );
        }}
      </Mutation>
    );
  }
}
