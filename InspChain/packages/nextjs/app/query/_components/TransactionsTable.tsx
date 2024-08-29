// useReadContract 훅 가져오기
import { useEffect } from "react";
import { TransactionHash } from "./TransactionHash";
import { useReadContract } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { TransactionWithFunction } from "~~/utils/scaffold-eth";
import { getFunctionDetails } from "~~/utils/scaffold-eth";
import { TransactionsTableProps } from "~~/utils/scaffold-eth/";

export const TransactionsTable = ({ blocks, transactionReceipts }: TransactionsTableProps) => {
  const { targetNetwork } = useTargetNetwork();
  console.log(blocks);

  // const contractAddress = blocks[0]?.transactions[0].to;
  const contractAddress = blocks[0]?.transactions[0].to || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  // useReadContract 훅 설정
  const { isFetching, refetch, error, data } = useReadContract({
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

  return (
    <div className="flex justify-center px-4 md:px-0">
      <div className="overflow-x-auto w-full shadow-2xl rounded-xl">
        <table className="table text-xl bg-base-100 table-zebra w-full md:table-md table-sm">
          <thead>
            <tr className="rounded-xl text-sm text-base-content">
              <th className="bg-primary">Transaction Hash</th>
              <th className="bg-primary">Inspection Type</th>
              <th className="bg-primary">Inpector</th>
              <th className="bg-primary">Confirmed</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map(block =>
              (block.transactions as TransactionWithFunction[]).map(tx => {
                const inspectionIndex = Number(block.transactions[0].functionArgs[0]);
                const inspection = inspections ? inspections[inspectionIndex] : null;
                const inspector = inspection?.inspector;
                const inspectionType = inspection?.inspectionType;
                const judgementState = inspection?.judgeHistory.state;
                const judgement = judgementState ? (judgementState === 1 ? "Confirmed" : "Rejected") : "Pending";
                console.log(inspection);
                return (
                  <tr key={tx.hash} className="hover text-sm">
                    <td className="w-1/12 md:py-4">
                      <TransactionHash hash={tx.hash} />
                    </td>
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
