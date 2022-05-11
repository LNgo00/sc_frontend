
import styles from "./styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract, utils, ethers } from "ethers";
import { useEffect, useRef, useState } from "react";
import { MULTISEND_CONTRACT_ADDRESS, abi, TokenInterface, TokenAddress_ } from "./constants";

export default function DepositERC() {
    // walletConnected keep track of whether the user's wallet is connected or not
    const [walletConnected, setWalletConnected] = useState(false);

    // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
    const web3ModalRef = useRef();

    // Used for represent x * 10^18 numbers
    const BigNumber = require('bignumber.js');

    // Used for store the number of tokens in the contract, value updated by the function getTokenBalance
    const [numberOfTokens, setNumberOfTokens] = useState("");

    // Used for store Amount to send in transaction
    const [TransferAmount, setTransferAmount] = useState("");

    // Boolean variable which changes when the token amount to transfer is approved
    const [TransferApproved, setTransferApproved] = useState(false);

    //
    const [TokenAddress_text, setTokenAddress_text] = useState("");

    const [TokenAddress, setTokenAddress] = useState("");

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

    const depositERC20 = async () => {
        try {
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
            // call the numAddressesWhitelisted from the contract
            let approve = ethers.utils.parseEther(TransferAmount);
            await MultiSendContract.depositERC20(approve);
            console.log(approve.toString());
            setTransferApproved(false);
            getTokenBalance();
        } catch (err) {
            console.error(err);
        }
    }

    const approveContract = async () => {
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // No need for the Signer here, as we are only reading state from the blockchain
            const provider = await getProviderOrSigner(true);
            // We connect to the Contract using a Provider, so we will only
            // have read-only access to the Contract
            console.log(TokenAddress);
            const ERC20Contract = new Contract(
                TokenAddress,
                TokenInterface,
                provider
            );
            // call the numAddressesWhitelisted from the contract
            let approve = ethers.utils.parseEther(TransferAmount);
            console.log(approve.toString());
            await ERC20Contract.approve(MULTISEND_CONTRACT_ADDRESS, approve);
            setTransferApproved(true);
        } catch (err) {
            console.error(err);
            setTransferApproved(false);
        }
    }


    const getTokenBalance = async () => {
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // No need for the Signer here, as we are only reading state from the blockchain
            const provider = await getProviderOrSigner();
            // We connect to the Contract using a Provider, so we will only
            // have read-only access to the Contract
            const MultiSendContract = new Contract(
                MULTISEND_CONTRACT_ADDRESS,
                abi,
                provider
            );
            // call the numAddressesWhitelisted from the contract
            let _tokenBalance = new BigNumber(1);
            _tokenBalance = await MultiSendContract.getBalance();
            let _tokenBalanceinEther = ethers.utils.formatEther(_tokenBalance.toString());
            setNumberOfTokens(_tokenBalanceinEther);
            console.log(numberOfTokens)
        } catch (err) {
            console.error(err);
        }
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
        setTransferAmount(val.target.value);
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

    const getTokenAddress = (val) => {
        setTokenAddress_text(val.target.value);
    }

    const PutTokenAddress = () => {
        return (<input className={styles.div.elem} type="text" onChange={getTokenAddress} />)
    }

    const ApproveWarning = () => {
        if (TransferApproved) {
            return (
                <h2>Transfer Approved {TransferAmount} Tokens</h2>
            );
        } else {
            return (
                <h2>Transfer Not Approved</h2>
            );
        }
    }

    const DisplayTokenAdress = () => {
        if(TokenAddress!=""){
            return (<h1>El address del token es {TokenAddress} </h1>
            );
        }else {
            return (<h1>Introduzca una dirección de token</h1>
            );
        }
    }

    const DisplayBalanceToken = () => {
        if(numberOfTokens!=0){
            return (<h1>El contrato tiene {numberOfTokens} Tokens</h1>
            );
        }else{
            return (<h1>El contrato no tiene Tokens</h1>
            );
        }
        
    }

    const Put_setTokenAddress = async () => {
        setTokenAddress(TokenAddress_text);
    }

    const AddAddressButton = () => {
        return (<button className={styles.button} onClick={Put_setTokenAddress}>add Address</button>);
    }

    const ApproveButton = () => {
        if (!TransferApproved) {
            return (
                <button onClick={approveContract} className={styles.button}>Approve</button>
            );
        } else {
            return (
                <button onClick={depositERC20} className={styles.button}>Deposit</button>
            );
        }

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
            {DisplayTokenAdress()}
            {DisplayBalanceToken()}
            <button onClick={() => getTokenBalance()}>Refresh Balance</button>
            
            
            <div className={styles.div}>
                <div>
                <h2>Introduce el address del token</h2>
                <p>Si quieres meter XCB el address es : 0xFA5c9A4F501a50d00531003fA9eFdE8eC9Bbda1C</p>
                    {AddAddressButton()}
                    {PutTokenAddress() }
                </div>
                <div>
                    <h2>Introduce cantidad para depositar</h2>
                    {PutTokenAmount()}
                    {ApproveButton()}
                    <ApproveWarning />
                </div>
                
                
            </div>
        </div>
                      
      );
}