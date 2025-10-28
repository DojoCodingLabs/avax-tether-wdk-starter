import { WalletManager } from "~~/components/WalletManager";

export default function WalletPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Avalanche Wallet</h1>
        <p className="text-lg mb-8 text-base-content/70 text-center max-w-2xl mx-auto">
          Secure wallet powered by WDK. Manage your Avalanche C-Chain assets across Local, Fuji Testnet, and Mainnet.
        </p>
        <WalletManager />
      </div>
    </div>
  );
}
