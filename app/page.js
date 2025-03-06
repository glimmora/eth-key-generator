"use client";
import { useState } from "react";
import { ethers } from "ethers";

export default function Home() {
  const [privateKeys, setPrivateKeys] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [searchPrivateKey, setSearchPrivateKey] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const [generateCount, setGenerateCount] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchCancelled, setSearchCancelled] = useState(false);

  const generateKey = () => {
    let keys = [];
    let addrs = [];
    for (let i = 0; i < generateCount; i++) {
      const wallet = ethers.Wallet.createRandom();
      keys.push(wallet.privateKey);
      addrs.push(wallet.address);
    }
    setPrivateKeys(keys);
    setAddresses(addrs);
  };

  const searchKey = () => {
    setIsSearching(true);
    setSearchCancelled(false);
    setProgress(0);

    let wallet;
    let attempts = 0;
    const findWallet = () => {
      if (searchCancelled) {
        setIsSearching(false);
        setProgress(0);
        return;
      }

      wallet = ethers.Wallet.createRandom();
      attempts++;

      if (attempts % 100 === 0) {
        setProgress((prev) => (prev < 100 ? prev + 5 : 100));
      }

      if (
        (!prefix || wallet.address.startsWith(prefix)) &&
        (!suffix || wallet.address.endsWith(suffix))
      ) {
        setSearchPrivateKey(wallet.privateKey);
        setSearchAddress(wallet.address);
        setIsSearching(false);
        setProgress(100);
      } else {
        setTimeout(findWallet, 10);
      }
    };

    findWallet();
  };

  const cancelSearch = () => {
    setSearchCancelled(true);
    setIsSearching(false);
    setProgress(0);
  };

  const clearResults = () => {
    setPrivateKeys([]);
    setAddresses([]);
    setSearchPrivateKey("");
    setSearchAddress("");
    setProgress(0);
  };

  const exportToJson = () => {
    const data = {
      generated: privateKeys.map((key, index) => ({
        privateKey: key,
        address: addresses[index],
      })),
      searchResult: searchPrivateKey
        ? { privateKey: searchPrivateKey, address: searchAddress }
        : null,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eth-keys.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">Ethereum Private Key Generator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <div className="flex flex-col items-center bg-white p-4 shadow-md rounded w-full">
          <h2 className="text-lg font-semibold mb-2">Generate Random Keys</h2>
          <input
            type="number"
            min="1"
            value={generateCount}
            onChange={(e) => setGenerateCount(Number(e.target.value))}
            className="border p-2 w-full mb-2"
            placeholder="Number of Keys"
          />
          <button
            onClick={generateKey}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
          >
            Generate Keys
          </button>
        </div>

        <div className="flex flex-col items-center bg-white p-4 shadow-md rounded w-full">
          <h2 className="text-lg font-semibold mb-2">Find Key by Address</h2>
          <input
            type="text"
            placeholder="Prefix"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className="border p-2 w-full mb-2"
          />
          <input
            type="text"
            placeholder="Suffix"
            value={suffix}
            onChange={(e) => setSuffix(e.target.value)}
            className="border p-2 w-full mb-2"
          />
          <button
            onClick={searchKey}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
            disabled={isSearching}
          >
            {isSearching ? "Searching..." : "Search Key"}
          </button>
          {isSearching && (
            <>
              <div className="w-full bg-gray-300 rounded-full h-4 mt-3">
                <div
                  className="bg-green-500 h-4 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <button
                onClick={cancelSearch}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full mt-2"
              >
                Cancel Search
              </button>
            </>
          )}
        </div>
      </div>

      {(privateKeys.length > 0 || searchPrivateKey) && (
        <div className="mt-6 p-4 bg-white shadow-md rounded w-full max-w-2xl">
          {privateKeys.length > 0 && privateKeys.map((key, index) => (
            <div key={index} className="mb-4 border-b pb-2">
              <p className="break-all"><strong>Generated Private Key:</strong> {key}</p>
              <button 
                onClick={() => copyToClipboard(key)}
                className="bg-gray-500 text-white px-3 py-1 mt-2 rounded hover:bg-gray-600 w-full"
              >
                Copy Private Key
              </button>
              <p className="break-all mt-2"><strong>Generated Address:</strong> {addresses[index]}</p>
              <button 
                onClick={() => copyToClipboard(addresses[index])}
                className="bg-gray-500 text-white px-3 py-1 mt-2 rounded hover:bg-gray-600 w-full"
              >
                Copy Address
              </button>
            </div>
          ))}
          {searchPrivateKey && (
            <div className="mt-4">
              <p className="break-all"><strong>Found Private Key:</strong> {searchPrivateKey}</p>
              <button 
                onClick={() => copyToClipboard(searchPrivateKey)}
                className="bg-gray-500 text-white px-3 py-1 mt-2 rounded hover:bg-gray-600 w-full"
              >
                Copy Private Key
              </button>
              <p className="break-all mt-2"><strong>Found Address:</strong> {searchAddress}</p>
              <button 
                onClick={() => copyToClipboard(searchAddress)}
                className="bg-gray-500 text-white px-3 py-1 mt-2 rounded hover:bg-gray-600 w-full"
              >
                Copy Address
              </button>
            </div>
          )}
        </div>
      )}

      <footer className="mt-6 text-center text-gray-500">
        Source code by <a href="https://github.com/maragung/eth-key-generator" className="text-blue-500">maragung</a>
      </footer>
    </div>
  );
}
