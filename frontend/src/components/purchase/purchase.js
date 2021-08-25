import { useState } from "react";
import "./purchase.css";

export default function Purchase(props) {
  const [steps, setSteps] = useState(0);
  const [tokenAmount, setTokenAmount] = useState(0);
  const setInError = props?.setInError;
  const setInErrorMessage = props?.setInErrorMessage;

  const nextStep = () => {
    if (steps === 1) {
      setSteps(0)
    } else {
      setSteps((previous) => previous + 1);
    }
  }

  const purchaseTokens = async () => {
    isValidNumber = +tokenAmount
    const value = ethers.utils.parseEther(tokenAmount);
    if (isValidNumber) {
      try {
        await contract.connect(signer).purchase(value, { value });
        nextStep();
      } catch (error) {
        console.log(error)
        setInError(true);
        setInErrorMessage(error?.error?.message);
      }
    }
  }

  const redeemTokens = async () => {
      try {
        await contract.connect(signer).redeem();
      } catch (error) {
        setInError(true);
        setInErrorMessage(error?.error?.message);
      }
  }

  return (
    <section className="purchase">
      <h2>
        🥗 
      </h2>
      { steps === 0 ? <button className="purchase-buttons" onClick={nextStep}>Get Some Fruit</button> : null }
      { steps === 1 ? (
        <>
          <input className="purchase-input" placeholder="How much fruit in Eth?" onChange={(e) => setTokenAmount(e.target.value)} />
          <button className="purchase-buttons" onClick={purchaseTokens}> Buy! </button>
        </>
        ) : null }
        <button className="purchase-buttons" onClick={redeemTokens}> Redeem </button>
    </section>
  )
}
