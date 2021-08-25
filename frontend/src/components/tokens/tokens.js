import { useState } from "react";
import "./tokens.css";

export default function Tokens(props) {
  const [tokens, setTokens] = useState(false);
  const address = props?.address;
  const hasAddress = address.length > 0;

  fetchTokens = async () => {
    if (hasAddress) {
      const tokensBigNumber = await contract.toTokens(address);
      const tokens = tokensBigNumber.toString();
      setTokens(tokens);
    }
  }

  return (
    <section className="token">
      <h2 className="token-title">👛 My Coin</h2>
      {
        tokens
        ? <button className="token-buttons" onClick={fetchTokens}> <p>Current: {tokens}</p> </button> 
        : <button onClick={fetchTokens} className="token-buttons"> <p>Click to fetch tokens...</p>  </button>
      }    
    </section>
  )
}
