import SignupForm from "../components/Signup";
import styled from "styled-components";

const signup = props => (
  <Columns>
    <SignupForm />
    <SignupForm />
    <SignupForm />
  </Columns>
);

export default signup;

// -------------------- Styles -------------------- //

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`;
