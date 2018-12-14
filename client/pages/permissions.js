import PleaseSignIn from "../components/PleaseSignIn";
import PermissionsTable from "../components/PermissionsTable";

const Permissions = props => (
  <div>
    <PleaseSignIn>
      <PermissionsTable />
    </PleaseSignIn>
  </div>
);

export default Permissions;
