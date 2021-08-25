import { useState, useEffect} from 'react'
import './address.css';

export default function Address(props) {
  const address = props?.address;

  return (
    <section className="address">
      <h2>
        🏠 
      </h2>
      { address ? <p className="address-text"> { address } </p> : null }
    </section>
  )
}
