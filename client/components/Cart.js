import React from "react";
import { Query, Mutation } from "react-apollo";
import styled from "styled-components";

import { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION } from "../GraphQL";
import User from "./User";
import CartItem from "./CartItem";
import TakeMoney from "./TakeMoney";
import calcTotalPrice from "../lib/calcTotalPrice";
import formatMoney from "../lib/formatMoney";

const Cart = props => {
  return (
    <User>
      {({ data: { currentUser } }) => {
        if (!currentUser) return null;
        return (
          <Mutation mutation={TOGGLE_CART_MUTATION}>
            {toggleCart => (
              <Query query={LOCAL_STATE_QUERY}>
                {({ data }) => (
                  <>
                    <CartStyles open={data.cartOpen}>
                      <header>
                        <CloseButton title="close" onClick={toggleCart}>
                          &times;
                        </CloseButton>
                        <Supreme>{currentUser.name}'s Cart</Supreme>
                        <p>
                          You Have {currentUser.cart.length} Item
                          {currentUser.cart.length === 1 ? "" : "s"} in Your
                          Cart
                        </p>
                      </header>
                      <ul>
                        {currentUser.cart.map(cartItem => (
                          <CartItem cartItem={cartItem} key={cartItem.id} />
                        ))}
                      </ul>
                      <footer>
                        <p>{formatMoney(calcTotalPrice(currentUser.cart))}</p>
                        {currentUser.cart.length ? (
                          <TakeMoney>
                            <SweetButton>Checkout</SweetButton>
                          </TakeMoney>
                        ) : (
                          <SweetButton disabled>Add Some Items!</SweetButton>
                        )}
                      </footer>
                    </CartStyles>
                    <PageMask open={data.cartOpen} onClick={toggleCart} />
                  </>
                )}
              </Query>
            )}
          </Mutation>
        );
      }}
    </User>
  );
};

export default Cart;

// -------------------- Styles -------------------- //

const CartStyles = styled.div`
  padding: 20px;
  position: relative;
  background: white;
  position: fixed;
  height: 100%;
  top: 0;
  right: 0;
  width: 40%;
  min-width: 500px;
  bottom: 0;
  transform: translateX(100%);
  transition: all 0.3s;
  box-shadow: 0 0 10px 3px rgba(0, 0, 0, 0.2);
  z-index: 5;
  display: grid;
  grid-template-rows: auto 1fr auto;
  ${props => props.open && `transform: translateX(0);`};
  header {
    border-bottom: 5px solid ${({ theme }) => theme.black};
    margin-bottom: 2rem;
    padding-bottom: 2rem;
  }
  footer {
    border-top: 10px double ${({ theme }) => theme.black};
    margin-top: 2rem;
    padding-top: 2rem;
    display: grid;
    grid-template-columns: auto auto;
    align-items: center;
    font-size: 3rem;
    font-weight: 900;
    p {
      margin: 0;
    }
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    overflow: scroll;
    overflow-x: hidden;
  }
`;

const Supreme = styled.h3`
  background: ${({ theme }) => theme.red};
  color: white;
  display: inline-block;
  padding: 4px 5px;
  transform: skew(-3deg);
  margin: 0;
  font-size: 4rem;
`;

const CloseButton = styled.button`
  background: black;
  color: white;
  font-size: 3rem;
  border: 0;
  position: absolute;
  z-index: 2;
  right: 0;
`;

const SweetButton = styled.button`
  background: red;
  color: white;
  font-weight: 500;
  border: 0;
  border-radius: 0;
  text-transform: uppercase;
  font-size: 2rem;
  padding: 0.8rem 1.5rem;
  transform: skew(-2deg);
  display: inline-block;
  transition: all 0.5s;
  &[disabled] {
    opacity: 0.5;
  }
`;

const PageMask = styled.div`
  z-index: 4;
  position: fixed;
  top: 0;
  background-color: rgba(0, 0, 0, 0.5);
  width: 100vw;
  height: 100vh;
  display: ${props => (props.open ? "block" : "none")};
`;
