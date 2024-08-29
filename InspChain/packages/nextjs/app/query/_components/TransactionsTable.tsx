import { TransactionHash } from "./TransactionHash";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { TransactionWithFunction } from "~~/utils/scaffold-eth";
import { TransactionsTableProps } from "~~/utils/scaffold-eth/";
import { getFunctionDetails } from "~~/utils/scaffold-eth";
import deployedContracts from "~~/contracts/deployedContracts";
import { useReadContract } from "wagmi"; // useReadContract 훅 가져오기
import { useEffect } from "react";

export const TransactionsTable = ({ blocks, transactionReceipts }: TransactionsTableProps) => {
  const { targetNetwork } = useTargetNetwork();
  // console.log(blocks[0]);
 
  // const contractAddress = blocks[0]?.transactions[0].to;
  const contractAddress =  blocks[0]?.transactions[0].to || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  // useReadContract 훅 설정
  const { isFetching, refetch, error, data } = useReadContract({
    address: contractAddress,
    functionName: "getAllInspections",
    abi: deployedContracts[31337].InspChain.abi,
    // args: [BigInt(0)],
    chainId: targetNetwork.id,
    query: {
      enabled: false,
      retry: false,
    },
  });

  // 데이터를 가져오기 위한 useEffect 훅
  useEffect(() => {
    if (contractAddress) {
      refetch().then((res) => {
        console.log(res);
      });
    }
  }, [contractAddress]); // contractAddress가 변경될 때만 실행

  blocks.map(block => {

  });

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
              <th className="bg-primary">Function Called</th>
              <th className="bg-primary">Function Detail</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map(block =>
              (block.transactions as TransactionWithFunction[]).map(tx => {
                const receipt = transactionReceipts[tx.hash];
                const timeMined = new Date(Number(block.timestamp) * 1000).toLocaleString();
                const functionCalled = tx.input.substring(0, 10);
                // console.log(typeof(block.transactions[0].functionArgs[0]), block.transactions[0].functionArgs[0]);
                return (
                  <tr key={tx.hash} className="hover text-sm">
                    <td className="w-1/12 md:py-4">
                      <TransactionHash hash={tx.hash} />
                    </td>
                    {contractAddress && (
                      <>
                    <td>{}</td>
                    <td>hello</td>
                    <td>hhh</td>
                    </>
                    )} 
                    <td className="w-2/12 md:py-4">
                      {tx.functionName === "0x" ? "" : <span className="mr-1">{tx.functionName}</span>}
                      {functionCalled !== "0x" && (
                        <span className="badge badge-primary font-bold text-xs">{functionCalled}</span>
                      )}
                    </td>
                    <td>
                      {functionCalled !== "0x" && (
                        <>
                          <span className="mr-2">{getFunctionDetails(tx)}</span>
                          <span className="badge badge-primary font-bold text-xs">{functionCalled}</span>
                        </>
                      )}
                    </td>
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
