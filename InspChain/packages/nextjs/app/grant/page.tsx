import { NextPage } from "next";
import { KHJDebugContracts } from "../debug/_components/KHJDebugContracts";

const Grant: NextPage = () => {
    return (
        <div>
           <KHJDebugContracts filterKeyword={"Role"} />
        </div>
    );
};

export default Grant;
