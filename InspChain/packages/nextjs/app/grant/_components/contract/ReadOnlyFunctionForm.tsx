"use client";

import { useEffect, useState } from "react";
import { Abi, AbiFunction } from "abitype";
import { Address } from "viem";
import { useReadContract } from "wagmi";
import {
  ContractInput,
  displayTxResult,
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs,
  transformAbiFunction,
} from "~~/app/debug/_components/contract";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

type ReadOnlyFunctionFormProps = {
  contractAddress: Address;
  abiFunction: AbiFunction;
  inheritedFrom?: string;
  abi: Abi;
};

type DropdownOption = {
  value: string;
  label: string;
};

type DropdownProps = {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  filterCondition?: (option: DropdownOption) => boolean; // Optional condition for filtering options
};

const Dropdown = ({ value, onChange, options }: DropdownProps) => {
  return (
    <select className="select select-bordered" onChange={e => onChange(e.target.value)} value={value}>
      <option value="">선택하세요</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export const ReadOnlyFunctionForm = ({ contractAddress, abiFunction, abi }: ReadOnlyFunctionFormProps) => {
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(abiFunction));
  const [result, setResult] = useState<unknown>();
  const { targetNetwork } = useTargetNetwork();

  const { isFetching, refetch, error } = useReadContract({
    address: contractAddress,
    functionName: abiFunction.name,
    abi: abi,
    args: getParsedContractFunctionArgs(form),
    chainId: targetNetwork.id,
    query: {
      enabled: false,
      retry: false,
    },
  });

  useEffect(() => {
    if (error) {
      const parsedError = getParsedError(error);
      notification.error(parsedError);
    }
  }, [error]);

  const transformedFunction = transformAbiFunction(abiFunction);

  // Define your full options list
  const allOptions: DropdownOption[] = [
    { value: "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775", label: "Admin" },
    { value: "0x273dcf2136c7d8ef632bb8ef13dbca69a8f36fa620c7468671b3153d46a211c0", label: "Inspector" },
    { value: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", label: "김어드민" },
    { value: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", label: "김인스펙터" },
    { value: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", label: "김다영" },
    { value: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", label: "박재용" },
    { value: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", label: "이규용" },
    { value: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc", label: "이지선" },
  ];

  const inputElements = transformedFunction.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(abiFunction.name, input, inputIndex);
    const isDropdown = input.name === "role" || input.name === "account"; // FIXME: 조건에 맞는 입력 필드만 드롭다운 사용

    // Filter options based on input name
    const options: DropdownOption[] = isDropdown
      ? input.name === "role"
        ? allOptions.filter(option => ["Admin", "Inspector"].includes(option.label))
        : allOptions.filter(option => !["Admin", "Inspector"].includes(option.label))
      : allOptions;

    return (
      <div key={key} className="mb-4">
        <label className="block font-medium mb-1">{input.name}</label> {/* input.name을 드롭다운 위에 표시 */}
        {isDropdown ? (
          <Dropdown
            value={form[key] || ""}
            onChange={value => {
              setResult(undefined);
              setForm(prevForm => ({
                ...prevForm,
                [key]: value,
              }));
            }}
            options={options}
          />
        ) : (
          <ContractInput
            key={key}
            setForm={updatedFormValue => {
              setResult(undefined);
              setForm(updatedFormValue);
            }}
            form={form}
            stateObjectKey={key}
            paramType={input}
          />
        )}
      </div>
    );
  });

  return (
    <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
      <p className="font-medium my-0 break-words">{abiFunction.name}</p>
      {inputElements}
      <div className="flex flex-col md:flex-row justify-between gap-2 flex-wrap">
        <div className="flex-grow w-full md:max-w-[80%]">
          {result !== null && result !== undefined && (
            <div className="bg-secondary rounded-3xl text-sm px-4 py-1.5 break-words overflow-auto">
              <p className="font-bold m-0 mb-1">Result:</p>
              <pre className="whitespace-pre-wrap break-words">{displayTxResult(result, "sm")}</pre>
            </div>
          )}
        </div>
        <button
          className="btn btn-secondary btn-sm self-end md:self-start"
          onClick={async () => {
            const { data } = await refetch();
            setResult(data);
          }}
          disabled={isFetching}
        >
          {isFetching && <span className="loading loading-spinner loading-xs"></span>}
          실행 🚀
        </button>
      </div>
    </div>
  );
};
