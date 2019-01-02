import { mount } from "enzyme";
import { ApolloConsumer } from "react-apollo";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";
import toJSON from "enzyme-to-json";
import AddToCart from "../components/AddToCart";
import { ADD_TO_CART_MUTATION, CURRENT_USER_QUERY } from "../GraphQL";
import { fakeUser, fakeCartItem } from "../lib/testUtils";

const user = fakeUser();
const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { currentUser: { ...user, cart: [] } } }
  },
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { currentUser: { ...user, cart: [fakeCartItem()] } } }
  },
  {
    request: { query: ADD_TO_CART_MUTATION, variables: { id: "abc123" } },
    result: {
      data: {
        addToCart: {
          ...fakeCartItem(),
          quantity: 1
        }
      }
    }
  }
];

describe("<AddToCart />", () => {
  it("renders and matches the snapshot", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <AddToCart id="abc123" />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(toJSON(wrapper.find("button"))).toMatchSnapshot();
  });

  it("adds an item to the cart when clicked", async () => {
    let apolloClient;
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ApolloConsumer>
          {client => {
            apolloClient = client;
            return <AddToCart id="abc123" />;
          }}
        </ApolloConsumer>
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    const {
      data: { currentUser }
    } = await apolloClient.query({ query: CURRENT_USER_QUERY });
    expect(currentUser.cart).toHaveLength(0);
    // Add an item to the cart
    wrapper.find("button").simulate("click");
    await wait();
    // Check if the item is in the cart
    const {
      data: { currentUser: updatedUser }
    } = await apolloClient.query({ query: CURRENT_USER_QUERY });
    expect(updatedUser.cart).toHaveLength(1);
  });

  it("changes from add to adding when clicked", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <AddToCart id="abc123" />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.text()).toContain("Add To Cart");
    wrapper.find("button").simulate("click");
    expect(wrapper.text()).toContain("Adding To Cart");
  });
});
