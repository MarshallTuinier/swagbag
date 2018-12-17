import React from "react";
import styled from "styled-components";

import formatMoney from "../lib/formatMoney";
import RemoveFromCart from "./RemoveFromCart";

const CartItem = props => {
  const { cartItem } = props;
  const { item } = cartItem;
  return (
    <StyledCartItem>
      <img width="100" src={item.image} alt={item.description} />
      <div className="cart-item-details">
        <h3>{item.title}</h3>
        <p>
          {formatMoney(item.price * cartItem.quantity)}
          {" - "}
          <em>
            {cartItem.quantity} &times; {formatMoney(item.price)} each
          </em>
        </p>
      </div>
      <RemoveFromCart id={cartItem.id} />
    </StyledCartItem>
  );
};

export default CartItem;

// -------------------- Styles -------------------- //

const StyledCartItem = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.lightGrey};
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  img {
    margin-right: 10px;
  }
  h3,
  p {
    margin: 0;
  }
`;
