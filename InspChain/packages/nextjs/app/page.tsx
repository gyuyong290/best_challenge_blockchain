"use client";

import Link from "next/link";
import type { NextPage } from "next";
// import { useAccount } from "wagmi";
import {
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  PuzzlePieceIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

// import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  // const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <div style={{ marginBottom: "10px" }} className="flex justify-center">
              <PuzzlePieceIcon className="h-8 w-8 fill-secondary" />
            </div>
            <div className="text-4xl font-bold">블록체인 기반 스마트 점검 관리 시스템</div>
          </h1>
        </div>
        <div className="flex-grow bg-base-300 w-full mt-10 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <CheckCircleIcon className="h-8 w-8 fill-secondary" />
              <p>
                승인 페이지{" "}
                <Link href="/debug" passHref className="link">
                  Contract List
                </Link>{" "}
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <ClipboardDocumentListIcon className="h-8 w-8 fill-secondary" />
              <p>
                점검 이력 페이지{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Transaction List
                </Link>{" "}
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <ShieldCheckIcon className="h-8 w-8 fill-secondary" />
              <p>
                권한 설정 페이지{" "}
                <Link href="/grant" passHref className="link">
                  Grant
                </Link>{" "}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
