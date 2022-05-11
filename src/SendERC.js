
import styles from "./styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract, utils, ethers } from "ethers";
import { useEffect, useRef, useState } from "react";
import { MULTISEND_CONTRACT_ADDRESS, abi} from "./constants";

export default function DepositERC() {
    // walletConnected keep track of whether the user's wallet is connected or not
    const [walletConnected, setWalletConnected] = useState(false);

    // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
    const web3ModalRef = useRef();

    // Used for represent x * 10^18 numbers
    const BigNumber = require('bignumber.js');

    // Used for store Amount to send in transaction
    const [TransferAmount, setTransferAmount] = useState("");

    // Used for store the receiver address
    const [SingleAddressDest, setSingleAddressDest] = useState('');

    const getProviderOrSigner = async (needSigner = false) => {
        // Connect to Metamask
        // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);

        // If user is not connected to the Rinkeby network, let them know and throw an error
        const { chainId } = await web3Provider.getNetwork();
        if (chainId !== 97) {
            window.alert("Change the network to BSC Testnet");
            throw new Error("Change network to BSC Testnet");
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

    const getDataTransferAmount = (val) => {
        console.log(val.target.value);
        setTransferAmount(val.target.value);
    }

    const getDataAddress = (val) => {
        console.log(val.target.value);
        setSingleAddressDest(val.target.value);
    }

    const PutTokenAmount = () => {
        if (walletConnected) {
            return (<input className={styles.div.elem} type="text" onChange={getDataTransferAmount} />);
        } else {
            return (
                <button onClick={connectWallet} className={styles.button}>
                    Connect your wallet
                </button>
            );
        }
    }


    const PutAddress = () => {
        return (<input className={styles.div.elem} type="text" onChange={getDataAddress} />);
    }

    const SendTokens = async () => {
        try {
            console.log(TransferAmount);
            // Get the provider from web3Modal, which in our case is MetaMask
            // No need for the Signer here, as we are only reading state from the blockchain
            const provider = await getProviderOrSigner(true);
            // We connect to the Contract using a Provider, so we will only
            // have read-only access to the Contract
            const MultiSendContract = new Contract(
                MULTISEND_CONTRACT_ADDRESS,
                abi,
                provider
            );
            let approve = ethers.utils.parseEther(TransferAmount);
            console.log(approve.toString());
            // call the numAddressesWhitelisted from the contract
            await MultiSendContract.sendTokens(approve, SingleAddressDest);
            console.log("Enviado");

        } catch (err) {
            console.error(err);
        }
    }


    const SendButton = () => {
        return (
            <button onClick={SendTokens} className={styles.button}>Send</button>
        );
    }

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
    

    return (
        <div>
            <div className={styles.div}>
                <p>Introduce cantidad para enviar y la dirección</p>
                {PutTokenAmount()}
                {PutAddress()}
                <SendButton />
            </div>
        </div>

    );
}