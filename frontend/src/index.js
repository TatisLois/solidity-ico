import React, { useState, useLayoutEffect  } from "react";
import ReactDOM from "react-dom";
import { ethers } from "ethers";
import 'normalize.css';
import App from './components/app'
import './index.css'

import TomatoICO from '../../artifacts/contracts/TomatoICO.sol/TomatoICO.json'

// Rinkeby Network
const tomatoICOAddress = '0x9C2D26360DFb62AeBB6D6b0E645aFc5a00D2DDFb';
const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
const signer = provider.getSigner()
const contract = new ethers.Contract(tomatoICOAddress, TomatoICO.abi, provider);

provider.on('network', (_, oldNetwork) => {
  if (oldNetwork) {
    window.location.reload()
  }
})

window.ethereum.on('accountsChanged', () => {
  window.location.reload()
})

// For this project we will keep it as a window variable, IRL we would never pollute the global namespace. 
window.ethers = ethers
window.provider = provider
window.signer = signer
window.contract = contract

const Wrapper = () => {
  const [isConnected, setIsConnected] = useState(false) 
  const useAble = Boolean(ethers) & Boolean(provider) &  Boolean(signer) & Boolean(contract);

  const connect = async () => {
    try {
      await signer.getAddress();
      setIsConnected(true);
    } catch {
      await provider.send("eth_requestAccounts", [])
    }
  }

  useLayoutEffect(() => {
    connect()
  }, [])

  if (useAble && isConnected) {
    return <App />
  }

  return (
    <section className="not-connected">
      <h1>Please make sure you connect your wallet </h1> 
      <a href="https://metamask.io/">Metamask</a>
    </section>
    )
}



const mountNode = document.getElementById("app");
ReactDOM.render(<Wrapper/>, mountNode);
