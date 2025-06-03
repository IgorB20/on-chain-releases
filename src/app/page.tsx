"use client"
import { useState } from 'react';
import { Address, IExecDataProtector } from '@iexec/dataprotector';
import {
  AddressOrEnsName,
  checkCurrentChain,
  checkIsConnected,
  IEXEC_EXPLORER_URL,
  WEB3MAIL_APP_ENS,
} from '../utils/utils';
import loader from '../assets/loader.gif';
import successIcon from '../assets/success.png';
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

const iExecDataProtectorClient = new IExecDataProtector(window.ethereum);

export default function Home() {
  const [protectedData, setProtectedData] = useState<Address | ''>('');

  // Loading and error states
  const [loadingProtect, setLoadingProtect] = useState(false);
  const [errorProtect, setErrorProtect] = useState('');
  const [loadingGrant, setLoadingGrant] = useState(false);
  const [errorGrant, setErrorGrant] = useState('');
  const [loadingRevoke, setLoadingRevoke] = useState(false);
  const [errorRevoke, setErrorRevoke] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(true);

  const protectedDataSubmit = async () => {
    setErrorProtect('');

    try {
      checkIsConnected();
      await checkCurrentChain();
    } catch (err) {
      setErrorProtect('Please install MetaMask');
      return;
    }

    if (!email) {
      setErrorProtect('Please enter a valid email address');
      return;
    }

    const data = { email };
    try {
      setLoadingProtect(true);
      const protectedDataResponse =
        await iExecDataProtectorClient.core.protectData({
          data,
          name,
        });
      setProtectedData(protectedDataResponse.address as Address);
      setErrorProtect('');
    } catch (error) {
      setErrorProtect(String(error));
    }
    setLoadingProtect(false);
  };

  const readProtectedData = async () => {
    const protectedDataAddress = "0xFbe957449567cF7daA491F7d4d8f1dc48c56BFCF";
    const oneProtectedData = await iExecDataProtectorClient.core.getProtectedData({
      protectedDataAddress: protectedDataAddress,
    });
    console.log("oneProtectedData", oneProtectedData)
  }


  // Handlers
  const handleEmailChange = (event: any) => {
    setEmail(event.target.value);
    setIsValidEmail(event.target.validity.valid);
  };

  const handleNameChange = (event: any) => {
    setName(event.target.value);
  };



  return (
    <>
      {/* Protect Data Form */}
      <div>
        <h2>Protect your email address</h2>
        <div>
          <label>
            Email:{' '}
            <input
              type="email"
              required
              value={email}
              placeholder="Email"
              onChange={handleEmailChange}
            />
            {!isValidEmail && (
              <div style={{ color: 'red' }}>
                Please enter a valid email address
              </div>
            )}
          </label>
        </div>
        <div>
          <label>
            ProtectedData Name:{' '}
            <input
              type="text"
              value={name}
              placeholder="Name"
              onChange={handleNameChange}
            />{' '}
          </label>
        </div>
        {errorProtect && (
          <div style={{ marginTop: '10px', maxWidth: 300, color: 'red' }}>
            <h6>Creation failed</h6>
            {errorProtect}
          </div>
        )}
        {!loadingProtect ? (
          <button onClick={protectedDataSubmit}>Create</button>
        ) : (
          <img src={loader.src} alt="loading" height="30px" />
        )}

        <div>
        <button onClick={readProtectedData}>Read protected data</button>
        </div>
        {protectedData && !errorProtect && (
          <div style={{ marginTop: '4px' }}>
            <img
              src={successIcon.src}
              alt="success"
              height="30px"
              style={{ verticalAlign: 'middle' }}
            />
            Your data has been protected!
            <a
              href={IEXEC_EXPLORER_URL + protectedData}
              rel="noreferrer"
              target="_blank"
            >
              You can check it here
            </a>
            <p>
              Your protected data address: <span>{protectedData}</span>
            </p>
          </div>
        )}
      </div>


  
    </>
  );
}
