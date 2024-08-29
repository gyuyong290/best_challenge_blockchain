"use client";

import { useEffect, useState } from "react";
import { UserRole } from "../../../../constants/GlobalConstants";
import { useLocalStorage } from "usehooks-ts";
import { useAccount } from "wagmi";
import { BarsArrowUpIcon } from "@heroicons/react/20/solid";
import { ContractUI } from "~~/app/grant/_components/contract";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import { getAllContracts } from "~~/utils/scaffold-eth/contractsData";

const selectedContractStorageKey = "scaffoldEth2.selectedContract";
const contractsData = getAllContracts();
const contractNames = Object.keys(contractsData) as ContractName[];

type GrantContractsProps = {
  filterKeyword?: string; // 필터링 키워드를 받는 props
};

export function GrantContracts({ filterKeyword }: GrantContractsProps) {
  const [selectedContract, setSelectedContract] = useLocalStorage<ContractName>(
    selectedContractStorageKey,
    contractNames[0],
    { initializeWithValue: false },
  );

  const { address: loginAddress } = useAccount();
  const [filteredContractNames, setFilteredContractNames] = useState<ContractName[]>([]);

  useEffect(() => {
    async function fetchFilteredContracts() {
      if (loginAddress) {
        const filteredContracts: ContractName[] = [];
        await Promise.all(
          contractNames.map(async contractName => {
            const roleAddresses = UserRole[contractName];
            if (roleAddresses) {
              const isAdmin = roleAddresses.admin === loginAddress;
              // const isInspector = roleAddresses.inspector === loginAddress;

              // if (isAdmin || isInspector) {
              //   filteredContracts.push(contractName);
              // }
              if (isAdmin) {
                filteredContracts.push(contractName);
              }
            }
          }),
        );
        setFilteredContractNames(filteredContracts);
        // Ensure selectedContract is in the filtered list
        if (!filteredContracts.includes(selectedContract)) {
          setSelectedContract(filteredContracts[0] || null);
        }
      } else {
        setFilteredContractNames([]);
      }
    }

    fetchFilteredContracts();
  }, [loginAddress, selectedContract, setSelectedContract]);

  useEffect(() => {
    if (!filteredContractNames.includes(selectedContract)) {
      setSelectedContract(filteredContractNames[0] || null);
    }
  }, [filteredContractNames, selectedContract, setSelectedContract]);

  return (
    <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
      {contractNames.length === 0 ? (
        <p className="text-3xl mt-14">No contracts found!</p>
      ) : (
        <>
          {filteredContractNames.length > 1 && (
            <div className="flex flex-row gap-2 w-full max-w-7xl pb-1 px-6 lg:px-10 flex-wrap">
              {filteredContractNames.map(contractName => (
                <button
                  className={`btn btn-secondary btn-sm font-light hover:border-transparent ${
                    contractName === selectedContract
                      ? "bg-base-300 hover:bg-base-300 no-animation"
                      : "bg-base-100 hover:bg-secondary"
                  }`}
                  key={contractName}
                  onClick={() => setSelectedContract(contractName)}
                >
                  {contractName}
                  {contractsData[contractName].external && (
                    <span className="tooltip tooltip-top tooltip-accent" data-tip="External contract">
                      <BarsArrowUpIcon className="h-4 w-4 cursor-pointer" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          {filteredContractNames.map(contractName => (
            <ContractUI
              key={contractName}
              contractName={contractName}
              className={contractName === selectedContract ? "" : "hidden"}
              filterKeyword={filterKeyword}
            />
          ))}
        </>
      )}
    </div>
  );
}
