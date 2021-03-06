import Link from "next/link";
import styled from "styled-components";
import { Mutation } from "react-apollo";

import { TOGGLE_CART_MUTATION } from "../GraphQL";
import User from "./User";
import Signout from "./Signout";
import CartCount from "./CartCount";

const Nav = () => (
  <User>
    {({ data: { currentUser } }) => (
      <StyledNav data-test="nav">
        <Link href="/items">
          <a>Shop</a>
        </Link>
        {currentUser && (
          <>
            <Link href="/sell">
              <a>Sell</a>
            </Link>
            <Link href="/orders">
              <a>Orders</a>
            </Link>
            <Link href="/account">
              <a>Account</a>
            </Link>
            <Signout />
            <Mutation mutation={TOGGLE_CART_MUTATION}>
              {toggleCart => (
                <button onClick={toggleCart}>
                  My Cart{" "}
                  <CartCount
                    count={currentUser.cart.reduce(
                      (acc, cartItem) => acc + cartItem.quantity,
                      0
                    )}
                  />
                </button>
              )}
            </Mutation>
          </>
        )}
        {!currentUser && (
          <Link href="/signup">
            <a>Signup</a>
          </Link>
        )}
      </StyledNav>
    )}
  </User>
);

// -------------------- Styles -------------------- //

const StyledNav = styled.ul`
  margin: 0;
  padding: 0;
  display: flex;
  justify-self: end;
  font-size: 2rem;
  a,
  button {
    padding: 1rem 3rem;
    display: flex;
    align-items: center;
    position: relative;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 1em;
    background: none;
    border: 0;
    cursor: pointer;
    color: ${({ theme }) => theme.black};
    @media (max-width: 700px) {
      font-size: 10px;
      padding: 0 10px;
    }
    &:before {
      content: "";
      width: 2px;
      background: ${props => props.theme.lightGrey};
      height: 100%;
      left: 0;
      position: absolute;
      transform: skew(-20deg);
      top: 0;
      bottom: 0;
    }
    &:after {
      height: 2px;
      background: red;
      content: "";
      width: 0;
      position: absolute;
      transform: translateX(-50%);
      transition: width 0.2s;
      transition-timing-function: cubic-bezier(1, -0.65, 0, 2.31);
      left: 50%;
      margin-top: 2rem;
    }
    &:hover,
    &:focus {
      outline: none;
      &:after {
        width: calc(100% - 60px);
      }
      @media (max-width: 700px) {
        width: calc(100% - 10px);
      }
    }
  }
  @media (max-width: 1300px) {
    border-top: 1px solid ${props => props.theme.lightGrey};
    width: 100%;
    justify-content: center;
    font-size: 1.5rem;
  }
`;

export default Nav;
