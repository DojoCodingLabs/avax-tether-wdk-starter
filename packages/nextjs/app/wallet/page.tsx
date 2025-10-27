import { WalletUI } from "~~/components/WalletUI";

export default function WalletPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Avalanche Wallet Demo</h1>
        <p className="text-lg mb-8 text-gray-600">
          This demo showcases the Tether WDK integration with Avalanche C-Chain support.
          The wallet uses a singleton pattern to ensure only one wallet instance exists across the application.
        </p>
        <WalletUI />
      </div>
    </div>
  );
}
