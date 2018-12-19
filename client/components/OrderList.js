import React, { Component } from "react";
import { Query } from "react-apollo";
import { formatDistance } from "date-fns";
import Link from "next/link";
import styled from "styled-components";

import Error from "./ErrorMessage";
import formatMoney from "../lib/formatMoney";
import { USER_ORDERS_QUERY } from "../GraphQL";

export default class OrderList extends Component {
  render() {
    return (
      <Query query={USER_ORDERS_QUERY}>
        {({ data, loading, error }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <Error error={error} />;
          const { orders } = data;
          return (
            <div>
              <h2>You have {orders.length} orders!</h2>
              <OrderUl>
                {orders.map(order => (
                  <StyledOrderItem>
                    <Link
                      href={{
                        pathname: "/order",
                        query: { id: order.id }
                      }}
                    >
                      <a>
                        <div className="order-meta">
                          <p>
                            {order.items.reduce(
                              (acc, order) => acc + order.quantity,
                              0
                            )}{" "}
                            Items
                          </p>
                          <p>{order.items.length} Products</p>
                          <p>
                            {formatDistance(order.createdAt, new Date())} Ago
                          </p>
                          <p>{formatMoney(order.total)}</p>
                        </div>
                        <div className="images">
                          {order.items.map(item => (
                            <img
                              key={item.id}
                              src={item.image}
                              alt={item.title}
                            />
                          ))}
                        </div>
                      </a>
                    </Link>
                  </StyledOrderItem>
                ))}
              </OrderUl>
            </div>
          );
        }}
      </Query>
    );
  }
}

// -------------------- Styles -------------------- //

const StyledOrderItem = styled.li`
  box-shadow: ${props => props.theme.boxShadow};
  list-style: none;
  padding: 2rem;
  border: 1px solid ${props => props.theme.offWhite};
  h2 {
    border-bottom: 2px solid red;
    margin-top: 0;
    margin-bottom: 2rem;
    padding-bottom: 2rem;
  }

  .images {
    display: grid;
    grid-gap: 10px;
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    margin-top: 1rem;
    img {
      height: 200px;
      object-fit: cover;
      width: 100%;
    }
  }
  .order-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(20px, 1fr));
    display: grid;
    grid-gap: 1rem;
    text-align: center;
    & > * {
      margin: 0;
      background: rgba(0, 0, 0, 0.03);
      padding: 1rem 0;
    }
    strong {
      display: block;
      margin-bottom: 1rem;
    }
  }
`;

const OrderUl = styled.ul`
  display: grid;
  grid-gap: 4rem;
  grid-template-columns: repeat(auto-fit, minmax(40%, 1fr));
`;
