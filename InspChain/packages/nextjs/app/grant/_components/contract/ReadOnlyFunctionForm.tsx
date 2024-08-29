"use client";

import { useEffect, useState } from "react";
import { User } from "../../../../../constants/User";
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

const ROLE_ADMIN = "Admin";
const ROLE_INSPECTOR = "Inspector";

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

  // User 객체에서 키와 값을 추출해 드롭다운 옵션을 생성
  const userOptions: DropdownOption[] = Object.entries(User).map(([key, value]) => ({
    value: value,
    label: key,
  }));

  // 기존 옵션 리스트의 0번과 1번 인덱스에 "Admin"과 "Inspector"를 추가
  const allOptions: DropdownOption[] = [
    { value: "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775", label: ROLE_ADMIN },
    { value: "0x273dcf2136c7d8ef632bb8ef13dbca69a8f36fa620c7468671b3153d46a211c0", label: ROLE_INSPECTOR },
    ...userOptions, // User 객체로부터 추출한 나머지 옵션들 추가
  ];

  const inputElements = transformedFunction.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(abiFunction.name, input, inputIndex);
    const isDropdown = input.name === "role" || input.name === "account"; // FIXME: 조건에 맞는 입력 필드만 드롭다운 사용

    // Filter options based on input name
    const options: DropdownOption[] = isDropdown
      ? input.name === "role"
        ? allOptions.filter(option => [ROLE_ADMIN, ROLE_INSPECTOR].includes(option.label))
        : allOptions.filter(option => ![ROLE_ADMIN, ROLE_INSPECTOR].includes(option.label))
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
