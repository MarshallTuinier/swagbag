import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Link from "next/link";

import DeleteItem from "./DeleteItem";
import formatMoney from "../lib/formatMoney";
import AddToCart from "./AddToCart";

export default class Item extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired
  };

  render() {
    const { item } = this.props;
    return (
      <StyledItem>
        {item.image && <img src={item.image} alt={item.title} />}
        <Title>
          <Link
            href={{
              pathname: "/item",
              query: { id: item.id }
            }}
          >
            <a>{item.title}</a>
          </Link>
        </Title>
        <PriceTag>{formatMoney(item.price)}</PriceTag>
        <p>{item.description}</p>
        <div className="buttonList">
          <Link
            href={{
              pathname: "update",
              query: { id: item.id }
            }}
          >
            <a>Edit 📝</a>
          </Link>
          <AddToCart id={item.id} />
          <DeleteItem id={item.id}>Delete This Item 🚫</DeleteItem>
        </div>
      </StyledItem>
    );
  }
}

// -------------------- Styles -------------------- //

const Title = styled.h3`
  margin: 0 1rem;
  text-align: center;
  transform: skew(-5deg) rotate(-1deg);
  margin-top: -3rem;
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
  a {
    background: ${({ theme }) => theme.red};
    display: inline;
    line-height: 1.3;
    font-size: 4rem;
    text-align: center;
    color: white;
    padding: 0 1rem;
  }
`;

const StyledItem = styled.div`
  background: white;
  border: 1px solid ${({ theme }) => theme.offWhite};
  box-shadow: ${({ theme }) => theme.boxShadow};
  position: relative;
  display: flex;
  flex-direction: column;
  img {
    width: 100%;
    height: 400px;
    object-fit: cover;
  }
  p {
    font-size: 12px;
    line-height: 2;
    font-weight: 300;
    flex-grow: 1;
    padding: 0 3rem;
    font-size: 1.5rem;
  }
  .buttonList {
    display: grid;
    width: 100%;
    border-top: 1px solid ${({ theme }) => theme.lightGrey};
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    grid-gap: 1px;
    background: ${({ theme }) => theme.lightGrey};
    & > * {
      background: white;
      border: 0;
      font-size: 1rem;
      padding: 1rem;

      &:hover {
        cursor: pointer;
      }
    }
  }
`;

const PriceTag = styled.span`
  background: ${({ theme }) => theme.red};
  transform: rotate(3deg);
  color: white;
  font-weight: 600;
  padding: 5px;
  line-height: 1;
  font-size: 3rem;
  display: inline-block;
  position: absolute;
  top: -3px;
  right: -3px;
`;
