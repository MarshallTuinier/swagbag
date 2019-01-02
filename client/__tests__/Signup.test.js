import { mount } from "enzyme";
import wait from "waait";
import { ApolloConsumer } from "react-apollo";
import { MockedProvider } from "react-apollo/test-utils";
import toJSON from "enzyme-to-json";
import { SIGNUP_MUTATION, CURRENT_USER_QUERY } from "../GraphQL";
import SignupForm from "../components/SignupForm";
import { fakeUser } from "../lib/testUtils";

// Helper function to simulate typing in a form
const type = (wrapper, name, value) => {
  wrapper.find(`input[name="${name}"]`).simulate("change", {
    target: { name, value }
  });
};

const user = fakeUser();

const mocks = [
  // Signup mutation mock
  {
    request: {
      query: SIGNUP_MUTATION,
      variables: {
        email: user.email,
        name: user.name,
        password: "test",
        confirmPassword: "test"
      }
    },
    result: {
      data: {
        signup: {
          __typename: "User",
          id: "abc123",
          email: user.email,
          name: user.name
        }
      }
    }
  },
  // Current user mock
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: {
        currentUser: {
          ...user
        }
      }
    }
  }
];

describe("<SignupForm />", async () => {
  it("renders and matches snapshot", async () => {
    const wrapper = mount(
      <MockedProvider>
        <SignupForm />
      </MockedProvider>
    );
    expect(toJSON(wrapper.find("form"))).toMatchSnapshot();
  });

  it("calls the mutation properly", async () => {
    let apolloClient;
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ApolloConsumer>
          {client => {
            apolloClient = client;
            return <SignupForm />;
          }}
        </ApolloConsumer>
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    type(wrapper, "name", user.name);
    type(wrapper, "email", user.email);
    type(wrapper, "password", "test");
    type(wrapper, "confirmPassword", "test");
    wrapper.update();
    wrapper.find("form").simulate("submit");
    await wait();
    // Query the user out of the apollo client
    const currentUser = await apolloClient.query({ query: CURRENT_USER_QUERY });
    expect(currentUser.data.currentUser).toMatchObject(user);
  });
});
