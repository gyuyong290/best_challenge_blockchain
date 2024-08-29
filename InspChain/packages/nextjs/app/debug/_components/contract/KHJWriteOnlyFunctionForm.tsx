"use client";

import { useEffect, useState } from "react";
import { Abi, AbiFunction } from "abitype";
import { Address, TransactionReceipt } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import {
  ContractInput,
  TxReceipt,
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs,
  transformAbiFunction,
} from "~~/app/debug/_components/contract";
import { IntegerInput } from "~~/components/scaffold-eth";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

type WriteOnlyFunctionFormProps = {
  abi: Abi;
  abiFunction: AbiFunction;
  onChange: () => void;
  contractAddress: Address;
  inheritedFrom?: string;
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

export const KHJWriteOnlyFunctionForm = ({
  abi,
  abiFunction,
  onChange,
  contractAddress,
  inheritedFrom,
}: WriteOnlyFunctionFormProps) => {
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(abiFunction));
  const [txValue, setTxValue] = useState<string | bigint>("");
  const { chain } = useAccount();
  const writeTxn = useTransactor();
  const { targetNetwork } = useTargetNetwork();
  const writeDisabled = !chain || chain?.id !== targetNetwork.id;

  const { data: result, isPending, writeContractAsync } = useWriteContract();

  const handleWrite = async () => {
    if (writeContractAsync) {
      try {
        const makeWriteWithParams = () =>
          writeContractAsync({
            address: contractAddress,
            functionName: abiFunction.name,
            abi: abi,
            args: getParsedContractFunctionArgs(form),
            value: BigInt(txValue),
          });
        await writeTxn(makeWriteWithParams);
        onChange();
      } catch (e: any) {
        console.error("⚡️ ~ file: WriteOnlyFunctionForm.tsx:handleWrite ~ error", e);
      }
    }
  };

  const [displayedTxResult, setDisplayedTxResult] = useState<TransactionReceipt>();
  const { data: txResult } = useWaitForTransactionReceipt({
    hash: result,
  });
  useEffect(() => {
    setDisplayedTxResult(txResult);
  }, [txResult]);

  // TODO use `useMemo` to optimize also update in ReadOnlyFunctionForm
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

  const inputs = transformedFunction.inputs.map((input, inputIndex) => {
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
              setDisplayedTxResult(undefined);
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
              setDisplayedTxResult(undefined);
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
  const zeroInputs = inputs.length === 0 && abiFunction.stateMutability !== "payable";

  return (
    <div className="py-5 space-y-3 first:pt-0 last:pb-1">
      <div className={`flex gap-3 ${zeroInputs ? "flex-row justify-between items-center" : "flex-col"}`}>
        <p className="font-medium my-0 break-words">{abiFunction.name}</p>
        {inputs}
        {abiFunction.stateMutability === "payable" ? (
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center ml-2">
              <span className="text-xs font-medium mr-2 leading-none">payable value</span>
              <span className="block text-xs font-extralight leading-none">wei</span>
            </div>
            <IntegerInput
              value={txValue}
              onChange={updatedTxValue => {
                setDisplayedTxResult(undefined);
                setTxValue(updatedTxValue);
              }}
              placeholder="value (wei)"
            />
          </div>
        ) : null}
        <div className="flex justify-between gap-2">
          {!zeroInputs && (
            <div className="flex-grow basis-0">
              {displayedTxResult ? <TxReceipt txResult={displayedTxResult} /> : null}
            </div>
          )}
          <div
            className={`flex ${
              writeDisabled &&
              "tooltip before:content-[attr(data-tip)] before:right-[-10px] before:left-auto before:transform-none"
            }`}
            data-tip={`${writeDisabled && "Wallet not connected or in the wrong network"}`}
          >
            <button className="btn btn-secondary btn-sm" disabled={writeDisabled || isPending} onClick={handleWrite}>
              {isPending && <span className="loading loading-spinner loading-xs"></span>}
              실행 ⚡️
            </button>
          </div>
        </div>
      </div>
      {zeroInputs && txResult ? (
        <div className="flex-grow basis-0">
          <TxReceipt txResult={txResult} />
        </div>
      ) : null}
    </div>
  );
};
