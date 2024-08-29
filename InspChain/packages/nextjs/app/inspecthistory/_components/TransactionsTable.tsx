// useReadContract 훅 가져오기
import { useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { TransactionsTableProps } from "~~/utils/scaffold-eth/";

export const TransactionsTable = ({ blocks }: TransactionsTableProps) => {
  const { targetNetwork } = useTargetNetwork();

  // const contractAddress = blocks[0]?.transactions[0].to;
  const contractAddress = blocks[0]?.transactions[0].to || "0x0000000000000000000000000000000000000000";
  const { address } = useAccount();

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
              <th className="bg-primary">승인 여부</th>
            </tr>
          </thead>
          <tbody>
            {inspections?.map((inspection, index) => {
              // if (inspection.inspector !== address) return;
              const judgementState = inspection.judgeHistory.state;
              const judgement = judgementState ? (judgementState === 1 ? "승인 완료" : "반려") : "대기 중";
              return (
                <tr key={index} className="hover text-sm">
                  {contractAddress && (
                    <>
                      <td>{inspection.inspectionType}</td>
                      <td>{inspection.inspector}</td>
                      <td>{judgement}</td>
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
