import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Mutation } from "react-apollo";

import { CURRENT_USER_QUERY, REMOVE_FROM_CART_MUTATION } from "../GraphQL";

class RemoveFromCart extends Component {
  // This function will get called as soon as we get a response back from the server after a mutation
  update = (cache, payload) => {
    // Read the cache
    const data = cache.readQuery({ query: CURRENT_USER_QUERY });
    // Remove the CartItem from the cart
    const cartItemId = payload.data.removeFromCart.id;
    data.currentUser.cart = data.currentUser.cart.filter(
      cartItem => cartItem.id !== cartItemId
    );
    // Rewrite to cache
    cache.writeQuery({ query: CURRENT_USER_QUERY, data });
  };

  render() {
    return (
      <Mutation
        mutation={REMOVE_FROM_CART_MUTATION}
        variables={{ id: this.props.id }}
        update={this.update}
        // Opitimistic UI
        optimisticResponse={{
          __typname: "Mutation",
          removeFromCart: {
            __typname: "CartItem",
            id: this.props.id
          }
        }}
      >
        {(removeFromCart, { loading, error }) => {
          return (
            <BigButton
              title="Delete Item"
              onClick={() => {
                removeFromCart().catch(err => alert(error.message));
              }}
              disabled={loading}
            >
              &times;
            </BigButton>
          );
        }}
      </Mutation>
    );
  }
}

RemoveFromCart.propTypes = {
  id: PropTypes.string.isRequired
};

export default RemoveFromCart;

// -------------------- Styles -------------------- //

const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: 0;
  &:hover {
    color: ${({ theme }) => theme.red};
    cursor: pointer;
  }
`;
