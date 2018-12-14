import React, { Component } from "react";
import { Query } from "react-apollo";

import { CURRENT_USER_QUERY } from "../GraphQL";
import SigninForm from "./SigninForm";

const PleaseSignIn = props => (
  <Query query={CURRENT_USER_QUERY}>
    {({ data, loading }) => {
      if (loading) return <p>Loading...</p>;
      if (!data.currentUser) {
        return (
          <div>
            <p>Please Sign In before Continuing</p>
            <SigninForm />
          </div>
        );
      }
      return props.children;
    }}
  </Query>
);

export default PleaseSignIn;
