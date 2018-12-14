import React from "react";
import { Query } from "react-apollo";
import styled from "styled-components";
import propTypes from "prop-types";

import Error from "./ErrorMessage";
import { ALL_USERS_QUERY } from "../GraphQL";
import UserRow from "./UserRow";

const possiblePermissions = [
  "ADMIN",
  "USER",
  "ITEMCREATE",
  "ITEMUPDATE",
  "ITEMDELETE",
  "PERMISSIONUPDATE"
];

const PermissionsTable = props => (
  <Query query={ALL_USERS_QUERY}>
    {({ data, loading, error }) => {
      if (loading) return <p>Loading...</p>;
      return (
        <div>
          <Error error={error} />
          <div>
            <h2>Manage Permissions</h2>
            {data && (
              <Table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    {possiblePermissions.map(permission => (
                      <th key={permission}>{permission}</th>
                    ))}
                    <th>↓</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map(user => (
                    <UserRow
                      key={user.id}
                      user={user}
                      possiblePermissions={possiblePermissions}
                    />
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </div>
      );
    }}
  </Query>
);

export default PermissionsTable;

// -------------------- Styles -------------------- //

const Table = styled.table`
  border-spacing: 0;
  width: 100%;
  border: 1px solid ${props => props.theme.offWhite};
  thead {
    font-size: 10px;
  }
  td,
  th {
    border-bottom: 1px solid ${({ theme }) => theme.offWhite};
    border-right: ${({ theme }) => theme.offWhite};
    position: relative;
    padding: 5px;
    &:last-child {
      border-right: none;
      width: 150px;
      button {
        width: 100%;
      }
    }
    label {
      padding: 10px 5px;
      display: block;
      height: 100%;
    }
  }

  tr {
    &:hover {
      background: ${({ theme }) => theme.offWhite};
    }
  }
`;
