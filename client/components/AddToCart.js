import React, { Component } from "react";
import { Mutation } from "react-apollo";

import Error from "./ErrorMessage";
import { ADD_TO_CART_MUTATION } from "../GraphQL";

export default class AddToCart extends Component {
  render() {
    const { id } = this.props;
    return (
      <Mutation mutation={ADD_TO_CART_MUTATION} variables={{ id }}>
        {(addToCart, { loading, error }) => {
          return (
            <>
              <Error error={error} />
              <button disabled={loading} onClick={addToCart}>
                Add To Cart 🛒
              </button>
            </>
          );
        }}
      </Mutation>
    );
  }
}
