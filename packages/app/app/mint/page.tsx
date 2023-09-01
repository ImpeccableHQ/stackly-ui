"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import Image from "next/image";
import { StacklyBetaNFTImg } from "@/public/assets";
import {
  ChainId,
  getNftWhitelistAddress,
  getWhitelist,
  nftWhitelistBalanceOf,
  nftWhitelistMaxSupply,
  nftWhitelistMint,
  nftWhitelistTotalSupply,
} from "@stackly/sdk";
import { BodyText, Button, ButtonLink, HeadingText } from "@/ui";
import { useEthersProvider, useEthersSigner } from "@/utils/ethers";
import { ConnectButton, DialogConfirmTransactionLoading } from "@/components";
import { ModalId, useModalContext } from "@/contexts";

export default function Page() {
  const { chain } = useNetwork();
  const signer = useEthersSigner();
  const { address, isDisconnected, isConnected } = useAccount();
  const publicClient = useEthersProvider();
  const { closeModal, isModalOpen, openModal } = useModalContext();

  const [mintedAmount, setMintedAmount] = useState<string>("-");
  const [maxSupply, setMaxSupply] = useState<string>("-");
  const [isNFTHolder, setIsNFTHolder] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();

  const nftWhitelist = useMemo(
    () => getWhitelist(getNftWhitelistAddress(ChainId.GNOSIS), publicClient),
    [publicClient]
  );

  useEffect(() => {
    const fetchData = async () => {
      setError(undefined);

      Promise.allSettled([
        nftWhitelistTotalSupply(nftWhitelist),
        nftWhitelistMaxSupply(nftWhitelist),
      ])
        .then(([newMintedAmount, newMaxSupply]) => {
          if (newMintedAmount.status === "fulfilled")
            setMintedAmount(newMintedAmount.value.toString());
          if (newMaxSupply.status === "fulfilled")
            setMaxSupply(newMaxSupply.value.toString());
        })
        .catch((e) =>
          console.error("Error while fetching NFT contract info: ", e)
        );
    };

    fetchData();
  }, [nftWhitelist]);

  useEffect(() => {
    const fetchAddressBalance = async () => {
      if (!address) return;

      nftWhitelistBalanceOf(nftWhitelist, address)
        .then((newBalance) => {
          setIsNFTHolder(newBalance.gt(0));
          setError(undefined);
        })
        .catch((e) =>
          console.error("Error while fetching address NFT balance: ", e)
        );
    };

    fetchAddressBalance();
  }, [address, nftWhitelist]);

  useEffect(() => {
    if (isDisconnected) {
      setError(undefined);
      setIsNFTHolder(false);
    }
  }, [isDisconnected]);

  const mint = async () => {
    if (!signer || !address || !chain) return;

    openModal(ModalId.NFT_MINT_PROCESSING);
    setError(undefined);

    const nftWhitelist = getWhitelist(getNftWhitelistAddress(chain.id), signer);
    try {
      const mintTransaction = await nftWhitelistMint(nftWhitelist);

      await mintTransaction.wait();

      closeModal(ModalId.NFT_MINT_PROCESSING);
      setIsNFTHolder(true);
    } catch (e: any) {
      console.error("Error while minting NFT: ", e);
      if (e.code === "ACTION_REJECTED") setError("Minting rejected.");
      else setError("Oops! Something went wrong.");
      closeModal(ModalId.NFT_MINT_PROCESSING);
    }
  };

  const nextNFTNumber = Number(mintedAmount) + 1;

  return (
    <>
      <div className="flex flex-col-reverse items-center lg:items-start justify-center w-full lg:flex-row space-x-0 lg:space-x-10 xl:space-x-[72px] my-12 lg:my-24">
        <div className="p-4 bg-white rounded-3xl shadow-xl mt-8 lg:mt-0 space-y-4">
          <Image
            src={StacklyBetaNFTImg}
            width={512}
            height={512}
            className="shadow-2xl"
            alt="Stackly Beta NFT"
          />
          <HeadingText className="text-em-med"># {nextNFTNumber}</HeadingText>
        </div>
        <div className="flex flex-col max-w-md lg:mt-6 space-y-16">
          <div className="flex flex-col space-y-8 items-center">
            <HeadingText className="text-em-high text-center" size={5}>
              Stackly Closed Beta NFT
            </HeadingText>
            <div className="rounded-full bg-surface-75 py-2 px-5">
              <HeadingText className="text-em-high text-center">
                {mintedAmount}/{maxSupply}{" "}
                <span className="text-primary-700 inline-block sm:inline">
                  NFT minted so far.
                </span>
              </HeadingText>
            </div>
          </div>
          <div className="flex flex-col space-y-6 w-full items-center">
            {isNFTHolder && (
              <div className="text-center">
                <HeadingText className="text-em-high">
                  Congratulations 🎉
                </HeadingText>
                <BodyText weight="medium" className="text-em-high">
                  You hold the Stackly Beta NFT!
                </BodyText>
              </div>
            )}
            {isNFTHolder ? (
              <ButtonLink size="lg" href="/" width="full">
                Create a Stack
              </ButtonLink>
            ) : isConnected ? (
              <Button size="lg" width="full" onClick={mint}>
                Mint for free
              </Button>
            ) : (
              <ConnectButton size="lg" className="w-full" />
            )}
            {error && <BodyText className="text-em-med">{error}</BodyText>}
          </div>
        </div>
      </div>
      <DialogConfirmTransactionLoading
        isOpen={isModalOpen(ModalId.NFT_MINT_PROCESSING)}
      />
    </>
  );
}
