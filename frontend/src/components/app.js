import { useState, useEffect} from 'react'

import Layout from './shared/layout';
import Spacer from './shared/spacer';
import Tokens from './tokens/tokens';
import Address from './address/address';
import Purchase from './purchase/purchase';
import Owner from './owner/owner'
import ErrorNotification from './error-notification/error-notification'

export default function App() {
  const [inError, setInError] = useState(false);
  const [inErrorMessage, setInErrorMessage] = useState('');
  const [address, setAddress] = useState('');
  const [owner, setOwner] = useState('');
  const isOwner = address.length > 0 & address === owner;

  const fetchAddress = async () => {
    const address = await signer.getAddress();
    setAddress(address)
  } 

  const fetchOwner = async () => {
    const returnedOwner = await contract.owner();
    setOwner(returnedOwner)
  } 

  useEffect(() => {
    fetchAddress();
    fetchOwner();
  }, [address, owner])

    return (
    <Layout>
      <ErrorNotification 
        inError={inError}
        inErrorMessage={inErrorMessage}
        setInError={setInError}
        setInErrorMessage={setInErrorMessage}
      />
      <Tokens address={address}/>
      <Spacer margin="2rem 0" />
      <Address address={address} />
      <Spacer margin="2rem 0" />
      <Purchase address={address} setInErrorMessage={setInErrorMessage} setInError={setInError} />
      <Spacer margin="4rem 0" />
      { isOwner ? <Owner setInErrorMessage={setInErrorMessage} setInError={setInError} /> : null }
    </Layout>
    );
}
