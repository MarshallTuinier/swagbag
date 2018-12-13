import React, { Component } from "react";
import { Query } from "react-apollo";
import propTypes from "prop-types";

import { CURRENT_USER_QUERY } from "../GraphQL";

export default class User extends Component {
  render() {
    return (
      <Query {...this.props} query={CURRENT_USER_QUERY}>
        {payload => this.props.children(payload)}
      </Query>
    );
  }
}

User.propTypes = {
  children: propTypes.func.isRequired
};
