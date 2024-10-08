// useReadContract 훅 가져오기
import { useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { TransactionWithFunction } from "~~/utils/scaffold-eth";
import { TransactionsTableProps } from "~~/utils/scaffold-eth/";

export const TransactionsTable = ({ blocks }: TransactionsTableProps) => {
  const { targetNetwork } = useTargetNetwork();
  const { address } = useAccount();

  // const contractAddress = blocks[0]?.transactions[0].to;
  const contractAddress = blocks[0]?.transactions[0].to || "0x0000000000000000000000000000000000000000";

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

  console.log(blocks);
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
            {blocks.map(block =>
              (block.transactions as TransactionWithFunction[]).map(tx => {
                // if (block.transactions[0].from !== address) return;
                if (!block.transactions[0].functionArgs) return;
                console.log(block);
                const inspectionIndex = Number(block.transactions[0].functionArgs[0]);
                const inspection = inspections ? inspections[inspectionIndex] : null;
                const inspector = inspection?.inspector;
                const inspectionType = inspection?.inspectionType;
                const judgementState = inspection?.judgeHistory.state;
                if (!judgementState) return;
                const judgement = judgementState ? (judgementState === 1 ? "승인 완료" : "반려") : "대기 중";
                return (
                  <tr key={tx.hash} className="hover text-sm">
                    {contractAddress && (
                      <>
                        <td>{inspectionType}</td>
                        <td>{inspector}</td>
                        <td>{judgement}</td>
                      </>
                    )}
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
