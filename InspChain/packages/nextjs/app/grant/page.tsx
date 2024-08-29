import { GrantContracts } from "./_components/GrantContracts";
import { NextPage } from "next";

const Grant: NextPage = () => {
  return (
    <div>
      <GrantContracts filterKeyword={"Role"} />
    </div>
  );
};

export default Grant;
