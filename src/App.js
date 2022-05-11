
import styles from "./styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { MULTISEND_CONTRACT_ADDRESS, abi, TokenInterface, TokenAddress } from "./constants";
import DepositERC from "./DepositERC";
import SendERC from "./SendERC";
import MultiSendERC from "./MultiSendERC";
import MultiSendERCArray from "./MultiSendERCArray";


export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

  const [error, setError] = useState();

  const networks = {
    bsctestnet: {
      chainId: `0x${Number(97).toString(16)}`,
      chainName: "Binance Smart Chain Testnet",
      nativeCurrency: {
        name: "Binance Chain Native Token",
        symbol: "tBNB",
        decimals: 18
      },
      rpcUrls: [
        "https://data-seed-prebsc-1-s1.binance.org:8545",
        "https://data-seed-prebsc-2-s1.binance.org:8545",
        "https://data-seed-prebsc-1-s2.binance.org:8545",
        "https://data-seed-prebsc-2-s2.binance.org:8545",
        "https://data-seed-prebsc-1-s3.binance.org:8545",
        "https://data-seed-prebsc-2-s3.binance.org:8545"
      ],
      blockExplorerUrls: ["https://testnet.bscscan.com"]
    },
    bsc: {
      chainId: `0x${Number(56).toString(16)}`,
      chainName: "Binance Smart Chain Mainnet",
      nativeCurrency: {
        name: "Binance Chain Native Token",
        symbol: "BNB",
        decimals: 18
      },
      rpcUrls: [
        "https://bsc-dataseed1.binance.org",
        "https://bsc-dataseed2.binance.org",
        "https://bsc-dataseed3.binance.org",
        "https://bsc-dataseed4.binance.org",
        "https://bsc-dataseed1.defibit.io",
        "https://bsc-dataseed2.defibit.io",
        "https://bsc-dataseed3.defibit.io",
        "https://bsc-dataseed4.defibit.io",
        "https://bsc-dataseed1.ninicoin.io",
        "https://bsc-dataseed2.ninicoin.io",
        "https://bsc-dataseed3.ninicoin.io",
        "https://bsc-dataseed4.ninicoin.io",
        "wss://bsc-ws-node.nariox.org"
      ],
      blockExplorerUrls: ["https://bscscan.com"]
    }
  };

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */

  const changeNetwork = async ({networkname, setError}) => {
    try {
      if (!window.ethereum) throw new Error("No cryptowallet found");
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [
          { 
            //bsc testnet
            chainId: `0x${Number(97).toString(16)}`
            //bsc main
            //chainId: `0x${Number(56).toString(16)}`
          }
        ],
      });
      console.log("AQUI")
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await await window.ethereum.request({
            methods: "wallet_addEthereumChain",
            params: [
              {
                ...networks[networkname]
              }
            ]
          });
        } catch (addError) {
          setError(addError)
        }
      }
    }
  }

  const disconnectWallet = async () => {
    try {   
      setWalletConnected(false);
      window.location.reload(true);
      console.log(walletConnected);
    } catch (err) {
      console.error(err);
    }
  }

  const handleNetworkSwitch = async (networkname) => {
    
    setError();
    
    await changeNetwork({networkname, setError});
    console.log("AAA")
  }

  const ButtonDisconect = () => {
    return (
      <button onClick={disconnectWallet}>Disconnect</button>
    );
  }

  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Rinkeby network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    console.log(chainId);
    if (chainId !== 97) {
      window.alert("Change the network to Binance Testnet");
      handleNetworkSwitch("bsctestnet");
      
      throw new Error("Change network to Binance Testnet");
      
    }
    /*
    if (chainId !== 56) {
      window.alert("Change the network to Binance Smart Chain");
      handleNetworkSwitch("bsc");
      throw new Error("Change network to Binance Smart Chain");
      
    }
    
    */ 

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  /*
    connectWallet: Connects the MetaMask wallet
  */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "binanceTest",
        providerOptions: {rpc: {
          97: 'https://speedy-nodes-nyc.moralis.io/f6ff47227c3725475f842d37/bsc/testnet'
       }},
        disableInjectedProvider: false,
      });
      /*
      web3ModalRef.current = new Web3Modal({
        network: "binance",
        providerOptions: {rpc: {
          56: 'https://bsc-dataseed1.binance.org'
       }},
        disableInjectedProvider: false,
      });
      */
      connectWallet();
    }
  }, [walletConnected]);

  const ConnectInterface = () => {
    if(!walletConnected){
      return (
        <div>
            <button onClick={connectWallet} className={styles.button}>
                    Connect your wallet
            </button>
        </div>
        
      );
    } else {
      return (
        <div>
          <DepositERC />
          <SendERC />
          <MultiSendERC />
          <MultiSendERCArray />
          
        </div>
        
      );
    }  
  }

  return (
    <div>
      <div className={styles.main}>
        <div>
          <ConnectInterface />
          
        </div>

      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Yusuke
      </footer>
    </div>
  );
}