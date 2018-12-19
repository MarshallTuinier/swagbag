import PleaseSignIn from "../components/PleaseSignIn";
import OrderList from "../components/OrderList";

const ordersPage = props => (
  <div>
    <PleaseSignIn>
      <OrderList />
    </PleaseSignIn>
  </div>
);

export default ordersPage;
