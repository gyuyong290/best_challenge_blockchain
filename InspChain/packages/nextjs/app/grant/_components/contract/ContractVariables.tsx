import { DisplayVariable } from "./DisplayVariable";
import { Abi, AbiFunction } from "abitype";
import { Contract, ContractName, GenericContract, InheritedFunctions } from "~~/utils/scaffold-eth/contract";

export const ContractVariables = ({
  refreshDisplayVariables,
  deployedContractData,
  filterKeywords = [], // default to an empty array if no filterKeywords are provided
}: {
  refreshDisplayVariables: boolean;
  deployedContractData: Contract<ContractName>;
  filterKeywords?: string[]; // Changed to an array of strings
}) => {
  if (!deployedContractData) {
    return null;
  }

  const functionsToDisplay = (
    (deployedContractData.abi as Abi).filter(part => part.type === "function") as AbiFunction[]
  )
    .filter(fn => {
      const isQueryableWithNoParams =
        (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length === 0;
      const isNotDefaultAdminRole = fn.name !== "DEFAULT_ADMIN_ROLE"; // DEFAULT_ADMIN_ROLE 필터링
      const matchesFilter =
        filterKeywords.length === 0 ||
        filterKeywords.some(keyword => fn.name.toLowerCase().includes(keyword.toLowerCase()));
      return isQueryableWithNoParams && isNotDefaultAdminRole && matchesFilter;
    })
    .map(fn => {
      return {
        fn,
        inheritedFrom: ((deployedContractData as GenericContract)?.inheritedFunctions as InheritedFunctions)?.[fn.name],
      };
    })
    .sort((a, b) => (b.inheritedFrom ? b.inheritedFrom.localeCompare(a.inheritedFrom) : 1));

  if (!functionsToDisplay.length) {
    return <>No contract variables</>;
  }

  return (
    <>
      {functionsToDisplay.map(({ fn, inheritedFrom }) => (
        <DisplayVariable
          abi={deployedContractData.abi as Abi}
          abiFunction={fn}
          contractAddress={deployedContractData.address}
          key={fn.name}
          refreshDisplayVariables={refreshDisplayVariables}
          inheritedFrom={inheritedFrom}
        />
      ))}
    </>
  );
};
