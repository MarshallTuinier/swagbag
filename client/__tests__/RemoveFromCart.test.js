import { mount } from "enzyme";
import { ApolloConsumer } from "react-apollo";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";
import toJSON from "enzyme-to-json";
import RemoveFromCart from "../components/RemoveFromCart";
import { REMOVE_FROM_CART_MUTATION, CURRENT_USER_QUERY } from "../GraphQL";
import { fakeUser, fakeCartItem } from "../lib/testUtils";

global.alert = console.log;

const user = fakeUser();
const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: { currentUser: { ...user, cart: [fakeCartItem({ id: "abc123" })] } }
    }
  },
  {
    request: { query: REMOVE_FROM_CART_MUTATION, variables: { id: "abc123" } },
    result: {
      data: {
        removeFromCart: {
          __typename: "CartItem",
          id: "abc123"
        }
      }
    }
  }
];

describe("<RemoveFromCart />", () => {
  it("renders and matches snapshot", async () => {
    const wrapper = mount(
      <MockedProvider>
        <RemoveFromCart id="abc123" />
      </MockedProvider>
    );
    expect(toJSON(wrapper.find("button"))).toMatchSnapshot();
  });

  it("removes the item from cart", async () => {
    let apolloClient;
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ApolloConsumer>
          {client => {
            apolloClient = client;
            return <RemoveFromCart id="abc123" />;
          }}
        </ApolloConsumer>
      </MockedProvider>
    );

    const {
      data: { currentUser }
    } = await apolloClient.query({ query: CURRENT_USER_QUERY });
    expect(currentUser.cart).toHaveLength(1);
    expect(currentUser.cart[0].item.price).toBe(5000);
    wrapper.find("button").simulate("click");
    await wait();
    const {
      data: { currentUser: updatedUser }
    } = await apolloClient.query({ query: CURRENT_USER_QUERY });
    expect(updatedUser.cart).toHaveLength(0);
  });
});
