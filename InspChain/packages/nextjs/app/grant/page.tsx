import { NextPage } from "next";
import { DebugContracts } from "../debug/_components/DebugContracts";

const Grant: NextPage = () => {
    return (
        <div>
           <DebugContracts filterKeyword={"Role"} />
        </div>
    );
};

export default Grant;
