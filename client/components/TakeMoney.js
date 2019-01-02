import React from "react";
import StripeCheckout from "react-stripe-checkout";
import { Mutation } from "react-apollo";
import Router from "next/router";
import NProgress from "nprogress";

import calcTotalPrice from "../lib/calcTotalPrice";
import User from "./User";
import { CURRENT_USER_QUERY, CREATE_ORDER_MUTATION } from "../GraphQL";

const totalItems = cart =>
  cart.reduce((acc, cartItem) => acc + cartItem.quantity, 0);

export default class TakeMoney extends React.Component {
  onToken = async ({ id: token }, createOrder) => {
    NProgress.start();
    // Call the mutation once we have the stripe token
    const order = await createOrder({ variables: { token } }).catch(err =>
      alert(err.message)
    );
    Router.push({
      pathname: "/order",
      query: { id: order.data.createOrder.id }
    });
  };

  render() {
    return (
      <User>
        {({ data: { currentUser }, loading }) => {
          if (loading) return null;
          return (
            <Mutation
              mutation={CREATE_ORDER_MUTATION}
              refetchQueries={[{ query: CURRENT_USER_QUERY }]}
            >
              {createOrder => {
                return (
                  <StripeCheckout
                    amount={calcTotalPrice(currentUser.cart)}
                    name="SwagBag"
                    description={`Order of ${totalItems(
                      currentUser.cart
                    )} Items!`}
                    image={
                      currentUser.cart.length &&
                      currentUser.cart[0].item &&
                      currentUser.cart[0].item.image
                    }
                    stripeKey="pk_test_pW4LIfj8BDWiZzXHIgJiWxUy"
                    currency="USD"
                    email={currentUser.email}
                    token={res => this.onToken(res, createOrder)}
                  >
                    {this.props.children}
                  </StripeCheckout>
                );
              }}
            </Mutation>
          );
        }}
      </User>
    );
  }
}
