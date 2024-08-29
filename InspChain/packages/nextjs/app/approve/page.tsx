"use client";

import { useEffect, useState } from "react";
import { ContractList } from "./_components/ContractList";
import { NextPage } from "next";
import { useAccount } from "wagmi";
import { getContractDataByAddress } from "~~/utils/scaffold-eth/contractsData";

const Approve: NextPage = () => {
  const { address: loginAddress } = useAccount();
  const address = loginAddress || "0x0000000000000000000000000000000000000000";
  const [contractData, setContractData] = useState<{ bytecode: string; assembly: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getContractDataByAddress(address);
      setContractData(data);
    };

    fetchData();
  }, [address]);

  return <ContractList address={address} contractData={contractData} />;
};

export default Approve;
