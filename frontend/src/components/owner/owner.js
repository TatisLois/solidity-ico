import { useState, useEffect } from 'react';
import './owner.css';
import Spacer from '../shared/spacer';

const phaseMap = ['seed', 'general', 'open']

export default function Owner(props) {
  const [phase, setPhase] = useState('');
  const setInError = props?.setInError;
  const setInErrorMessage = props?.setInErrorMessage;
  const showPhase = phase.length > 0;
  const isSeedPhase = phase === phaseMap[0];
  const hideAdvancePhaseAction = phase === phaseMap[2];

  const nextPhase = async () => {
    try {
      const newPhase = await contract.connect(signer).nextPhase();
      setPhase(phaseMap[newPhase]);
    } catch (error) {
      setInError(true);
      setInErrorMessage(error?.error?.message);
    }
  }

  const addInvestor = async (event) => {
    event.preventDefault()
    const [_, input] = event.target.elements;
    const inputValue = input.value;
    try {
      await contract.connect(signer).includeSeedInvestor(inputValue);
    } catch (error) {
      setInError(true);
      setInErrorMessage(error?.error?.message);
    }
  }

  const removeInvestor = async (event) => {
    event.preventDefault()
    const [_, input] = event.target.elements;
    const inputValue = input.value;
    try {
      await contract.connect(signer).revokeSeedInvestor(inputValue);
    } catch (error) {
      console.log(error)
      setInError(true);
      setInErrorMessage(error?.error?.message);
    }
  }

  const getPhase = async () => {
    const currentPhase = await contract.currentPhase()
    setPhase(phaseMap[currentPhase])
  }

  useEffect(() => {
    getPhase()
  }, [])

  return (
    <section className="owner">
      <h2>👨‍🍳 Owner : { showPhase ? `🌱 ${phase} phase` : null }</h2>
      {
        isSeedPhase
        ? (
          <>
            <br/>
            <form onSubmit={addInvestor}>
              <button>Add Seed Investor</button>
              <input placeholder="address" />
            </form>
            <br/>
            <form onSubmit={removeInvestor}>
              <button>Add Revoke Investor</button>
              <input placeholder="address" />
            </form>
          </>
        )
        : null
      }
      <Spacer margin="1rem 0 0 0" />
      {  hideAdvancePhaseAction ? null : <button onClick={nextPhase}> Advance Phase </button> } 
    </section>
  )
}
