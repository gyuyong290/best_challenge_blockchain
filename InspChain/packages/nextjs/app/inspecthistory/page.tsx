"use client";

import { useEffect, useState } from "react";
import { UserRole } from "../../../constants/GlobalConstants";
import { ContractList } from "./_components/ContractList";
import { NextPage } from "next";
import { useAccount } from "wagmi";
import { BarsArrowUpIcon } from "@heroicons/react/20/solid";
import { getAllContracts, getContractDataByAddress } from "~~/utils/scaffold-eth/contractsData";

const Inspecthistory: NextPage = () => {
  const { address: loginAddress } = useAccount();
  const [filteredContractNames, setFilteredContractNames] = useState<string[]>([]);
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const [contractData, setContractData] = useState<{ bytecode: string; assembly: string } | null>(null);
  const contractsData = getAllContracts();
  const contractNames = Object.keys(contractsData) as string[];

  useEffect(() => {
    async function fetchFilteredContracts() {
      if (loginAddress) {
        const filteredContracts: string[] = [];
        await Promise.all(
          contractNames.map(async contractName => {
            const roleAddresses = UserRole[contractName];
            if (roleAddresses) {
              const isAdmin = roleAddresses.admin === loginAddress;
              const isInspector = roleAddresses.inspector === loginAddress;

              if (isAdmin || isInspector) {
                filteredContracts.push(contractName);
              }
            }
          }),
        );
        setFilteredContractNames(filteredContracts);
        // Ensure selectedContract is in the filtered list
        if (!filteredContracts.includes(selectedContract || "")) {
          setSelectedContract(filteredContracts[0] || null);
        }
      } else {
        setFilteredContractNames([]);
        setSelectedContract(null);
      }
    }

    fetchFilteredContracts();
  }, [loginAddress, selectedContract]);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedContract) {
        const data = await getContractDataByAddress(loginAddress || "0x0000000000000000000000000000000000000000");
        setContractData(data);
      } else {
        setContractData(null);
      }
    };

    fetchData();
  }, [loginAddress, selectedContract]);

  return (
    <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
      {filteredContractNames.length === 0 ? (
        <p className="text-3xl mt-14">No contracts found!</p>
      ) : (
        <>
          <div className="flex flex-row gap-2 w-full max-w-7xl pb-1 px-6 lg:px-10 flex-wrap">
            {filteredContractNames.map(contractName => {
              const roleAddresses = UserRole[contractName];
              const isAdmin = roleAddresses?.admin === loginAddress;
              const isInspector = roleAddresses?.inspector === loginAddress;

              let roleText = "";
              if (isAdmin) {
                roleText = "관리담당자";
              } else if (isInspector) {
                roleText = "점검자";
              }

              const targetText = roleAddresses?.target ? `${roleAddresses.target}` : "";

              return (
                <button
                  key={contractName}
                  className={`btn btn-secondary btn-sm font-light hover:border-transparent ${
                    contractName === selectedContract
                      ? "bg-base-300 hover:bg-base-300 no-animation"
                      : "bg-base-100 hover:bg-secondary"
                  }`}
                  onClick={() => setSelectedContract(contractName)}
                >
                  {targetText} : {roleText}
                  {contractsData[contractName].external && (
                    <span className="tooltip tooltip-top tooltip-accent" data-tip="External contract">
                      <BarsArrowUpIcon className="h-4 w-4 cursor-pointer" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {selectedContract && (
            <ContractList
              address={loginAddress || "0x0000000000000000000000000000000000000000"}
              contractData={contractData}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Inspecthistory;
