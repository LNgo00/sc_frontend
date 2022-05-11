
import styles from "./styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract, ethers } from "ethers";
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
    const [TransferArray, setTransferArray] = useState([]);

    // Used for store the receivers addresses in Array
    const [AddressDestArray, setAddressDestArray] = useState([]);

    // Used for store the receiver address
    const [SingleAddressDest, setSingleAddressDest] = useState('');

    // Used for store transaction Amount
    const [TransactionAmount, setTransactionAmount] = useState("");

    // Get the address of the wallet who is using the
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

    const addAdressField = () => {
        return (
            <input className={styles.div.elem} type="text" onChange={getDataAddress} />
        );
    }

    const OnclickAddress = async () => {
        if(TransferArray.length>=AddressDestArray.length){
            setAddressDestArray([...AddressDestArray, SingleAddressDest]);
        }
            
    }

    const OnclickAmount = async () => {
        if(TransactionAmount!=0 && TransferArray.length<=AddressDestArray.length){
            let approve = ethers.utils.parseEther(TransactionAmount);
            setTransferArray([...TransferArray, approve]);
            console.log(TransferArray);
        }
        
    }

    const OnclickAddressWithAmount = async () => {
        
        if(TransactionAmount!=0 && SingleAddressDest!=''){    
            OnclickAddress();
            OnclickAmount();
        }
        
    }


    const buttonAddAdress = () => {
        console.log(SingleAddressDest);
        return (
            <button className={styles.button} onClick={OnclickAddress}>Add Adress</button>
        );
    }

    const getDataAddress = async (val)  => {
        console.log(val.target.value);
        setSingleAddressDest(val.target.value);
    }

    const displayAddresses = () => {
        return (
            <ol>
                {AddressDestArray.map(item => <li key={item}>{item}</li>) }
            </ol>
        );
    }

    const addAmountField = () => {
        return (
            <input className={styles.div.elem} type="text" onChange={getDataAmount} />
        );
    }

    const buttonAmount = () => {
        return (
            <button className={styles.button} onClick={OnclickAmount}>Add Amount</button>
        );
    }

    const buttonAddressWithAmount = () => {
        return (
            <button className={styles.button} onClick={OnclickAddressWithAmount}>Add Amount and Address</button>
        );
    }

    const getDataAmount = (val) => {
        console.log(val.target.value);
        setTransactionAmount(val.target.value);
    }

    const displayAmount = () => {
        return (
            <ol>
               {TransferArray.map(item => <li key={item}>{item.toString()}</li>) }
            </ol>
        );
    }

    const buttonDeleteList = () => {
        return (
            <button onClick={() => { setTransferArray([]); setAddressDestArray([]); }}>Delete List</button>
        )
    }

    const MultiSend = async () => {
        try {
            if(TransferArray.length>AddressDestArray.length){
                TransferArray.pop();
            }else if(TransferArray.length<AddressDestArray.length){
                AddressDestArray.pop();
            }
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
            console.log(AddressDestArray);
            console.log(TransferArray);
            // call the numAddressesWhitelisted from the contract
            await MultiSendContract.multisendOwnERC20(AddressDestArray, TransferArray);
            console.log("Enviado");

        } catch (err) {
            console.error(err);
        }
    }

    const buttonMultisend = () => {
        return(
            <button className={styles.button} onClick={MultiSend}>MultiSend</button>
        );
    }
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
    

    return (
        <div>
            <div className={styles.div}>
                    <h1>MultiSend</h1>
                    <span>
                    {addAdressField() }
                    {buttonAddAdress() }
                    </span>
                    <span>
                    {addAmountField() }
                    {buttonAmount() }
                    {buttonAddressWithAmount() }
                    </span>
                    {buttonMultisend() }
                    <span>
                        {displayAddresses() }
                        {displayAmount() }
                        {buttonDeleteList()}
                    </span>

                    
                
            </div>
        </div>

    );
}