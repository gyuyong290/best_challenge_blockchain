import { ReadOnlyFunctionForm } from "./ReadOnlyFunctionForm";
import { Abi, AbiFunction } from "abitype";
import { Contract, ContractName, GenericContract, InheritedFunctions } from "~~/utils/scaffold-eth/contract";

type ContractReadMethodsProps = {
  deployedContractData: Contract<ContractName>;
  filterKeyword?: string; // 필터 키워드 추가
};

export const ContractReadMethods = ({
  deployedContractData,
  filterKeyword = "", // 기본값 설정
}: ContractReadMethodsProps) => {
  if (!deployedContractData) {
    return null;
  }

  const functionsToDisplay = (
    ((deployedContractData.abi || []) as Abi).filter(part => part.type === "function") as AbiFunction[]
  )
    .filter(fn => {
      const isQueryableWithParams =
        (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length > 0;
      const matchesFilter = !filterKeyword || fn.name.toLowerCase().includes(filterKeyword.toLowerCase());
      const isgetroleadmin = fn.name !== "getRoleAdmin"; // renounceRole 필터링
      return isQueryableWithParams && matchesFilter && isgetroleadmin;
    })
    .map(fn => {
      return {
        fn,
        inheritedFrom: ((deployedContractData as GenericContract)?.inheritedFunctions as InheritedFunctions)?.[fn.name],
      };
    })
    .sort((a, b) => (b.inheritedFrom ? b.inheritedFrom.localeCompare(a.inheritedFrom) : 1));

  if (!functionsToDisplay.length) {
    return <>No read methods</>;
  }

  return (
    <>
      {functionsToDisplay.map(({ fn, inheritedFrom }) => (
        <ReadOnlyFunctionForm
          abi={deployedContractData.abi as Abi}
          contractAddress={deployedContractData.address}
          abiFunction={fn}
          key={fn.name}
          inheritedFrom={inheritedFrom}
        />
      ))}
    </>
  );
};
