import React, { Component } from "react";
import styled from "styled-components";
import { Query } from "react-apollo";
import Head from "next/head";
import Link from "next/link";

import Error from "./ErrorMessage";
import { PAGINATION_QUERY } from "../GraphQL";
import { perPage } from "../config";

const Pagination = ({ page }) => {
  return (
    <Query query={PAGINATION_QUERY}>
      {({ error, loading, data }) => {
        if (error) return <Error error={error} />;
        if (loading) return <p>Loading...</p>;
        const count = data.itemsConnection.aggregate.count;
        const pages = Math.ceil(count / perPage);
        return (
          <StyledPagination data-test="pagination">
            <Head>
              <title>
                SwagBag | Page {page} of {pages}
              </title>
            </Head>
            <Link
              prefetch
              href={{
                pathname: "items",
                query: { page: page - 1 }
              }}
            >
              <a className="prev" aria-disabled={page <= 1}>
                ← Prev
              </a>
            </Link>
            <p>
              Page {page} of <span className="total-pages">{pages}</span>
            </p>
            <p>{count} Items Total</p>
            <Link
              prefetch
              href={{
                pathname: "items",
                query: { page: page + 1 }
              }}
            >
              <a className="next" aria-disabled={page >= pages}>
                Next →
              </a>
            </Link>
          </StyledPagination>
        );
      }}
    </Query>
  );
};

export default Pagination;

// -------------------- Styles -------------------- //

const StyledPagination = styled.div`
  text-align: center;
  display: inline-grid;
  grid-template-columns: repeat(4, auto);
  align-items: stretch;
  justify-content: center;
  align-content: center;
  margin: 2rem 0;
  border: 1px solid ${props => props.theme.lightGrey};
  border-radius: 10px;
  & > * {
    margin: 0;
    padding: 15px 30px;
    border-right: 1px solid ${props => props.theme.lightGrey};
    &:last-child {
      border-right: 0;
    }
  }
  a[aria-disabled="true"] {
    color: grey;
    pointer-events: none;
  }
`;
