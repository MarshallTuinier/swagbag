import React, { Component } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { Mutation } from "react-apollo";

import Error from "./ErrorMessage";
import { UPDATE_PERMISSIONS_MUTATION } from "../GraphQL";

export default class UserRow extends Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array
    }).isRequired,
    possiblePermissions: PropTypes.array.isRequired
  };

  state = {
    permissions: this.props.user.permissions
  };

  handlePermissionChange = (event, updatePermissions) => {
    const checkbox = event.target;
    let updatedPermissions = [...this.state.permissions];

    // Add or Remove the permission
    if (checkbox.checked) {
      updatedPermissions.push(checkbox.value);
    } else {
      updatedPermissions = updatedPermissions.filter(
        permission => permission !== checkbox.value
      );
    }

    // Update state and the permissions
    this.setState({ permissions: updatedPermissions }, updatePermissions);
  };

  render() {
    const { user, possiblePermissions } = this.props;
    return (
      <Mutation
        mutation={UPDATE_PERMISSIONS_MUTATION}
        variables={{
          permissions: this.state.permissions,
          userId: this.props.user.id
        }}
      >
        {(updatePermissions, { error, loading }) => (
          <>
            <tr>
              <td>{user.name}</td>
              <td>{user.email}</td>
              {possiblePermissions.map(permission => (
                <td key={permission}>
                  <label htmlFor={`${user.id}-permission-${permission}`}>
                    <input
                      type="checkbox"
                      id={`${user.id}-permission-${permission}`}
                      checked={this.state.permissions.includes(permission)}
                      value={permission}
                      onChange={event =>
                        this.handlePermissionChange(event, updatePermissions)
                      }
                    />
                  </label>
                </td>
              ))}
              <td>
                <SweetButton
                  type="button"
                  disabled={loading}
                  onClick={updatePermissions}
                >
                  Updat{loading ? "ing" : "e"}
                </SweetButton>
              </td>
            </tr>
          </>
        )}
      </Mutation>
    );
  }
}

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
