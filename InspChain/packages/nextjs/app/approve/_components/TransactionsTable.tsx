// useReadContract 훅 가져오기
import { useEffect } from "react";
import { useReadContract, useWriteContract } from "wagmi";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import deployedContracts from "~~/contracts/deployedContracts";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { TransactionsTableProps } from "~~/utils/scaffold-eth/";

export const TransactionsTable = ({ blocks }: TransactionsTableProps) => {
  const { targetNetwork } = useTargetNetwork();
  const { data: result, isPending, writeContractAsync } = useWriteContract();
  const writeTxn = useTransactor();
  const contractAddress = blocks[0]?.transactions[0].to || "0x0000000000000000000000000000000000000000";

  const handleApprove = async (index: number) => {
    if (writeContractAsync) {
      try {
        const makeWriteWithParams = () =>
          writeContractAsync({
            address: contractAddress,
            functionName: "judgeInspection",
            abi: deployedContracts[31337].InspChain.abi,
            args: [BigInt(index), "Approved", 1],
          });
        await writeTxn(makeWriteWithParams);
      } catch (e: any) {
        console.error("⚡️ ~ file: WriteOnlyFunctionForm.tsx:handleWrite ~ error", e);
      }
    }
  };
  const handleReject = async (index: number) => {
    if (writeContractAsync) {
      try {
        const makeWriteWithParams = () =>
          writeContractAsync({
            address: contractAddress,
            functionName: "judgeInspection",
            abi: deployedContracts[31337].InspChain.abi,
            args: [BigInt(index), "Rejected", 2],
          });
        await writeTxn(makeWriteWithParams);
      } catch (e: any) {
        console.error("⚡️ ~ file: WriteOnlyFunctionForm.tsx:handleWrite ~ error", e);
      }
    }
  };

  // useReadContract 훅 설정
  const { refetch, data } = useReadContract({
    address: contractAddress,
    functionName: "getAllInspections",
    abi: deployedContracts[31337].InspChain.abi,
    chainId: targetNetwork.id,
    query: {
      enabled: false,
      retry: false,
    },
  });

  let inspections = data;
  useEffect(() => {
    refetch().then(res => {
      if (res.data) {
        inspections = res.data;
      }
    });
  }, [contractAddress]); // 빈 배열을 사용하여 컴포넌트 마운트 시 한 번만 실행

  console.log(inspections);

  return (
    <div className="flex justify-center px-4 md:px-0">
      <div className="overflow-x-auto w-full shadow-2xl rounded-xl">
        <table className="table text-xl bg-base-100 table-zebra w-full md:table-md table-sm">
          <thead>
            <tr className="rounded-xl text-sm text-base-content">
              <th className="bg-primary">점검 유형</th>
              <th className="bg-primary">점검자</th>
              <th className="bg-primary">승인</th>
            </tr>
          </thead>
          <tbody>
            {inspections?.map((inspection, index) => {
              const judgementState = inspection.judgeHistory.state;
              if (judgementState !== 0) return;
              return (
                <tr key={index} className="hover text-sm">
                  {contractAddress && (
                    <>
                      <td>{inspection.inspectionType}</td>
                      <td>{inspection.inspector}</td>
                      <td className="flex items-center">
                        <CheckCircleIcon
                          className="ml-1.5 text-xl font-normal text-green-600 h-5 w-5 cursor-pointer"
                          aria-hidden="true"
                          onClick={() => {
                            handleApprove(index);
                          }}
                        />
                        <XCircleIcon
                          className="ml-1.5 text-xl font-normal text-red-600 h-5 w-5 cursor-pointer"
                          aria-hidden="true"
                          onClick={() => {
                            handleReject(index);
                          }}
                        />
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
